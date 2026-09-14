export interface Monitor {
  id: string;
  website_id?: string;
  name: string;
  url: string;
  interval_seconds: number;
  timeout_ms: number;
  http_method: string;
  expected_status_code: number;
  keyword_match?: string;
  status: 'operational' | 'degraded' | 'down' | 'paused';
  consecutive_failures: number;
  last_checked_at: string;
  uptime_pct: number;
  is_demo?: boolean;
  latest_response_time?: number;
  latest_status_code?: number;
}

export interface MonitorCheck {
  id: string;
  monitor_id: string;
  status_code: number;
  status_message?: string;
  response_time_ms: number;
  ttfb_ms: number;
  is_online: boolean;
  error?: string;
  created_at: string;
}

export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'resolved';
}

export interface Incident {
  id: string;
  monitorId: string;
  websiteUrl: string;
  title: string;
  cause: string;
  status: 'active' | 'resolved';
  severity: 'critical' | 'warning';
  startedAt: string;
  resolvedAt?: string;
  durationSeconds?: number;
  timeline: IncidentTimelineEvent[];
}

export interface AlertRule {
  id: string;
  name: string;
  type: string;
  threshold?: number;
  enabled: boolean;
  channel: 'in_app' | 'email' | 'webhook';
  recipient?: string;
  createdAt: string;
}

export interface AlertLogEvent {
  id: string;
  ruleId?: string;
  type: string;
  title: string;
  message: string;
  websiteUrl: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export interface ScoreCategoryBreakdown {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  rationale: string[];
}

export interface HealthScoreCalculation {
  overallScore: number;
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

export interface SecurityHeaderItem {
  name: string;
  value?: string;
  status: 'present' | 'missing' | 'not_applicable';
  evaluation?: 'pass' | 'warning' | 'fail';
  meaning: string;
  whyItMatters: string;
  possibleFix: string;
  snippet?: {
    nginx: string;
    apache: string;
    cloudflare: string;
  };
}

export interface SecurityHeadersReport {
  headers: SecurityHeaderItem[];
  score: number; // 0 to 100
  presentCount: number;
  passCount?: number;
  warningCount?: number;
  failCount?: number;
  totalEvaluated: number;
}

export interface SEOCheckItem {
  key: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  recommendation?: string;
}

export interface SEOReport {
  score: number;
  title?: string;
  titleLength: number;
  metaDescription?: string;
  metaDescriptionLength: number;
  canonicalUrl?: string;
  robotsMeta?: string;
  viewport?: string;
  h1Count: number;
  h1Texts: string[];
  h2Count: number;
  h3Count: number;
  totalImages: number;
  imagesMissingAlt: number;
  hasOpenGraph: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  checklist?: SEOCheckItem[];
  issues: { type: 'critical' | 'warning' | 'info'; message: string; recommendation: string }[];
}

export interface PerformanceRecommendation {
  id: string;
  category: 'slow_resources' | 'large_images' | 'ttfb' | 'caching' | 'compression';
  title: string;
  status: 'pass' | 'warning' | 'fail';
  value: string;
  suggestion: string;
}

export interface ScoreComparisonData {
  previousScore: number;
  currentScore: number;
  previousGrade: string;
  currentGrade: string;
  improvementPts: number;
  breakdownDiff: {
    availability: { prev: number; curr: number };
    performance: { prev: number; curr: number };
    security: { prev: number; curr: number };
    seo: { prev: number; curr: number };
    technicalHealth: { prev: number; curr: number };
  };
  resolvedFixes: string[];
}

export interface SSLCheckResult {
  hasSsl: boolean;
  status: 'valid' | 'expiring_soon' | 'expired' | 'invalid' | 'none';
  statusText: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipherName: string;
  subjectAltNames: string[];
  httpToHttpsRedirect: boolean;
  error?: string;
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
  problemsDetected: {
    id: string;
    severity: 'critical' | 'warning' | 'optimization';
    title: string;
    description: string;
    measuredFact: string;
  }[];
  recommendedActions: {
    id: string;
    priority: number;
    title: string;
    rationale: string;
    implementationCodeSnippet?: string;
  }[];
  generatedBy: string;
  insufficientData: boolean;
  timestamp: string;
}

export interface DiagnosticAnalysisResult {
  url: string;
  analyzedAt: string;
  probe: {
    statusCode: number;
    statusMessage: string;
    isOnline: boolean;
    responseTimeMs: number;
    ttfbMs: number;
    dnsTimeMs: number;
    tcpTimeMs: number;
    tlsTimeMs: number;
    contentLength: number;
    contentType: string;
    contentEncoding: string;
    serverHeader: string;
    cacheControl: string;
    redirectCount: number;
    redirectChain: string[];
    error?: string;
  };
  ssl: SSLCheckResult;
  dns: {
    domain: string;
    a: string[];
    aaaa: string[];
    mx: { exchange: string; priority: number }[];
    txt: string[];
    ns: string[];
    cname: string[];
  };
  securityHeaders: SecurityHeadersReport;
  seo: SEOReport;
  healthScore: HealthScoreCalculation;
  aiDiagnosis: AIDoctorDiagnosis;
}
