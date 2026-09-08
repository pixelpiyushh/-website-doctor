import { ProbeResult } from './prober.js';
import { SSLCheckResult } from './sslInspector.js';
import { SecurityHeadersReport } from './securityHeaders.js';
import { SEOReport } from './seoScanner.js';
import { BrokenLinksReport } from './brokenLinkScanner.js';

export interface ScoreCategoryBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  rationale: string[];
}

export interface HealthScoreCalculation {
  overallScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  breakdown: {
    availability: ScoreCategoryBreakdown;
    performance: ScoreCategoryBreakdown;
    security: ScoreCategoryBreakdown;
    seo: ScoreCategoryBreakdown;
    technicalHealth: ScoreCategoryBreakdown;
  };
  calculatedAt: string;
}

export function calculateHealthScore(params: {
  probe: ProbeResult;
  ssl: SSLCheckResult;
  securityHeaders: SecurityHeadersReport;
  seo?: SEOReport;
  brokenLinks?: BrokenLinksReport;
  hasValidDns?: boolean;
}): HealthScoreCalculation {
  const { probe, ssl, securityHeaders, seo, brokenLinks, hasValidDns = true } = params;

  // 1. Availability (Max: 30)
  let availPts = 0;
  const availRationale: string[] = [];
  if (probe.isOnline && probe.statusCode === 200) {
    availPts = 30;
    availRationale.push('Website responded with HTTP 200 OK (+30 pts)');
  } else if (probe.isOnline && probe.statusCode >= 300 && probe.statusCode < 400) {
    availPts = 26;
    availRationale.push(`Website responded with redirect ${probe.statusCode} (+26 pts)`);
  } else if (probe.statusCode >= 400 && probe.statusCode < 500) {
    availPts = 8;
    availRationale.push(`Client error returned: HTTP ${probe.statusCode} (+8 pts)`);
  } else {
    availPts = 0;
    availRationale.push('Website is offline or server returned 5xx/timeout (0 pts)');
  }

  // 2. Performance (Max: 20)
  let perfPts = 0;
  const perfRationale: string[] = [];
  const rt = probe.responseTimeMs;
  if (rt > 0 && rt <= 250) {
    perfPts = 18;
    perfRationale.push(`Lightning fast response time of ${rt}ms (+18 pts)`);
  } else if (rt <= 500) {
    perfPts = 15;
    perfRationale.push(`Good response time of ${rt}ms (+15 pts)`);
  } else if (rt <= 1200) {
    perfPts = 10;
    perfRationale.push(`Moderate response time of ${rt}ms (+10 pts)`);
  } else if (rt <= 2500) {
    perfPts = 5;
    perfRationale.push(`Slow response time of ${rt}ms (+5 pts)`);
  } else {
    perfPts = 2;
    perfRationale.push(`Very slow or unmeasured response time (+2 pts)`);
  }

  if (probe.contentEncoding && ['gzip', 'br', 'deflate'].includes(probe.contentEncoding)) {
    perfPts = Math.min(20, perfPts + 2);
    perfRationale.push(`Compression enabled (${probe.contentEncoding}) (+2 pts bonus)`);
  }

  // 3. Security (Max: 20)
  let secPts = 0;
  const secRationale: string[] = [];
  if (ssl.status === 'valid') {
    secPts += 10;
    secRationale.push(`Valid SSL certificate from ${ssl.issuer} (+10 pts)`);
  } else if (ssl.status === 'expiring_soon') {
    secPts += 6;
    secRationale.push(`SSL certificate expiring in ${ssl.daysRemaining} days (+6 pts)`);
  } else {
    secRationale.push(`No valid SSL certificate found (0 pts)`);
  }

  if (ssl.httpToHttpsRedirect) {
    secPts += 3;
    secRationale.push('Automatic HTTP to HTTPS redirect active (+3 pts)');
  } else {
    secRationale.push('Missing automatic HTTP to HTTPS redirect (0 pts)');
  }

  const headerRatio = securityHeaders.presentCount / Math.max(1, securityHeaders.totalEvaluated);
  const headerPts = Math.round(headerRatio * 7);
  secPts += headerPts;
  secRationale.push(`${securityHeaders.presentCount}/${securityHeaders.totalEvaluated} security headers configured (+${headerPts} pts)`);

  // 4. SEO (Max: 15)
  let seoPts = 10;
  const seoRationale: string[] = [];
  if (seo) {
    seoPts = Math.round((seo.score / 100) * 15);
    seoRationale.push(`SEO audit score of ${seo.score}/100 scaled (+${seoPts} pts)`);
    if (seo.title) seoRationale.push('Page title present');
    if (seo.metaDescription) seoRationale.push('Meta description present');
  } else {
    seoRationale.push('SEO check not run yet (+10 pts baseline)');
  }

  // 5. Technical Health (Max: 15)
  let techPts = 0;
  const techRationale: string[] = [];
  if (hasValidDns) {
    techPts += 5;
    techRationale.push('Valid DNS records resolved (+5 pts)');
  }

  if (brokenLinks) {
    if (brokenLinks.brokenCount === 0) {
      techPts += 10;
      techRationale.push(`All ${brokenLinks.workingCount} scanned links healthy (+10 pts)`);
    } else if (brokenLinks.brokenCount <= 2) {
      techPts += 6;
      techRationale.push(`Minor broken links detected: ${brokenLinks.brokenCount} broken (+6 pts)`);
    } else {
      techPts += 2;
      techRationale.push(`Multiple broken links detected: ${brokenLinks.brokenCount} broken (+2 pts)`);
    }
  } else {
    techPts += 10;
    techRationale.push('No broken links recorded (+10 pts)');
  }

  const overallScore = Math.max(0, Math.min(100, availPts + perfPts + secPts + seoPts + techPts));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (overallScore >= 95) grade = 'A+';
  else if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 75) grade = 'B';
  else if (overallScore >= 60) grade = 'C';
  else if (overallScore >= 40) grade = 'D';
  else grade = 'F';

  const getStatus = (val: number, max: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    const ratio = val / max;
    if (ratio >= 0.9) return 'excellent';
    if (ratio >= 0.75) return 'good';
    if (ratio >= 0.5) return 'fair';
    return 'poor';
  };

  return {
    overallScore,
    grade,
    summary: `Website health score is ${overallScore}/100 (Grade ${grade}). Availability: ${availPts}/30, Performance: ${perfPts}/20, Security: ${secPts}/20, SEO: ${seoPts}/15, Technical: ${techPts}/15.`,
    breakdown: {
      availability: {
        category: 'Availability',
        score: availPts,
        maxScore: 30,
        percentage: Math.round((availPts / 30) * 100),
        status: getStatus(availPts, 30),
        rationale: availRationale,
      },
      performance: {
        category: 'Performance',
        score: perfPts,
        maxScore: 20,
        percentage: Math.round((perfPts / 20) * 100),
        status: getStatus(perfPts, 20),
        rationale: perfRationale,
      },
      security: {
        category: 'Security',
        score: secPts,
        maxScore: 20,
        percentage: Math.round((secPts / 20) * 100),
        status: getStatus(secPts, 20),
        rationale: secRationale,
      },
      seo: {
        category: 'SEO',
        score: seoPts,
        maxScore: 15,
        percentage: Math.round((seoPts / 15) * 100),
        status: getStatus(seoPts, 15),
        rationale: seoRationale,
      },
      technicalHealth: {
        category: 'Technical Health',
        score: techPts,
        maxScore: 15,
        percentage: Math.round((techPts / 15) * 100),
        status: getStatus(techPts, 15),
        rationale: techRationale,
      },
    },
    calculatedAt: new Date().toISOString(),
  };
}
