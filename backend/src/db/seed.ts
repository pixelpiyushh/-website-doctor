import { getDB } from './index.js';
import { IncidentManager } from '../services/incidentManager.js';
import { AlertService } from '../services/alertService.js';

export async function seedDemoData() {
  const db = await getDB();

  // Check if demo monitors exist
  const existing = await db.query("SELECT COUNT(*) as count FROM monitors WHERE is_demo = TRUE");
  const count = parseInt(existing.rows[0]?.count || '0', 10);
  if (count > 0) {
    console.log(`Demo data already seeded (${count} demo monitors exist).`);
    return;
  }

  console.log('Seeding realistic demo website monitors and telemetry...');

  // 1. Operational E-Commerce Store
  const web1Id = 'web_demo_ecommerce';
  const mon1Id = 'mon_demo_ecommerce';
  await db.query(`
    INSERT INTO websites (id, url, hostname, title, status, last_checked_at, health_score)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    ON CONFLICT (id) DO NOTHING;
  `, [web1Id, 'https://demo-store.example.com', 'demo-store.example.com', 'Aura Luxury Goods Store', 'operational', 94]);

  await db.query(`
    INSERT INTO monitors (id, website_id, name, url, interval_seconds, timeout_ms, http_method, expected_status_code, status, consecutive_failures, last_checked_at, uptime_pct, is_demo)
    VALUES ($1, $2, $3, $4, 60, 10000, 'GET', 200, 'operational', 0, CURRENT_TIMESTAMP, 99.98, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [mon1Id, web1Id, 'Storefront Main API', 'https://demo-store.example.com']);

  // 2. Degraded API Gateway (High Latency)
  const web2Id = 'web_demo_apigateway';
  const mon2Id = 'mon_demo_apigateway';
  await db.query(`
    INSERT INTO websites (id, url, hostname, title, status, last_checked_at, health_score)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    ON CONFLICT (id) DO NOTHING;
  `, [web2Id, 'https://api-gateway.internal-demo.net/v1/health', 'api-gateway.internal-demo.net', 'Global Microservices Gateway', 'degraded', 72]);

  await db.query(`
    INSERT INTO monitors (id, website_id, name, url, interval_seconds, timeout_ms, http_method, expected_status_code, status, consecutive_failures, last_checked_at, uptime_pct, is_demo)
    VALUES ($1, $2, $3, $4, 30, 8000, 'GET', 200, 'degraded', 0, CURRENT_TIMESTAMP, 98.40, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [mon2Id, web2Id, 'Payments & Checkout API', 'https://api-gateway.internal-demo.net/v1/health']);

  // 3. Blog with Expiring SSL Certificate
  const web3Id = 'web_demo_blog';
  const mon3Id = 'mon_demo_blog';
  await db.query(`
    INSERT INTO websites (id, url, hostname, title, status, last_checked_at, health_score)
    VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
    ON CONFLICT (id) DO NOTHING;
  `, [web3Id, 'https://tech-blog.example.io', 'tech-blog.example.io', 'Tech Pulse Engineering Blog', 'operational', 81]);

  await db.query(`
    INSERT INTO monitors (id, website_id, name, url, interval_seconds, timeout_ms, http_method, expected_status_code, status, consecutive_failures, last_checked_at, uptime_pct, is_demo)
    VALUES ($1, $2, $3, $4, 120, 10000, 'GET', 200, 'operational', 0, CURRENT_TIMESTAMP, 99.45, TRUE)
    ON CONFLICT (id) DO NOTHING;
  `, [mon3Id, web3Id, 'Corporate Engineering Blog', 'https://tech-blog.example.io']);

  // Generate historical checks for mon1 (50 checks across time)
  const now = Date.now();
  for (let i = 50; i >= 0; i--) {
    const timestamp = new Date(now - i * 3 * 60 * 1000).toISOString();
    const rt = Math.floor(180 + Math.random() * 95);
    const ttfb = Math.floor(rt * 0.7);
    const checkId = `chk_demo_1_${i}`;
    await db.query(`
      INSERT INTO monitor_checks (id, monitor_id, status_code, status_message, response_time_ms, ttfb_ms, is_online, created_at)
      VALUES ($1, $2, 200, 'OK', $3, $4, TRUE, $5)
      ON CONFLICT (id) DO NOTHING;
    `, [checkId, mon1Id, rt, ttfb, timestamp]);
  }

  // Generate historical checks for mon2 (degraded spikes)
  for (let i = 50; i >= 0; i--) {
    const timestamp = new Date(now - i * 3 * 60 * 1000).toISOString();
    // Simulate periodic latency degradation (800ms - 1450ms)
    const isSpike = i > 15 && i < 24;
    const rt = isSpike ? Math.floor(1100 + Math.random() * 450) : Math.floor(450 + Math.random() * 200);
    const code = isSpike && i === 20 ? 504 : 200;
    const isOnline = code === 200;
    const checkId = `chk_demo_2_${i}`;
    await db.query(`
      INSERT INTO monitor_checks (id, monitor_id, status_code, status_message, response_time_ms, ttfb_ms, is_online, error, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING;
    `, [checkId, mon2Id, code, isOnline ? 'OK' : 'Gateway Timeout', rt, Math.floor(rt * 0.8), isOnline, isOnline ? null : 'Upstream service timed out', timestamp]);
  }

  // Seed sample Incident in IncidentManager and DB
  const pastIncident = IncidentManager.createIncident({
    monitorId: mon2Id,
    websiteUrl: 'https://api-gateway.internal-demo.net/v1/health',
    title: 'Upstream Database Connection Pool Exhaustion',
    cause: 'HTTP 504 Gateway Timeout during peak traffic',
    severity: 'critical',
    initialEventMessage: 'Gateway became unreachable and returned HTTP 504',
  });
  IncidentManager.addTimelineEvent(pastIncident.id, 'Second consecutive check failed (Timeout > 8000ms)', 'critical');
  IncidentManager.addTimelineEvent(pastIncident.id, 'Incident alert notification dispatched to on-call engineering', 'warning');
  IncidentManager.resolveIncident(pastIncident.id, 'Upstream replica recovered; response time normalized to 480ms');

  // Seed sample Alert Events
  AlertService.logAlert({
    type: 'response_time_high',
    title: 'Latency Threshold Exceeded',
    message: 'Payments API response time reached 1,420ms (Threshold: 1,200ms)',
    websiteUrl: 'https://api-gateway.internal-demo.net/v1/health',
    severity: 'warning',
  });
  AlertService.logAlert({
    type: 'website_down',
    title: 'HTTP 504 Gateway Timeout',
    message: 'Global Gateway failed health probe check',
    websiteUrl: 'https://api-gateway.internal-demo.net/v1/health',
    severity: 'critical',
  });
  AlertService.logAlert({
    type: 'ssl_expiring',
    title: 'SSL Certificate Expiring Soon',
    message: 'Certificate for tech-blog.example.io expires in 11 days (Issuer: Let\'s Encrypt)',
    websiteUrl: 'https://tech-blog.example.io',
    severity: 'warning',
  });

  console.log('Demo data successfully initialized.');
}
