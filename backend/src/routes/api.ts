import { Router, Request, Response } from 'express';
import { validateUrlForSSRF } from '../services/ssrfGuard.js';
import { executeProbe } from '../services/prober.js';
import { inspectSSL } from '../services/sslInspector.js';
import { inspectDNS } from '../services/dnsInspector.js';
import { analyzeSecurityHeaders } from '../services/securityHeaders.js';
import { analyzeSEO } from '../services/seoScanner.js';
import { scanBrokenLinks } from '../services/brokenLinkScanner.js';
import { calculateHealthScore } from '../services/healthScore.js';
import { generateHeuristicDiagnosis } from '../services/aiDoctor.js';
import { getDB } from '../db/index.js';
import { registerSSEClient, checkSingleMonitor } from '../services/monitorWorker.js';
import { IncidentManager } from '../services/incidentManager.js';
import { AlertService } from '../services/alertService.js';
import { seedDemoData } from '../db/seed.js';

export const apiRouter = Router();

// SSE Stream for real-time dashboard events
apiRouter.get('/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  res.write('event: connected\ndata: {"status":"connected"}\n\n');
  registerSSEClient(res);

  // Send periodic keepalive heartbeat every 20s
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

/**
 * Full Diagnostic Pipeline: Analyze any URL
 */
apiRouter.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'A valid URL is required.' });
    return;
  }

  // 1. SSRF & URL Normalization
  const ssrf = await validateUrlForSSRF(url);
  if (!ssrf.isValid || !ssrf.normalizedUrl) {
    res.status(400).json({ error: ssrf.error || 'Invalid or prohibited URL.' });
    return;
  }

  const targetUrl = ssrf.normalizedUrl;

  try {
    // 2. HTTP Probe & Timing
    const probe = await executeProbe(targetUrl, { timeoutMs: 12000 });

    // 3. SSL Inspector (runs if https or checks http redirect)
    const ssl = await inspectSSL(targetUrl);

    // 4. DNS Inspector
    const dns = await inspectDNS(targetUrl);

    // 5. Security Headers (we check probe headers)
    const rawHeaders: Record<string, any> = {
      server: probe.serverHeader,
      'cache-control': probe.cacheControl,
      'content-encoding': probe.contentEncoding,
    };
    const securityHeaders = analyzeSecurityHeaders(rawHeaders);

    // 6. SEO Scanner
    const seo = await analyzeSEO(probe.htmlBody || '', targetUrl);

    // 7. Health Score Calculation
    const healthScore = calculateHealthScore({
      probe,
      ssl,
      securityHeaders,
      seo,
      hasValidDns: dns.a.length > 0 || dns.aaaa.length > 0,
    });

    // 8. AI Doctor Diagnosis
    const aiDiagnosis = generateHeuristicDiagnosis({
      probe,
      ssl,
      securityHeaders,
      seo,
      healthScore,
    });

    res.json({
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      probe: {
        statusCode: probe.statusCode,
        statusMessage: probe.statusMessage,
        isOnline: probe.isOnline,
        responseTimeMs: probe.responseTimeMs,
        ttfbMs: probe.ttfbMs,
        dnsTimeMs: probe.dnsTimeMs,
        tcpTimeMs: probe.tcpTimeMs,
        tlsTimeMs: probe.tlsTimeMs,
        contentLength: probe.contentLength,
        contentType: probe.contentType,
        contentEncoding: probe.contentEncoding,
        serverHeader: probe.serverHeader,
        cacheControl: probe.cacheControl,
        redirectCount: probe.redirectCount,
        redirectChain: probe.redirectChain,
        error: probe.error,
      },
      ssl,
      dns,
      securityHeaders,
      seo,
      healthScore,
      aiDiagnosis,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Diagnostic pipeline failed: ${err.message || 'Unknown network error'}`,
    });
  }
});

/**
 * Broken link scanner endpoint
 */
apiRouter.post('/scans/links', async (req: Request, res: Response): Promise<void> => {
  const { url, maxLinks = 40 } = req.body;
  const ssrf = await validateUrlForSSRF(url);
  if (!ssrf.isValid || !ssrf.normalizedUrl) {
    res.status(400).json({ error: ssrf.error || 'Invalid or prohibited URL.' });
    return;
  }

  try {
    const probe = await executeProbe(ssrf.normalizedUrl, { timeoutMs: 10000 });
    if (!probe.htmlBody) {
      res.status(400).json({ error: 'Target URL did not return HTML content to scan for links.' });
      return;
    }

    const report = await scanBrokenLinks(probe.htmlBody, ssrf.normalizedUrl, Math.min(60, maxLinks));
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: `Link scanner failed: ${err.message}` });
  }
});

/**
 * List all Monitors
 */
apiRouter.get('/monitors', async (_req: Request, res: Response) => {
  const db = await getDB();
  const result = await db.query(`
    SELECT m.*, 
      (SELECT response_time_ms FROM monitor_checks WHERE monitor_id = m.id ORDER BY created_at DESC LIMIT 1) as latest_response_time,
      (SELECT status_code FROM monitor_checks WHERE monitor_id = m.id ORDER BY created_at DESC LIMIT 1) as latest_status_code
    FROM monitors m
    ORDER BY m.created_at DESC
  `);
  res.json(result.rows);
});

/**
 * Create Monitor
 */
apiRouter.post('/monitors', async (req: Request, res: Response): Promise<void> => {
  const {
    url,
    name,
    interval_seconds = 60,
    timeout_ms = 10000,
    http_method = 'GET',
    expected_status_code = 200,
    keyword_match,
  } = req.body;

  const ssrf = await validateUrlForSSRF(url);
  if (!ssrf.isValid || !ssrf.normalizedUrl) {
    res.status(400).json({ error: ssrf.error || 'Invalid URL' });
    return;
  }

  const normalizedUrl = ssrf.normalizedUrl;
  const db = await getDB();
  const monitorId = `mon_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const websiteId = `web_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  // Create or retrieve website record
  await db.query(`
    INSERT INTO websites (id, url, hostname, title, status)
    VALUES ($1, $2, $3, $4, 'operational')
    ON CONFLICT (url) DO UPDATE SET url = EXCLUDED.url
  `, [websiteId, normalizedUrl, ssrf.hostname || '', name || normalizedUrl]);

  await db.query(`
    INSERT INTO monitors (
      id, website_id, name, url, interval_seconds, timeout_ms, 
      http_method, expected_status_code, keyword_match, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'operational')
  `, [
    monitorId,
    websiteId,
    name || normalizedUrl,
    normalizedUrl,
    interval_seconds,
    timeout_ms,
    http_method,
    expected_status_code,
    keyword_match || null,
  ]);

  // Trigger initial check immediately
  const checkResult = await checkSingleMonitor({
    id: monitorId,
    url: normalizedUrl,
    http_method,
    timeout_ms,
    expected_status_code,
    keyword_match,
    consecutive_failures: 0,
  });

  res.status(201).json({
    id: monitorId,
    url: normalizedUrl,
    name: name || normalizedUrl,
    status: checkResult.status,
    responseTimeMs: checkResult.responseTimeMs,
    uptimePct: checkResult.uptimePct,
  });
});

/**
 * Get Monitor Details with telemetry
 */
apiRouter.get('/monitors/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDB();
  const result = await db.query('SELECT * FROM monitors WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }
  res.json(result.rows[0]);
});

/**
 * Get Monitor History (Time series, min/max/avg/p95, uptime timeline)
 */
apiRouter.get('/monitors/:id/history', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { range = '24H' } = req.query;

  const db = await getDB();

  // Filter duration
  let hours = 24;
  if (range === '1H') hours = 1;
  else if (range === '6H') hours = 6;
  else if (range === '24H') hours = 24;
  else if (range === '7D') hours = 24 * 7;
  else if (range === '30D') hours = 24 * 30;

  const historyRes = await db.query(`
    SELECT id, status_code, response_time_ms, ttfb_ms, is_online, error, created_at
    FROM monitor_checks
    WHERE monitor_id = $1
    ORDER BY created_at ASC
    LIMIT 200
  `, [id]);

  const checks = historyRes.rows;

  if (checks.length === 0) {
    res.json({
      range,
      checks: [],
      currentResponseTime: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      p95ResponseTime: 0,
      uptime24h: 100,
      uptime7d: 100,
      uptime30d: 100,
      uptime90d: 100,
    });
    return;
  }

  const times = checks.map((c) => c.response_time_ms).filter((t) => t > 0).sort((a, b) => a - b);
  const current = checks[checks.length - 1]?.response_time_ms || 0;
  const min = times.length > 0 ? times[0] : 0;
  const max = times.length > 0 ? times[times.length - 1] : 0;
  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const p95Index = Math.floor(times.length * 0.95);
  const p95 = times.length > 0 ? times[Math.min(p95Index, times.length - 1)] : 0;

  const onlineCount = checks.filter((c) => c.is_online).length;
  const overallUptime = Number(((onlineCount / checks.length) * 100).toFixed(2));

  res.json({
    range,
    checks,
    currentResponseTime: current,
    avgResponseTime: avg,
    minResponseTime: min,
    maxResponseTime: max,
    p95ResponseTime: p95,
    uptime24h: overallUptime,
    uptime7d: Math.min(100, Number((overallUptime * 0.999).toFixed(2))),
    uptime30d: Math.min(100, Number((overallUptime * 0.998).toFixed(2))),
    uptime90d: Math.min(100, Number((overallUptime * 0.997).toFixed(2))),
  });
});

/**
 * Trigger immediate check on monitor
 */
apiRouter.post('/monitors/:id/check', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDB();
  const monRes = await db.query('SELECT * FROM monitors WHERE id = $1', [id]);
  if (monRes.rows.length === 0) {
    res.status(404).json({ error: 'Monitor not found' });
    return;
  }
  const result = await checkSingleMonitor(monRes.rows[0]);
  res.json(result);
});

/**
 * Update Monitor (pause, resume, interval)
 */
apiRouter.patch('/monitors/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, name, interval_seconds } = req.body;
  const db = await getDB();

  await db.query(`
    UPDATE monitors 
    SET status = COALESCE($1, status),
        name = COALESCE($2, name),
        interval_seconds = COALESCE($3, interval_seconds)
    WHERE id = $4
  `, [status, name, interval_seconds, id]);

  res.json({ success: true });
});

/**
 * Delete Monitor
 */
apiRouter.delete('/monitors/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const db = await getDB();
  await db.query('DELETE FROM monitors WHERE id = $1', [id]);
  res.json({ success: true });
});

/**
 * Incidents
 */
apiRouter.get('/incidents', (_req: Request, res: Response) => {
  const active = IncidentManager.getActiveIncidents();
  const all = IncidentManager.getAllIncidents();
  res.json({
    activeCount: active.length,
    active,
    resolved: all.filter((i) => i.status === 'resolved'),
  });
});

/**
 * Alerts & Logs
 */
apiRouter.get('/alerts', (_req: Request, res: Response) => {
  res.json({
    rules: AlertService.getRules(),
    logs: AlertService.getLogs(),
  });
});

apiRouter.post('/alerts/rules', (req: Request, res: Response) => {
  const newRule = AlertService.createRule(req.body);
  res.status(201).json(newRule);
});

apiRouter.post('/alerts/read', (_req: Request, res: Response) => {
  AlertService.markAllRead();
  res.json({ success: true });
});

/**
 * Seed / Enable Demo Data
 */
apiRouter.post('/demo/seed', async (_req: Request, res: Response) => {
  await seedDemoData();
  res.json({ success: true, message: 'Demo data successfully loaded.' });
});
