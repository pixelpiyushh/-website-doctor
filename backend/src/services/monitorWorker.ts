import { getDB } from '../db/index.js';
import { executeProbe } from './prober.js';
import { IncidentManager } from './incidentManager.js';
import { AlertService } from './alertService.js';
import { Response } from 'express';

// In-memory set of SSE client response streams
const sseClients = new Set<Response>();

export function registerSSEClient(res: Response) {
  sseClients.add(res);
  res.on('close', () => {
    sseClients.delete(res);
  });
}

export function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

let workerIntervalHandle: NodeJS.Timeout | null = null;

export function startMonitoringWorker(intervalMs: number = 15000) {
  if (workerIntervalHandle) return;

  console.log(`Starting continuous website monitoring worker (Poll interval: ${intervalMs}ms)...`);

  workerIntervalHandle = setInterval(async () => {
    try {
      await runMonitorCycle();
    } catch (err: any) {
      console.error('Error in monitor worker cycle:', err.message);
    }
  }, intervalMs);

  // Run initial pass immediately after 3s
  setTimeout(() => {
    runMonitorCycle().catch(() => {});
  }, 3000);
}

export async function stopMonitoringWorker() {
  if (workerIntervalHandle) {
    clearInterval(workerIntervalHandle);
    workerIntervalHandle = null;
  }
}

export async function runMonitorCycle() {
  const db = await getDB();
  const monitorsRes = await db.query(
    "SELECT * FROM monitors WHERE status != 'paused'"
  );

  const now = Date.now();

  for (const mon of monitorsRes.rows) {
    const lastChecked = mon.last_checked_at ? new Date(mon.last_checked_at).getTime() : 0;
    const intervalSec = mon.interval_seconds || 60;
    const elapsedSec = (now - lastChecked) / 1000;

    // Check if due
    if (elapsedSec >= intervalSec || !mon.last_checked_at) {
      await checkSingleMonitor(mon);
    }
  }
}

export async function checkSingleMonitor(mon: any) {
  const db = await getDB();
  
  let probe: any;
  if (mon.is_demo) {
    // Generate realistic demo telemetry variation
    const isDegraded = mon.id === 'mon_demo_apigateway';
    const baseRt = isDegraded ? 850 : 210;
    const rt = Math.floor(baseRt + Math.random() * 80);
    probe = {
      statusCode: 200,
      statusMessage: 'OK',
      responseTimeMs: rt,
      ttfbMs: Math.floor(rt * 0.7),
      isOnline: true,
      error: null,
    };
  } else {
    probe = await executeProbe(mon.url, {
      method: mon.http_method,
      timeoutMs: mon.timeout_ms,
      expectedStatusCode: mon.expected_status_code,
      keywordMatch: mon.keyword_match,
    });
  }

  const checkId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.query(`
    INSERT INTO monitor_checks (id, monitor_id, status_code, status_message, response_time_ms, ttfb_ms, is_online, error)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    checkId,
    mon.id,
    probe.statusCode,
    probe.statusMessage,
    probe.responseTimeMs,
    probe.ttfbMs,
    probe.isOnline,
    probe.error || null,
  ]);

  let newStatus: 'operational' | 'degraded' | 'down' = 'operational';
  let consecutiveFailures = mon.consecutive_failures || 0;

  if (!probe.isOnline) {
    newStatus = 'down';
    consecutiveFailures += 1;
  } else if (probe.responseTimeMs > 1000) {
    newStatus = 'degraded';
    consecutiveFailures = 0;
  } else {
    newStatus = 'operational';
    consecutiveFailures = 0;
  }

  // Calculate new rolling uptime percentage from last 100 checks
  const historyRes = await db.query(
    'SELECT is_online FROM monitor_checks WHERE monitor_id = $1 ORDER BY created_at DESC LIMIT 100',
    [mon.id]
  );
  const total = historyRes.rows.length;
  const onlineCount = historyRes.rows.filter((r) => r.is_online).length;
  const uptimePct = total > 0 ? Number(((onlineCount / total) * 100).toFixed(2)) : 100.0;

  await db.query(`
    UPDATE monitors
    SET status = $1, consecutive_failures = $2, last_checked_at = CURRENT_TIMESTAMP, uptime_pct = $3
    WHERE id = $4
  `, [newStatus, consecutiveFailures, uptimePct, mon.id]);

  // Incident Lifecycle Management
  const activeIncident = IncidentManager.getActiveIncidentForMonitor(mon.id);

  if (newStatus === 'down' && consecutiveFailures >= 2 && !activeIncident) {
    // Open new incident
    const inc = IncidentManager.createIncident({
      monitorId: mon.id,
      websiteUrl: mon.url,
      title: `${mon.name} is Unreachable`,
      cause: probe.error || `HTTP ${probe.statusCode} ${probe.statusMessage}`,
      severity: 'critical',
      initialEventMessage: `Monitor failed consecutive checks (${probe.statusCode || 'Timeout'})`,
    });

    AlertService.logAlert({
      type: 'website_down',
      title: `Website Down: ${mon.name}`,
      message: `${mon.url} failed ${consecutiveFailures} consecutive checks. ${probe.error || `Status: ${probe.statusCode}`}`,
      websiteUrl: mon.url,
      severity: 'critical',
    });

    broadcastSSE('incident_opened', inc);
  } else if (newStatus === 'operational' && activeIncident) {
    // Recovered! Auto-resolve incident
    const resolved = IncidentManager.resolveIncident(
      activeIncident.id,
      `Monitor successfully recovered with HTTP ${probe.statusCode} (${probe.responseTimeMs}ms)`
    );

    AlertService.logAlert({
      type: 'website_down',
      title: `Website Recovered: ${mon.name}`,
      message: `${mon.url} is now back online. Response time: ${probe.responseTimeMs}ms.`,
      websiteUrl: mon.url,
      severity: 'info',
    });

    broadcastSSE('incident_resolved', resolved);
  }

  // Broadcast telemetry update over SSE to active dashboards
  const updatePayload = {
    monitorId: mon.id,
    url: mon.url,
    status: newStatus,
    statusCode: probe.statusCode,
    responseTimeMs: probe.responseTimeMs,
    uptimePct,
    consecutiveFailures,
    lastCheckedAt: new Date().toISOString(),
  };

  broadcastSSE('monitor_update', updatePayload);
  return updatePayload;
}
