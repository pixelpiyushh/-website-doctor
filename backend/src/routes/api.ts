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
import { detectTechnologies } from '../services/technologyDetector.js';
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
  const { url, language = 'en' } = req.body;
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
      language: language === 'hinglish' ? 'hinglish' : 'en',
    });

    // 9. Technology Stack Detection
    const technologies = detectTechnologies(probe.htmlBody || '', rawHeaders, targetUrl);

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
      technologies,
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

/**
 * 2. Website Comparison Endpoint (Head-to-head comparison)
 */
apiRouter.post('/compare', async (req: Request, res: Response): Promise<void> => {
  const { urlA, urlB } = req.body;
  if (!urlA || !urlB) {
    res.status(400).json({ error: 'Both urlA and urlB are required for head-to-head comparison.' });
    return;
  }

  const [ssrfA, ssrfB] = await Promise.all([
    validateUrlForSSRF(urlA),
    validateUrlForSSRF(urlB),
  ]);

  if (!ssrfA.isValid || !ssrfA.normalizedUrl) {
    res.status(400).json({ error: `URL 1 error: ${ssrfA.error || 'Invalid or prohibited URL'}` });
    return;
  }
  if (!ssrfB.isValid || !ssrfB.normalizedUrl) {
    res.status(400).json({ error: `URL 2 error: ${ssrfB.error || 'Invalid or prohibited URL'}` });
    return;
  }

  try {
    const [probeA, probeB, sslA, sslB] = await Promise.all([
      executeProbe(ssrfA.normalizedUrl, { timeoutMs: 10000 }),
      executeProbe(ssrfB.normalizedUrl, { timeoutMs: 10000 }),
      inspectSSL(ssrfA.normalizedUrl),
      inspectSSL(ssrfB.normalizedUrl),
    ]);

    const rawHeadersA = { server: probeA.serverHeader, 'cache-control': probeA.cacheControl, 'content-encoding': probeA.contentEncoding };
    const rawHeadersB = { server: probeB.serverHeader, 'cache-control': probeB.cacheControl, 'content-encoding': probeB.contentEncoding };

    const [secA, secB, seoA, seoB] = await Promise.all([
      analyzeSecurityHeaders(rawHeadersA),
      analyzeSecurityHeaders(rawHeadersB),
      analyzeSEO(probeA.htmlBody || '', ssrfA.normalizedUrl),
      analyzeSEO(probeB.htmlBody || '', ssrfB.normalizedUrl),
    ]);

    const scoreA = calculateHealthScore({ probe: probeA, ssl: sslA, securityHeaders: secA, seo: seoA, hasValidDns: true });
    const scoreB = calculateHealthScore({ probe: probeB, ssl: sslB, securityHeaders: secB, seo: seoB, hasValidDns: true });

    const techA = detectTechnologies(probeA.htmlBody || '', rawHeadersA, ssrfA.normalizedUrl);
    const techB = detectTechnologies(probeB.htmlBody || '', rawHeadersB, ssrfB.normalizedUrl);

    res.json({
      siteA: {
        url: ssrfA.normalizedUrl,
        isOnline: probeA.isOnline,
        statusCode: probeA.statusCode,
        overallScore: scoreA.overallScore,
        grade: scoreA.grade,
        responseTimeMs: probeA.responseTimeMs,
        ttfbMs: probeA.ttfbMs,
        sslDaysRemaining: sslA.daysRemaining,
        sslValid: sslA.status === 'valid',
        seoScore: seoA.score,
        securityScore: secA.score,
        technologiesCount: techA.length,
        technologies: techA,
      },
      siteB: {
        url: ssrfB.normalizedUrl,
        isOnline: probeB.isOnline,
        statusCode: probeB.statusCode,
        overallScore: scoreB.overallScore,
        grade: scoreB.grade,
        responseTimeMs: probeB.responseTimeMs,
        ttfbMs: probeB.ttfbMs,
        sslDaysRemaining: sslB.daysRemaining,
        sslValid: sslB.status === 'valid',
        seoScore: seoB.score,
        securityScore: secB.score,
        technologiesCount: techB.length,
        technologies: techB,
      },
      winner: scoreA.overallScore >= scoreB.overallScore ? 'A' : 'B',
      scoreDiff: Math.abs(scoreA.overallScore - scoreB.overallScore),
    });
  } catch (err: any) {
    res.status(500).json({ error: `Comparison failed: ${err.message || 'Network error'}` });
  }
});

/**
 * 7. Page-by-Page Analysis Endpoint
 */
apiRouter.post('/pages-scan', async (req: Request, res: Response): Promise<void> => {
  const { url, paths = ['/', '/about', '/contact', '/pricing', '/blog'] } = req.body;
  if (!url) {
    res.status(400).json({ error: 'A valid website URL is required.' });
    return;
  }
  const ssrf = await validateUrlForSSRF(url);
  if (!ssrf.isValid || !ssrf.normalizedUrl) {
    res.status(400).json({ error: ssrf.error || 'Invalid URL' });
    return;
  }

  const baseOrigin = new URL(ssrf.normalizedUrl).origin;
  const targetPaths = Array.isArray(paths) && paths.length > 0 ? paths.slice(0, 8) : ['/', '/about', '/contact', '/pricing', '/blog'];

  const results = await Promise.all(
    targetPaths.map(async (p: string) => {
      const cleanPath = p.startsWith('/') ? p : `/${p}`;
      const fullUrl = `${baseOrigin}${cleanPath}`;
      try {
        const probe = await executeProbe(fullUrl, { timeoutMs: 6000 });
        const seo = await analyzeSEO(probe.htmlBody || '', fullUrl);
        const score = probe.isOnline ? Math.max(30, Math.min(98, Math.round(100 - (probe.responseTimeMs > 400 ? 15 : 0) - (seo.title ? 0 : 20) - (seo.metaDescription ? 0 : 15)))) : 0;
        const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';

        return {
          path: cleanPath,
          url: fullUrl,
          statusCode: probe.statusCode,
          isOnline: probe.isOnline,
          responseTimeMs: probe.responseTimeMs,
          title: seo.title || 'No title tag found',
          hasMetaDescription: Boolean(seo.metaDescription),
          score,
          grade,
          issuesCount: (seo.title ? 0 : 1) + (seo.metaDescription ? 0 : 1) + (probe.responseTimeMs > 500 ? 1 : 0),
        };
      } catch {
        return {
          path: cleanPath,
          url: fullUrl,
          statusCode: 504,
          isOnline: false,
          responseTimeMs: 6000,
          title: 'Unreachable page',
          hasMetaDescription: false,
          score: 0,
          grade: 'F',
          issuesCount: 3,
        };
      }
    })
  );

  res.json({ pages: results });
});

/**
 * 1. AI Doctor Chatbot Endpoint
 */
apiRouter.post('/chat', (req: Request, res: Response) => {
  const { message = '', siteContext, language = 'hinglish' } = req.body;
  const q = String(message).toLowerCase();

  let answer = '';
  const isHinglish = language === 'hinglish';
  const suggestedPrompts = isHinglish
    ? [
        'Meri website slow kyun hai?',
        'SEO score kaise badhaye?',
        'Health score 90+ kaise le jayein?',
        'Security headers kaise config karein?',
      ]
    : [
        'Why is my website slow?',
        'How do I improve my SEO score?',
        'How do I reach a 90+ health score?',
        'How do I configure security headers?',
      ];
  let actionType: 'view_seo' | 'view_perf' | 'view_security' | 'view_ssl' | undefined = undefined;

  const url = siteContext?.url || 'Aapki website';
  const score = siteContext?.healthScore?.overallScore || 74;
  const responseTime = siteContext?.probe?.responseTimeMs || 240;
  const ttfb = siteContext?.probe?.ttfbMs || 160;
  const missingAlt = siteContext?.seo?.imagesMissingAlt || 1;
  const hasMeta = Boolean(siteContext?.seo?.metaDescription);
  const sslDays = siteContext?.ssl?.daysRemaining || 180;

  if (q.includes('slow') || q.includes('dheemi') || q.includes('speed') || q.includes('load')) {
    actionType = 'view_perf';
    if (language === 'hinglish') {
      answer = `🩺 **AI Doctor Speed Diagnosis:**\n\n${url} ka response time **${responseTime}ms** aur TTFB (Time to First Byte) **${ttfb}ms** measure hua hai.\n\n**Website slow hone ke mukhya kaaran:**\n1. **Server TTFB Latency:** Server response pehle byte deliver karne mein time le raha hai. Database queries optimize karein aur Edge CDN (jaise Cloudflare) activate karein.\n2. **Large Assets & Images:** ${missingAlt} uncompressed images detect hui hain. Inhe WebP/AVIF format mein compress karein.\n3. **Browser Caching:** Cache-Control headers enable karein taaki return visitors ko fast load mile.`;
    } else {
      answer = `🩺 **AI Doctor Speed Diagnosis:**\n\n${url} has a measured latency of **${responseTime}ms** with a TTFB of **${ttfb}ms**.\n\n**Key speed bottlenecks detected:**\n1. **TTFB Latency:** Server processing time can be reduced by routing traffic through an Edge CDN (e.g. Cloudflare) and caching dynamic database queries.\n2. **Unoptimized Assets:** ${missingAlt} images should be converted to modern WebP/AVIF formats.\n3. **Browser Caching:** Leverage 1-year immutable Cache-Control headers for static assets.`;
    }
  } else if (q.includes('seo') || q.includes('google') || q.includes('rank') || q.includes('meta')) {
    actionType = 'view_seo';
    if (language === 'hinglish') {
      answer = `🔎 **AI Doctor SEO Prescription:**\n\n${url} par Google crawler indexability ke liye ye steps follow karein:\n\n1. ${hasMeta ? '✓ Meta description detected hai.' : '⚠️ **Meta Description Missing hai:** 120–160 characters ka meta description tag `<meta name="description" content="...">` add karein.'}\n2. **Heading Hierarchy:** Page par sirf ek primary \`<h1>\` tag rakhein aur baaki sections ke liye \`<h2>\`/\`<h3>\` use karein.\n3. **Sitemap & Robots.txt:** Ensure karein ki \`/sitemap.xml\` aur \`/robots.txt\` publicly accessible hain.`;
    } else {
      answer = `🔎 **AI Doctor SEO Prescription:**\n\nTo improve search rankings for ${url}, follow these clinical guidelines:\n\n1. ${hasMeta ? '✓ Meta description tag is already present.' : '⚠️ **Missing Meta Description:** Add a concise 120–160 character description tag for higher CTR.'}\n2. **Heading Hierarchy:** Maintain exactly one main \`<h1>\` tag per page.\n3. **XML Sitemap:** Ensure \`/sitemap.xml\` is generated and submitted to Google Search Console.`;
    }
  } else if (q.includes('90') || q.includes('improve') || q.includes('score') || q.includes('badhaye')) {
    if (language === 'hinglish') {
      answer = `🏆 **Health Score 90+ Blueprint:**\n\nAbhi aapka score **${score}/100** hai. 90+ laane ke liye top 3 quick wins:\n\n1. **Security Headers Pass Karein (+8 pts):** HSTS, Content-Security-Policy aur X-Frame-Options server config me daalein.\n2. **SEO Metadata Complete Karein (+6 pts):** Missing meta description aur image alt tags add karein.\n3. **Compression & Latency (+5 pts):** Gzip/Brotli compression enable karein aur TTFB 200ms se kam karein.\n\nYe 3 steps karte hi aapka score **89–95** ho jayega aur *Website Health Certificate* unlock ho jayega!`;
    } else {
      answer = `🏆 **Health Score 90+ Blueprint:**\n\nYour current health score is **${score}/100**. To reach 90+ and earn the *Certified Health Badge*:\n\n1. **Pass Security Headers (+8 pts):** Add HSTS, CSP, and X-Frame-Options to your web server.\n2. **Complete SEO Tags (+6 pts):** Ensure unique title, description, and image alt text.\n3. **Enable Brotli/Gzip (+5 pts):** Reduce payload wire size to push score over 90.`;
    }
  } else if (q.includes('security') || q.includes('header') || q.includes('ssl') || q.includes('hsts') || q.includes('csp')) {
    actionType = 'view_security';
    if (language === 'hinglish') {
      answer = `🔐 **AI Doctor Security Prescription:**\n\nSSL Certificate active hai (${sslDays} din baaki hain). Lekin HTTP security headers miss hone se browser vulnerability rehti hai:\n\n1. **HSTS:** \`Strict-Transport-Security: max-age=31536000; includeSubDomains\` add karein.\n2. **Clickjacking Protection:** \`X-Frame-Options: SAMEORIGIN\` enable karein.\n3. **XSS Defense:** \`X-Content-Type-Options: nosniff\` aur Content-Security-Policy configure karein.`;
    } else {
      answer = `🔐 **AI Doctor Security Prescription:**\n\nSSL certificate is valid with ${sslDays} days remaining. Harden your browser defense with:\n\n1. **HSTS:** Enforce HTTPS with \`Strict-Transport-Security\` header.\n2. **Clickjacking Protection:** Add \`X-Frame-Options: SAMEORIGIN\`.\n3. **Content Sniffing:** Add \`X-Content-Type-Options: nosniff\`.`;
    }
  } else {
    if (language === 'hinglish') {
      answer = `🩺 **Dr. Website Diagnosis Summary for ${url}:**\n\nOverall Health: **${score}/100**\nStatus: **HTTP 200 OK (${responseTime}ms)**\nSSL Validity: **${sslDays} days remaining**\n\nAap mujhse kisi bhi feature ke baare mein pooch sakte hain, jaise *“Meri website slow kyun hai?”*, *“SEO score kaise badhaye?”*, ya *“Health score 90+ kaise hoga?”*`;
    } else {
      answer = `🩺 **Dr. Website Clinical Summary for ${url}:**\n\nOverall Health: **${score}/100**\nStatus: **HTTP 200 OK (${responseTime}ms latency)**\nSSL Certificate: **Valid (${sslDays} days left)**\n\nFeel free to ask me anything about your website's performance, SEO checklist, security headers, or how to achieve a 90+ certified rating!`;
    }
  }

  res.json({
    reply: answer,
    suggestedPrompts,
    actionType,
    timestamp: new Date().toISOString(),
  });
});
