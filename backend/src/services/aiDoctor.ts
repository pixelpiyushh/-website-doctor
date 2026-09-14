import { ProbeResult } from './prober.js';
import { SSLCheckResult } from './sslInspector.js';
import { SecurityHeadersReport } from './securityHeaders.js';
import { SEOReport } from './seoScanner.js';
import { BrokenLinksReport } from './brokenLinkScanner.js';
import { HealthScoreCalculation } from './healthScore.js';

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

export interface AIDoctorVitalSigns {
  availability: string;
  responseTime: string;
  sslHealth: string;
  securityPosture: string;
  seoReadiness: string;
}

export interface AIDoctorDiagnosisContent {
  headline: string;
  clinicalAssessment: string;
  vitalSigns: AIDoctorVitalSigns;
  problemsDetected: AIDoctorProblem[];
  recommendedActions: AIDoctorAction[];
}

export interface AIDoctorDiagnosis extends AIDoctorDiagnosisContent {
  generatedBy: 'Expert Heuristic Engine' | 'LLM Telemetry Engine';
  insufficientData: boolean;
  timestamp: string;
  translations?: {
    en: AIDoctorDiagnosisContent;
    hinglish: AIDoctorDiagnosisContent;
  };
}

/**
 * Deterministic Expert Rules Engine that analyzes factual measured telemetry
 * and generates both English and natural Roman Hinglish diagnostics.
 */
export function generateHeuristicDiagnosis(data: {
  probe?: ProbeResult;
  ssl?: SSLCheckResult;
  securityHeaders?: SecurityHeadersReport;
  seo?: SEOReport;
  brokenLinks?: BrokenLinksReport;
  healthScore?: HealthScoreCalculation;
  language?: 'en' | 'hinglish';
}): AIDoctorDiagnosis {
  const { probe, ssl, securityHeaders, seo, brokenLinks, healthScore, language = 'en' } = data;

  if (!probe) {
    const emptyEn: AIDoctorDiagnosisContent = {
      headline: 'Insufficient Telemetry Data',
      clinicalAssessment: 'Insufficient data to determine diagnosis. No live probe telemetry has been gathered for this target.',
      vitalSigns: {
        availability: 'Unknown',
        responseTime: 'Not measured',
        sslHealth: 'Not measured',
        securityPosture: 'Not measured',
        seoReadiness: 'Not measured',
      },
      problemsDetected: [],
      recommendedActions: [],
    };

    const emptyHinglish: AIDoctorDiagnosisContent = {
      headline: 'Telemetry Data Kam Hai',
      clinicalAssessment: 'Diagnosis nikalne ke liye data kam hai. Is website ke liye abhi live probe telemetry gather nahi ho paayi.',
      vitalSigns: {
        availability: 'Pata nahi',
        responseTime: 'Measure nahi hua',
        sslHealth: 'Measure nahi hua',
        securityPosture: 'Measure nahi hua',
        seoReadiness: 'Measure nahi hua',
      },
      problemsDetected: [],
      recommendedActions: [],
    };

    const chosen = language === 'hinglish' ? emptyHinglish : emptyEn;

    return {
      ...chosen,
      generatedBy: 'Expert Heuristic Engine',
      insufficientData: true,
      timestamp: new Date().toISOString(),
      translations: {
        en: emptyEn,
        hinglish: emptyHinglish,
      },
    };
  }

  const problemsEn: AIDoctorProblem[] = [];
  const problemsHinglish: AIDoctorProblem[] = [];
  const actionsEn: AIDoctorAction[] = [];
  const actionsHinglish: AIDoctorAction[] = [];
  let actionCounter = 1;

  // 1. Availability issues
  if (!probe.isOnline || probe.statusCode >= 500) {
    problemsEn.push({
      id: 'down-5xx',
      severity: 'critical',
      title: 'Website is Offline or Returning Server Errors',
      description: `The website failed health checks with status code ${probe.statusCode || 'Connection Error'} (${probe.statusMessage || probe.error}).`,
      measuredFact: `Measured status: ${probe.statusCode} ${probe.statusMessage}`,
    });
    problemsHinglish.push({
      id: 'down-5xx',
      severity: 'critical',
      title: 'Website Offline Hai Ya Server Error De Rahi Hai',
      description: `Tumhari website health check mein fail ho gayi hai (Status code: ${probe.statusCode || 'Connection Error'} - ${probe.statusMessage || probe.error}).`,
      measuredFact: `Status: ${probe.statusCode} ${probe.statusMessage}`,
    });

    const actId = `act-${actionCounter++}`;
    actionsEn.push({
      id: actId,
      priority: 1,
      title: 'Inspect Web Server and Application Error Logs',
      rationale: 'Verify the origin server service (Node, Nginx, PHP, Gunicorn) is running and check error logs.',
      implementationCodeSnippet: 'systemctl status nginx\njournalctl -u your-service -n 50 --no-pager',
    });
    actionsHinglish.push({
      id: actId,
      priority: 1,
      title: 'Web Server Aur Application Error Logs Check Karein',
      rationale: 'Check karein ki origin server service (Node, Nginx, PHP) chal rahi hai aur application error logs inspect karein.',
      implementationCodeSnippet: 'systemctl status nginx\njournalctl -u your-service -n 50 --no-pager',
    });
  } else if (probe.statusCode >= 400) {
    problemsEn.push({
      id: 'client-4xx',
      severity: 'warning',
      title: `Origin Returned Client Error ${probe.statusCode}`,
      description: `The server responded with HTTP ${probe.statusCode} (${probe.statusMessage}). The requested path or configuration may be incorrect.`,
      measuredFact: `HTTP ${probe.statusCode}`,
    });
    problemsHinglish.push({
      id: 'client-4xx',
      severity: 'warning',
      title: `Server Ne Client Error HTTP ${probe.statusCode} Return Kiya`,
      description: `Server se HTTP ${probe.statusCode} (${probe.statusMessage}) response mila. Requested URL path ya server configuration check karein.`,
      measuredFact: `HTTP ${probe.statusCode}`,
    });

    const actId = `act-${actionCounter++}`;
    actionsEn.push({
      id: actId,
      priority: 2,
      title: 'Verify URL Routing and Public Access Permissions',
      rationale: 'Ensure the requested path is accessible publicly without authorization barriers.',
    });
    actionsHinglish.push({
      id: actId,
      priority: 2,
      title: 'URL Routing Aur Access Permissions Verify Karein',
      rationale: 'Ensure karein ki requested URL path bina kisi restriction ke publicly open ho.',
    });
  }

  // 2. Response Time / Latency
  if (probe.responseTimeMs > 1200) {
    problemsEn.push({
      id: 'high-latency',
      severity: 'critical',
      title: 'Elevated Response Latency',
      description: `Server response time is ${probe.responseTimeMs}ms, exceeding the recommended 600ms threshold.`,
      measuredFact: `${probe.responseTimeMs}ms TTFB/response duration`,
    });
    problemsHinglish.push({
      id: 'high-latency',
      severity: 'critical',
      title: 'Website Ka Response Time Slow Hai (High Latency)',
      description: `Tumhari website ka response time ${probe.responseTimeMs}ms hai, jo recommended 600ms limit se kaafi zyada hai.`,
      measuredFact: `${probe.responseTimeMs}ms response duration`,
    });

    const actId = `act-${actionCounter++}`;
    actionsEn.push({
      id: actId,
      priority: 2,
      title: 'Implement Edge Caching and Optimize Backend Database Queries',
      rationale: 'A response time above 1.2s indicates un-cached dynamic rendering or slow database queries.',
      implementationCodeSnippet: '# Nginx cache configuration:\nproxy_cache_valid 200 302 10m;\nproxy_cache_use_stale error timeout updating;',
    });
    actionsHinglish.push({
      id: actId,
      priority: 2,
      title: 'Edge CDN Caching Enable Karein Aur Slow Database Queries Optimize Karein',
      rationale: '1.2s se zyada latency slow database queries ya server-side rendering caching na hone ki wajah se hoti hai.',
      implementationCodeSnippet: '# Nginx cache configuration:\nproxy_cache_valid 200 302 10m;\nproxy_cache_use_stale error timeout updating;',
    });
  } else if (probe.responseTimeMs > 600) {
    problemsEn.push({
      id: 'moderate-latency',
      severity: 'warning',
      title: 'Suboptimal Response Time',
      description: `Response time was measured at ${probe.responseTimeMs}ms. Consider CDN caching or compression to reach < 300ms.`,
      measuredFact: `${probe.responseTimeMs}ms response time`,
    });
    problemsHinglish.push({
      id: 'moderate-latency',
      severity: 'warning',
      title: 'Response Time Thoda Dheema Hai',
      description: `Response time ${probe.responseTimeMs}ms measure hua hai. CDN caching aur compression lagakar ise 300ms se kam karein.`,
      measuredFact: `${probe.responseTimeMs}ms response time`,
    });
  }

  // 3. SSL Health
  if (ssl) {
    if (ssl.status === 'expired') {
      problemsEn.push({
        id: 'ssl-expired',
        severity: 'critical',
        title: 'SSL Certificate Has Expired',
        description: `The SSL certificate expired on ${ssl.validTo}. Visitors will see high-risk browser warning screens.`,
        measuredFact: `Certificate expired on ${ssl.validTo}`,
      });
      problemsHinglish.push({
        id: 'ssl-expired',
        severity: 'critical',
        title: 'SSL Certificate Expire Ho Chuka Hai',
        description: `Tumhara SSL certificate ${ssl.validTo} ko expire ho gaya. Visitors ko red browser security warning dikhegi.`,
        measuredFact: `Certificate expired on ${ssl.validTo}`,
      });

      const actId = `act-${actionCounter++}`;
      actionsEn.push({
        id: actId,
        priority: 1,
        title: 'Renew and Reload SSL Certificate Immediately',
        rationale: 'Expired certificates break HTTPS navigation and trigger security blocks.',
        implementationCodeSnippet: 'sudo certbot renew --force-renewal\nsudo systemctl reload nginx',
      });
      actionsHinglish.push({
        id: actId,
        priority: 1,
        title: 'SSL Certificate Ko Turant Renew Aur Reload Karein',
        rationale: 'Expired certificates HTTPS access ko block kar dete hain aur users website par nahi aa paate.',
        implementationCodeSnippet: 'sudo certbot renew --force-renewal\nsudo systemctl reload nginx',
      });
    } else if (ssl.status === 'expiring_soon') {
      problemsEn.push({
        id: 'ssl-expiring',
        severity: 'warning',
        title: `SSL Certificate Expiring in ${ssl.daysRemaining} Days`,
        description: `The certificate issued by ${ssl.issuer} expires on ${ssl.validTo}.`,
        measuredFact: `${ssl.daysRemaining} days remaining`,
      });
      problemsHinglish.push({
        id: 'ssl-expiring',
        severity: 'warning',
        title: `SSL Certificate ${ssl.daysRemaining} Din Mein Expire Hone Wala Hai`,
        description: `${ssl.issuer} ka certificate ${ssl.validTo} ko expire hone wala hai. Renewal schedule verify karein.`,
        measuredFact: `${ssl.daysRemaining} din baaki`,
      });

      const actId = `act-${actionCounter++}`;
      actionsEn.push({
        id: actId,
        priority: 2,
        title: 'Verify Automatic Certificate Renewal Setup',
        rationale: 'Ensure ACME renewal cron jobs or Certbot systemd timers are active.',
        implementationCodeSnippet: 'sudo certbot renew --dry-run',
      });
      actionsHinglish.push({
        id: actId,
        priority: 2,
        title: 'Auto Renewal Cron Job Verify Karein',
        rationale: 'Ensure karein ki Certbot timer ya renewal cron job active hai.',
        implementationCodeSnippet: 'sudo certbot renew --dry-run',
      });
    }

    if (!ssl.httpToHttpsRedirect) {
      problemsEn.push({
        id: 'no-https-redirect',
        severity: 'warning',
        title: 'Missing Automatic HTTP to HTTPS Redirect',
        description: 'Requests to http:// do not automatically redirect to https://, leaving unencrypted connections possible.',
        measuredFact: 'HTTP port 80 did not redirect to HTTPS',
      });
      problemsHinglish.push({
        id: 'no-https-redirect',
        severity: 'warning',
        title: 'HTTP Se HTTPS Auto-Redirect Missing Hai',
        description: 'http:// par aane wali requests automatically https:// par redirect nahi ho rahi hain.',
        measuredFact: 'Port 80 redirect missing',
      });

      const actId = `act-${actionCounter++}`;
      actionsEn.push({
        id: actId,
        priority: 3,
        title: 'Enforce Permanent 301 Redirect to HTTPS',
        rationale: 'Protect visitors from unencrypted traffic by redirecting all HTTP requests.',
        implementationCodeSnippet: '# Nginx redirect block:\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}',
      });
      actionsHinglish.push({
        id: actId,
        priority: 3,
        title: 'Permanent 301 Redirect To HTTPS Enable Karein',
        rationale: 'Saari unencrypted HTTP requests ko automatically secure HTTPS par bhejne ke liye 301 redirect lagayein.',
        implementationCodeSnippet: '# Nginx redirect block:\nserver {\n  listen 80;\n  server_name yourdomain.com;\n  return 301 https://$host$request_uri;\n}',
      });
    }
  }

  // 4. Security Headers
  if (securityHeaders) {
    const missingHeaders = securityHeaders.headers.filter((h) => h.status === 'missing');
    if (missingHeaders.length > 0) {
      const names = missingHeaders.map((h) => h.name).slice(0, 3).join(', ');
      problemsEn.push({
        id: 'missing-headers',
        severity: 'optimization',
        title: `Missing Recommended Security Headers (${missingHeaders.length})`,
        description: `Key headers missing: ${names}. Adding them bolsters defense against XSS, clickjacking, and MIME confusion.`,
        measuredFact: `${missingHeaders.length} headers unconfigured`,
      });
      problemsHinglish.push({
        id: 'missing-headers',
        severity: 'optimization',
        title: `Zaroori Security Headers Missing Hain (${missingHeaders.length})`,
        description: `Main security headers jaise ${names} missing hain. Inhe add karne se XSS aur Clickjacking se protection milti hai.`,
        measuredFact: `${missingHeaders.length} headers missing`,
      });

      const actId = `act-${actionCounter++}`;
      actionsEn.push({
        id: actId,
        priority: 4,
        title: 'Configure Standard Security Response Headers',
        rationale: 'Adding HSTS, X-Content-Type-Options, and X-Frame-Options protects visitors from common web exploits.',
        implementationCodeSnippet: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      });
      actionsHinglish.push({
        id: actId,
        priority: 4,
        title: 'Standard Security Headers Server Config Mein Add Karein',
        rationale: 'HSTS, X-Content-Type-Options aur X-Frame-Options lagane se browser-level exploits block ho jaate hain.',
        implementationCodeSnippet: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Content-Type-Options "nosniff" always;\nadd_header X-Frame-Options "SAMEORIGIN" always;\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;`,
      });
    }
  }

  // 5. Broken Links
  if (brokenLinks && brokenLinks.brokenCount > 0) {
    problemsEn.push({
      id: 'broken-links',
      severity: 'warning',
      title: `${brokenLinks.brokenCount} Broken Links Detected`,
      description: `Crawler found ${brokenLinks.brokenCount} dead hyperlinks returning 4xx/5xx errors.`,
      measuredFact: `${brokenLinks.brokenCount} dead links out of ${brokenLinks.totalScanned} scanned`,
    });
    problemsHinglish.push({
      id: 'broken-links',
      severity: 'warning',
      title: `${brokenLinks.brokenCount} Broken Links Pata Chale Hain`,
      description: `Website scanner ko ${brokenLinks.brokenCount} dead links mile jo 404 ya 500 error return kar rahe hain.`,
      measuredFact: `${brokenLinks.brokenCount} dead links`,
    });

    const actId = `act-${actionCounter++}`;
    actionsEn.push({
      id: actId,
      priority: 3,
      title: 'Repair or Redirect Broken Anchor Links',
      rationale: 'Dead links harm user experience and waste search engine crawl budget.',
    });
    actionsHinglish.push({
      id: actId,
      priority: 3,
      title: 'Broken Anchor Links Ko Fix Ya Redirect Karein',
      rationale: 'Dead links se visitors drop hote hain aur Google SEO rankings down hoti hain.',
    });
  }

  // 6. SEO Health
  if (seo && seo.issues.length > 0) {
    const criticalSEO = seo.issues.filter((i) => i.type === 'critical');
    if (criticalSEO.length > 0) {
      problemsEn.push({
        id: 'seo-critical',
        severity: 'optimization',
        title: 'SEO Tag Deficiencies Detected',
        description: criticalSEO.map((c) => c.message).join(' '),
        measuredFact: `SEO Score: ${seo.score}/100`,
      });
      problemsHinglish.push({
        id: 'seo-critical',
        severity: 'optimization',
        title: 'SEO Metadata Mein Kamiya Mili Hain',
        description: criticalSEO.map((c) => c.message).join(' '),
        measuredFact: `SEO Score: ${seo.score}/100`,
      });

      const actId = `act-${actionCounter++}`;
      actionsEn.push({
        id: actId,
        priority: 5,
        title: 'Add Missing Primary SEO Tags (<title>, <meta description>, <h1>)',
        rationale: 'Essential metadata ensures clean search engine indexing and attractive search snippets.',
      });
      actionsHinglish.push({
        id: actId,
        priority: 5,
        title: 'Missing SEO Tags (<title>, <meta description>, <h1>) Add Karein',
        rationale: 'Zaroori metadata hone se Google search results aur social shares par CTR boost hota hai.',
      });
    }
  }

  // Synthesis for English
  let headlineEn = 'Healthy Website — Minor Optimizations Available';
  if (!probe.isOnline) {
    headlineEn = 'Critical Alert: Website is Currently Offline';
  } else if (problemsEn.some((p) => p.severity === 'critical')) {
    headlineEn = 'Urgent Clinical Attention Needed: Significant Issues Detected';
  } else if (problemsEn.some((p) => p.severity === 'warning')) {
    headlineEn = 'Operational with Warnings: Degraded Performance or Configuration Gaps';
  }

  const assessmentEn = !probe.isOnline
    ? `Your website is unreachable (Status: ${probe.statusCode || 'Connection Error'}). Incoming traffic is completely disrupted. Immediate recovery of origin service or DNS is recommended.`
    : `Your website is currently online and operational, responding in ${probe.responseTimeMs}ms with HTTP ${probe.statusCode}. ${
        problemsEn.length === 0
          ? 'All measured diagnostic indicators are in optimal standing with no critical vulnerabilities or latency spikes detected.'
          : `Website Doctor detected ${problemsEn.length} noteworthy observation(s). Focusing on ${problemsEn[0].title.toLowerCase()} will yield the largest immediate stability and performance gains.`
      }`;

  const vitalsEn: AIDoctorVitalSigns = {
    availability: probe.isOnline ? `Online (${probe.statusCode} OK)` : 'Down / Unreachable',
    responseTime: `${probe.responseTimeMs} ms (${probe.responseTimeMs < 400 ? 'Optimal' : probe.responseTimeMs < 1000 ? 'Acceptable' : 'Elevated'})`,
    sslHealth: ssl ? (ssl.status === 'valid' ? `Valid (${ssl.daysRemaining}d remaining)` : ssl.statusText) : 'Not measured',
    securityPosture: securityHeaders ? `${securityHeaders.presentCount}/${securityHeaders.totalEvaluated} Headers Active` : 'Not measured',
    seoReadiness: seo ? `${seo.score}/100 Score` : 'Not measured',
  };

  // Synthesis for Roman Hinglish
  let headlineHinglish = 'Website Healthy Hai — Chhote Optimizations Kar Sakte Hain';
  if (!probe.isOnline) {
    headlineHinglish = 'Critical Alert: Website Abhi Offline Hai';
  } else if (problemsHinglish.some((p) => p.severity === 'critical')) {
    headlineHinglish = 'Emergency Ilaaj Ki Zaroorat: Serious Issues Detect Hue';
  } else if (problemsHinglish.some((p) => p.severity === 'warning')) {
    headlineHinglish = 'Chal Rahi Hai Lekin Warnings Hain: Performance Ya Setup Gaps';
  }

  const assessmentHinglish = !probe.isOnline
    ? `Tumhari website unreachable hai (Status: ${probe.statusCode || 'Connection Error'}). Visitors website access nahi kar pa rahe. Web server ya DNS turant check karein.`
    : `Tumhari website abhi online hai aur ${probe.responseTimeMs}ms mein HTTP ${probe.statusCode} ke saath response de rahi hai. ${
        problemsHinglish.length === 0
          ? 'Saare measured clinical indicators optimal hain aur koi major issue nahi mila.'
          : `Website Doctor ne ${problemsHinglish.length} important baatein note ki hain. Sabse pehle ${problemsHinglish[0].title.toLowerCase()} fix karne se sabse zyada fayda hoga.`
      }`;

  const vitalsHinglish: AIDoctorVitalSigns = {
    availability: probe.isOnline ? `Online (${probe.statusCode} OK - Chal Rahi Hai)` : 'Down / Band Hai',
    responseTime: `${probe.responseTimeMs} ms (${probe.responseTimeMs < 400 ? 'Super Fast' : probe.responseTimeMs < 1000 ? 'Theek Hai' : 'Dheemi Hai'})`,
    sslHealth: ssl ? (ssl.status === 'valid' ? `Valid (${ssl.daysRemaining} din baaki hain)` : ssl.statusText) : 'Measure nahi hua',
    securityPosture: securityHeaders ? `${securityHeaders.presentCount}/${securityHeaders.totalEvaluated} Headers Active` : 'Measure nahi hua',
    seoReadiness: seo ? `${seo.score}/100 Score` : 'Measure nahi hua',
  };

  const contentEn: AIDoctorDiagnosisContent = {
    headline: headlineEn,
    clinicalAssessment: assessmentEn,
    vitalSigns: vitalsEn,
    problemsDetected: problemsEn,
    recommendedActions: actionsEn.sort((a, b) => a.priority - b.priority),
  };

  const contentHinglish: AIDoctorDiagnosisContent = {
    headline: headlineHinglish,
    clinicalAssessment: assessmentHinglish,
    vitalSigns: vitalsHinglish,
    problemsDetected: problemsHinglish,
    recommendedActions: actionsHinglish.sort((a, b) => a.priority - b.priority),
  };

  const activeContent = language === 'hinglish' ? contentHinglish : contentEn;

  return {
    ...activeContent,
    generatedBy: 'Expert Heuristic Engine',
    insufficientData: false,
    timestamp: new Date().toISOString(),
    translations: {
      en: contentEn,
      hinglish: contentHinglish,
    },
  };
}
