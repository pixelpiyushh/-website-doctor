import { ProbeResult } from './prober.js';
import { SSLCheckResult } from './sslInspector.js';
import { SecurityHeadersReport } from './securityHeaders.js';
import { SEOReport } from './seoScanner.js';
import { BrokenLinksReport } from './brokenLinkScanner.js';
import { HealthScoreCalculation } from './healthScore.js';
import { CONFIG } from '../config.js';

export interface AIDoctorProblem {
  id: string;
  severity: 'critical' | 'warning' | 'optimization';
  title: string;
  description: string;
  measuredFact: string;
}

export interface AIDoctorAction {
  id: string;
  priority: number;
  title: string;
  rationale: string;
  implementationCodeSnippet?: string;
}

export interface AIDoctorDiagnosis {
  headline: string;
  clinicalAssessment: string;
  vitalSigns: {
    availability: string;
    responseTime: string;
    sslHealth: string;
    securityPosture: string;
    seoReadiness: string;
  };
  problemsDetected: AIDoctorProblem[];
  recommendedActions: AIDoctorAction[];
  generatedBy: 'Expert Heuristic Engine' | 'LLM Telemetry Engine';
  insufficientData: boolean;
  timestamp: string;
}

/**
 * Deterministic Expert Rules Engine that analyzes only factual measured data.
 */
export function generateHeuristicDiagnosis(data: {
  probe?: ProbeResult;
  ssl?: SSLCheckResult;
  securityHeaders?: SecurityHeadersReport;
  seo?: SEOReport;
  brokenLinks?: BrokenLinksReport;
  healthScore?: HealthScoreCalculation;
}): AIDoctorDiagnosis {
  const { probe, ssl, securityHeaders, seo, brokenLinks, healthScore } = data;

  if (!probe) {
    return {
      headline: 'Insufficient Data',
      clinicalAssessment: 'Insufficient data to determine this. No probe telemetry has been gathered for this target.',
      vitalSigns: {
        availability: 'Unknown',
        responseTime: 'Not measured',
        sslHealth: 'Not measured',
        securityPosture: 'Not measured',
        seoReadiness: 'Not measured',
      },
      problemsDetected: [],
      recommendedActions: [],
      generatedBy: 'Expert Heuristic Engine',
      insufficientData: true,
      timestamp: new Date().toISOString(),
    };
  }

  const problems: AIDoctorProblem[] = [];
  const actions: AIDoctorAction[] = [];
  let actionCounter = 1;

  // 1. Availability issues
  if (!probe.isOnline || probe.statusCode >= 500) {
    problems.push({
      id: 'down-5xx',
      severity: 'critical',
      title: 'Website is Offline or Returning Server Errors',
      description: `The website failed health checks with status code ${probe.statusCode || 'Connection Error'} (${probe.statusMessage || probe.error}).`,
      measuredFact: `Measured status: ${probe.statusCode} ${probe.statusMessage}`,
    });
    actions.push({
      id: `act-${actionCounter++}`,
      priority: 1,
      title: 'Inspect Web Server and Application Error Logs',
      rationale: 'Verify the origin server service (Node, Nginx, PHP, Gunicorn) is running and check error logs.',
      implementationCodeSnippet: 'systemctl status nginx\njournalctl -u your-service -n 50 --no-pager',
    });
  } else if (probe.statusCode >= 400) {
    problems.push({
      id: 'client-4xx',
      severity: 'warning',
      title: `Origin Returned Client Error ${probe.statusCode}`,
      description: `The server responded with HTTP ${probe.statusCode} (${probe.statusMessage}). The requested path or configuration may be incorrect.`,
      measuredFact: `HTTP ${probe.statusCode}`,
    });
    actions.push({
      id: `act-${actionCounter++}`,
      priority: 2,
      title: 'Verify URL Routing and Public Access Permissions',
      rationale: `Ensure the URL requested is accessible publicly without unauthorized restrictions.`,
    });
  }

  // 2. Response Time / Performance
  if (probe.responseTimeMs > 1200) {
    problems.push({
      id: 'high-latency',
      severity: 'critical',
      title: 'Elevated Response Latency',
      description: `Server response time is ${probe.responseTimeMs}ms, exceeding the recommended 600ms threshold.`,
      measuredFact: `${probe.responseTimeMs}ms TTFB/response duration`,
    });
    actions.push({
      id: `act-${actionCounter++}`,
      priority: 2,
      title: 'Implement Edge Caching and Optimize Backend Database Queries',
      rationale: 'A response time above 1.2s typically indicates heavy database queries or un-cached server-side rendering.',
      implementationCodeSnippet: '# Nginx fastcgi/proxy cache example:\nproxy_cache_valid 200 302 10m;\nproxy_cache_use_stale error timeout updating;',
    });
  } else if (probe.responseTimeMs > 600) {
    problems.push({
      id: 'moderate-latency',
      severity: 'warning',
      title: 'Suboptimal Response Time',
      description: `Response time was measured at ${probe.responseTimeMs}ms. Consider CDN caching or compression to reach < 300ms.`,
      measuredFact: `${probe.responseTimeMs}ms response time`,
    });
  }

  // 3. SSL Health
  if (ssl) {
    if (ssl.status === 'expired') {
      problems.push({
        id: 'ssl-expired',
        severity: 'critical',
        title: 'SSL Certificate Has Expired',
        description: `The SSL certificate expired on ${ssl.validTo}. Visitors will see high-risk browser warning screens.`,
        measuredFact: `Certificate expired on ${ssl.validTo}`,
      });
      actions.push({
        id: `act-${actionCounter++}`,
        priority: 1,
        title: 'Renew and Reload SSL Certificate Immediately',
        rationale: 'Expired certificates break HTTPS navigation and trigger security blocks.',
        implementationCodeSnippet: 'sudo certbot renew --force-renewal\nsudo systemctl reload nginx',
      });
    } else if (ssl.status === 'expiring_soon') {
      problems.push({
        id: 'ssl-expiring',
        severity: 'warning',
        title: `SSL Certificate Expiring in ${ssl.daysRemaining} Days`,
        description: `The certificate issued by ${ssl.issuer} expires on ${ssl.validTo}.`,
        measuredFact: `${ssl.daysRemaining} days remaining`,
      });
      actions.push({
        id: `act-${actionCounter++}`,
        priority: 2,
        title: 'Verify Automatic Certificate Renewal Setup',
        rationale: 'Ensure ACME renewal cron jobs or Certbot systemd timers are active.',
        implementationCodeSnippet: 'sudo certbot renew --dry-run',
      });
    }

    if (!ssl.httpToHttpsRedirect) {
      problems.push({
        id: 'no-https-redirect',
        severity: 'warning',
        title: 'Missing Automatic HTTP to HTTPS Redirect',
        description: 'Requests to http:// do not automatically redirect to https://, leaving unencrypted connections possible.',
        measuredFact: 'HTTP port 80 did not redirect to HTTPS',
      });
      actions.push({
        id: `act-${actionCounter++}`,
        priority: 3,
        title: 'Enforce Permanent 301 Redirect to HTTPS',
        rationale: 'Protect visitors from unencrypted traffic by redirecting all HTTP requests.',
        implementationCodeSnippet: '# Nginx redirect block:\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}',
      });
    }
  }

  // 4. Security Headers
  if (securityHeaders) {
    const missingHeaders = securityHeaders.headers.filter((h) => h.status === 'missing');
    if (missingHeaders.length > 0) {
      const names = missingHeaders.map((h) => h.name).slice(0, 3).join(', ');
      problems.push({
        id: 'missing-headers',
        severity: 'optimization',
        title: `Missing Recommended Security Headers (${missingHeaders.length})`,
        description: `Key headers missing: ${names}. Adding them bolsters defense against XSS, clickjacking, and MIME confusion.`,
        measuredFact: `${missingHeaders.length} headers unconfigured`,
      });
      actions.push({
        id: `act-${actionCounter++}`,
        priority: 4,
        title: 'Configure Standard Security Response Headers',
        rationale: 'Adding HSTS, X-Content-Type-Options, and X-Frame-Options protects visitors from common web exploits.',
        implementationCodeSnippet: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      });
    }
  }

  // 5. Broken Links
  if (brokenLinks && brokenLinks.brokenCount > 0) {
    problems.push({
      id: 'broken-links',
      severity: 'warning',
      title: `${brokenLinks.brokenCount} Broken Links Detected`,
      description: `Crawler found ${brokenLinks.brokenCount} dead hyperlinks returning 4xx/5xx errors.`,
      measuredFact: `${brokenLinks.brokenCount} dead links out of ${brokenLinks.totalScanned} scanned`,
    });
    actions.push({
      id: `act-${actionCounter++}`,
      priority: 3,
      title: 'Repair or Redirect Broken Anchor Links',
      rationale: 'Dead links harm visitor user experience and negatively impact search engine crawl budget.',
    });
  }

  // 6. SEO Health
  if (seo && seo.issues.length > 0) {
    const criticalSEO = seo.issues.filter((i) => i.type === 'critical');
    if (criticalSEO.length > 0) {
      problems.push({
        id: 'seo-critical',
        severity: 'optimization',
        title: 'SEO Tag Deficiencies Detected',
        description: criticalSEO.map((c) => c.message).join(' '),
        measuredFact: `SEO Score: ${seo.score}/100`,
      });
      actions.push({
        id: `act-${actionCounter++}`,
        priority: 5,
        title: 'Add Missing Primary SEO Tags (<title>, <meta description>, <h1>)',
        rationale: 'Essential metadata ensures clean search engine indexing and attractive social share snippets.',
      });
    }
  }

  // Clinical Assessment Synthesis
  let headline = 'Healthy Website — Minor Optimizations Available';
  if (!probe.isOnline) {
    headline = 'Critical Alert: Website is Currently Offline';
  } else if (problems.some((p) => p.severity === 'critical')) {
    headline = 'Urgent Clinical Attention Needed: Significant Issues Detected';
  } else if (problems.some((p) => p.severity === 'warning')) {
    headline = 'Operational with Warnings: Degraded Performance or Configuration Gaps';
  }

  const clinicalAssessment = !probe.isOnline
    ? `Your website is unreachable (Status: ${probe.statusCode || 'Connection Error'}). Incoming traffic is completely disrupted. Immediate recovery of origin service or DNS is recommended.`
    : `Your website is currently ${probe.isOnline ? 'online and operational' : 'degraded'}, responding in ${probe.responseTimeMs}ms with HTTP ${probe.statusCode}. ${
        problems.length === 0
          ? 'All measured diagnostic indicators are in optimal standing with no critical vulnerabilities or latency spikes detected.'
          : `Website Doctor detected ${problems.length} noteworthy observation(s). Focusing on ${problems[0].title.toLowerCase()} will yield the largest immediate stability and performance gains.`
      }`;

  return {
    headline,
    clinicalAssessment,
    vitalSigns: {
      availability: probe.isOnline ? `Online (${probe.statusCode} OK)` : 'Down / Unreachable',
      responseTime: `${probe.responseTimeMs} ms (${probe.responseTimeMs < 400 ? 'Optimal' : probe.responseTimeMs < 1000 ? 'Acceptable' : 'Elevated'})`,
      sslHealth: ssl ? (ssl.status === 'valid' ? `Valid (${ssl.daysRemaining}d remaining)` : ssl.statusText) : 'Not measured',
      securityPosture: securityHeaders ? `${securityHeaders.presentCount}/${securityHeaders.totalEvaluated} Headers Active` : 'Not measured',
      seoReadiness: seo ? `${seo.score}/100 Score` : 'Not measured',
    },
    problemsDetected: problems,
    recommendedActions: actions.sort((a, b) => a.priority - b.priority),
    generatedBy: 'Expert Heuristic Engine',
    insufficientData: false,
    timestamp: new Date().toISOString(),
  };
}
