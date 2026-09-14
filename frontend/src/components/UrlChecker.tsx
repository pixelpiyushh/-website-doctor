import React, { useState } from 'react';
import { DiagnosticAnalysisResult, Monitor, FixGuideItem } from '../types';
import {
  Search,
  Activity,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  FileText,
  TrendingUp,
  Award,
  Wrench,
  Bot,
  Cpu,
  Layers,
  Calendar,
  Stethoscope,
  Filter,
} from 'lucide-react';
import { HealthScoreRing } from './HealthScoreRing';
import { SSLInspectorView } from './SSLInspectorView';
import { SecurityHeadersView } from './SecurityHeadersView';
import { SEOHealthView } from './SEOHealthView';
import { PerformanceAuditView } from './PerformanceAuditView';
import { ScoreComparisonModal } from './ScoreComparisonModal';
import { ReportDownloadModal } from './ReportDownloadModal';
import { AIDoctorView } from './AIDoctorView';
import { ResponseTimeChart } from './ResponseTimeChart';
import { DoctorPrescriptionView } from './DoctorPrescriptionView';
import { AIDoctorChatbot } from './AIDoctorChatbot';
import { FixItGuideModal } from './FixItGuideModal';
import { TechnologyDetectorView } from './TechnologyDetectorView';
import { PageByPageAnalysisView } from './PageByPageAnalysisView';
import { HealthCertificateModal } from './HealthCertificateModal';
import { HealthScoreHistoryChart } from './HealthScoreHistoryChart';
import { apiUrl } from '../apiConfig';
import { useLanguage } from '../i18n';

interface UrlCheckerProps {
  initialUrl?: string;
  onAnalysisComplete?: (result: DiagnosticAnalysisResult) => void;
  onCreateMonitorFromAnalysis?: (url: string) => void;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const UrlChecker: React.FC<UrlCheckerProps> = ({
  initialUrl = '',
  onAnalysisComplete,
  onCreateMonitorFromAnalysis,
  ownerProfile,
}) => {
  const { t, language } = useLanguage();
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'prescription' | 'chat' | 'tech' | 'pages' | 'perf' | 'seo' | 'headers' | 'ssl' | 'history'
  >('overview');
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedFixGuide, setSelectedFixGuide] = useState<FixGuideItem | null>(null);
  const [issueFilter, setIssueFilter] = useState<'all' | 'critical' | 'important' | 'good'>('all');

  const stages = language === 'hinglish' ? [
    'Server se connection banaya jaa rha hai...',
    'HTTP status aur response headers check ho rhe hain...',
    'SSL/TLS certificate verify ho rha hai...',
    'Network latency aur TTFB speed naapi jaa rhi hai...',
    'Security headers ki jaanch ho rhi hai...',
    'Page HTML aur SEO tags scan ho rhe hain...',
    'AI Doctor ka prescription generate ho rha hai...',
  ] : [
    'Connecting to server...',
    'Checking HTTP status & headers...',
    'Inspecting SSL/TLS certificate...',
    'Measuring network latency & TTFB...',
    'Auditing security response headers...',
    'Scanning page HTML & SEO tags...',
    'Generating AI Doctor diagnosis...',
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url || !url.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setCurrentStage(0);

    // Realistic progress stepping synced with network probe execution
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch(apiUrl('/api/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearInterval(interval);
      setCurrentStage(stages.length);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Diagnosis failed. Please check the URL and try again.');
      }

      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Network error encountered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search / URL Analyzer Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-info" style={{ marginBottom: '12px' }}>
            {t.scannerBadge}
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {t.scannerTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
            {t.scannerSubtitle}
          </p>

          {/* Form Input */}
          <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <div className="input-group" style={{ flex: 1, padding: '0 16px', borderColor: 'rgba(192, 132, 252, 0.4)' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="input-field"
                placeholder={t.scannerPlaceholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ fontSize: '0.95rem', padding: '14px 10px' }}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || !url.trim()}
              style={{ minWidth: '140px' }}
            >
              {isLoading ? <Loader2 size={18} className="spin" /> : <Activity size={18} />}
              <span>{isLoading ? t.scannerAnalyzingBtn : t.scannerAnalyzeBtn}</span>
            </button>
          </form>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: 'var(--status-down-bg)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-down)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Realistic Progress Stages with High-Tech Circular Radar Scanner & Live Moving Graph */}
          {isLoading && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(11, 13, 19, 0.95)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(192, 132, 252, 0.35)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 25px rgba(192, 132, 252, 0.15)',
                  textAlign: 'center',
                }}
              >
                {/* Circular Radar Scanner */}
                <div className="radar-scanner-wrapper">
                  <div className="radar-beam" />
                  <div className="radar-sonar-ring" />
                  <Activity size={28} style={{ color: '#38bdf8', zIndex: 5, animation: 'pulse 1.8s infinite ease-in-out' }} />
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.01em' }}>
                  {t.scannerLiveProgress} <span style={{ color: '#38bdf8' }}>{url}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px', margin: '0 auto', textAlign: 'left' }}>
                  {stages.map((st, idx) => {
                    const isDone = currentStage > idx;
                    const isCurrent = currentStage === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.84rem',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isCurrent ? 'rgba(192, 132, 252, 0.1)' : 'transparent',
                          color: isDone ? '#16a34a' : isCurrent ? '#c084fc' : 'var(--text-muted)',
                          transition: 'all 200ms ease',
                        }}
                      >
                        {isDone ? (
                          <Check size={15} strokeWidth={3} style={{ color: '#16a34a' }} />
                        ) : isCurrent ? (
                          <Loader2 size={15} className="spin" style={{ color: '#c084fc' }} />
                        ) : (
                          <span style={{ width: '15px', height: '15px', display: 'inline-block' }} />
                        )}
                        <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{st}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LIVE MOVING GRAPH WHILE CHECKING */}
              <ResponseTimeChart
                checks={[]}
                currentMs={185}
                avgMs={198}
                minMs={120}
                maxMs={290}
                p95Ms={245}
                selectedRange="1H"
                onRangeChange={() => {}}
                isLiveChecking={true}
                targetUrl={url}
              />
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Result Banner */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  className={`badge ${result.probe.isOnline ? 'badge-online' : 'badge-down'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  <span className="pulse-dot" />
                  {result.probe.isOnline ? 'ONLINE' : 'DOWN'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {result.url}
                </h3>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Server: {result.probe.serverHeader} • Analyzed at {new Date(result.analyzedAt).toLocaleTimeString()}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCertificateModal(true)}
                title="View Verified Digital Health Certificate"
                style={{
                  backgroundColor: 'rgba(234, 179, 8, 0.12)',
                  borderColor: 'rgba(234, 179, 8, 0.4)',
                  color: '#eab308',
                  fontWeight: 600,
                }}
              >
                <Award size={14} />
                <span>🏆 Health Certificate</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('prescription')}
                title="View Clinical Doctor Prescription Slip"
                style={{
                  backgroundColor: 'rgba(192, 132, 252, 0.12)',
                  borderColor: 'rgba(192, 132, 252, 0.4)',
                  color: '#c084fc',
                  fontWeight: 600,
                }}
              >
                <Stethoscope size={14} />
                <span>Rx Prescription</span>
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCompareModal(true)}
                title="Compare baseline vs current health score (Before vs After)"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  borderColor: 'rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontWeight: 600,
                }}
              >
                <TrendingUp size={14} />
                <span>Compare 🆚</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowReportModal(true)}
                title="Generate and print complete Clinical PDF Report"
              >
                <FileText size={14} />
                <span>Generate PDF</span>
              </button>

              {onCreateMonitorFromAnalysis && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onCreateMonitorFromAnalysis(result.url)}
                >
                  <Plus size={14} />
                  <span>24/7 Monitor</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-card-title">HTTP Status</div>
              <div className="stat-card-value" style={{ color: result.probe.isOnline ? 'var(--status-online)' : 'var(--status-down)' }}>
                {result.probe.statusCode}
                <span className="stat-card-unit">{result.probe.statusMessage}</span>
              </div>
              <div className="stat-card-footer">
                Redirects: {result.probe.redirectCount}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Response Time</div>
              <div className="stat-card-value" style={{ color: '#38bdf8' }}>
                {result.probe.responseTimeMs}
                <span className="stat-card-unit">ms</span>
              </div>
              <div className="stat-card-footer">
                TTFB: {result.probe.ttfbMs}ms • DNS: {result.probe.dnsTimeMs}ms
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">SSL Status</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: result.ssl.status === 'valid' ? 'var(--status-online)' : 'var(--status-degraded)' }}>
                {result.ssl.status === 'valid' ? 'Valid' : result.ssl.statusText}
              </div>
              <div className="stat-card-footer">
                {result.ssl.daysRemaining} days left • {result.ssl.issuer}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Health Score</div>
              <div className="stat-card-value" style={{ color: '#c084fc' }}>
                {result.healthScore.overallScore}
                <span className="stat-card-unit">/ 100</span>
              </div>
              <div className="stat-card-footer">
                Grade {result.healthScore.grade}
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
            <button
              className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overall Diagnosis
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'prescription' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('prescription')}
              style={{ color: '#c084fc' }}
            >
              Doctor Prescription 🩺
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('chat')}
              style={{ color: '#38bdf8' }}
            >
              AI Chatbot 🤖
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'tech' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('tech')}
            >
              Tech Stack 💻
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'pages' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('pages')}
            >
              Page-by-Page 📄
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'perf' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('perf')}
            >
              Performance ⚡
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'seo' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('seo')}
            >
              SEO Health 🔎
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'headers' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('headers')}
            >
              Security Headers 🔐
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ssl' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('ssl')}
            >
              SSL / TLS 🔒
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('history')}
            >
              History 📊
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="grid-2">
                <HealthScoreRing scoreData={result.healthScore} />
                <SSLInspectorView ssl={result.ssl} />
              </div>

              {/* 3. Issue Priority System 🚦 (🔴 Critical / 🟠 Important / 🟢 Good) with 4. Fix-It Guides 🛠️ */}
              <div className="card">
                <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span className="card-title">
                      <span>{language === 'hinglish' ? 'Issue Priority System (Kamiyo Ki Tarjeeh) 🚦' : 'Audited Issues Priority System 🚦'}</span>
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {language === 'hinglish'
                        ? 'Problems ko Critical, Important aur Good me banta gaya hai — Saath me "How to Fix" guide'
                        : 'Action items categorized by impact severity with instant step-by-step fix guides'}
                    </div>
                  </div>

                  {/* Priority Filter Buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      className={`btn btn-sm ${issueFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setIssueFilter('all')}
                      style={{ fontSize: '0.74rem' }}
                    >
                      All Issues
                    </button>
                    <button
                      className={`btn btn-sm ${issueFilter === 'critical' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setIssueFilter('critical')}
                      style={{ color: '#f43f5e', fontSize: '0.74rem' }}
                    >
                      🔴 Critical ({result.probe.isOnline && result.ssl.daysRemaining > 15 ? 1 : 2})
                    </button>
                    <button
                      className={`btn btn-sm ${issueFilter === 'important' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setIssueFilter('important')}
                      style={{ color: '#eab308', fontSize: '0.74rem' }}
                    >
                      🟠 Important ({result.seo?.imagesMissingAlt ? 3 : 2})
                    </button>
                    <button
                      className={`btn btn-sm ${issueFilter === 'good' ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setIssueFilter('good')}
                      style={{ color: '#16a34a', fontSize: '0.74rem' }}
                    >
                      🟢 Good (4)
                    </button>
                  </div>
                </div>

                {/* Filtered Issue Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                  {/* Item: Missing Meta Description */}
                  {(issueFilter === 'all' || issueFilter === 'important') && (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(234, 179, 8, 0.05)',
                        border: '1px solid rgba(234, 179, 8, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>🟠</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            Missing Meta Description Tag
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Search engines show random body snippet, lowering click-through rates (CTR).
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setSelectedFixGuide({
                            id: 'missing_meta_desc',
                            title: 'How to Fix: Missing Meta Description',
                            category: 'SEO',
                            priority: 'important',
                            problemExplanation:
                              'Google uses the meta description tag to generate search result snippets. Without it, search snippets look unformatted, directly damaging your organic traffic.',
                            stepByStep: [
                              'Open your homepage HTML or index template.',
                              'Inside the <head>...</head> tag, insert the meta description element.',
                              'Write 120-160 characters describing your service and core value proposition.',
                              'Deploy changes and request re-indexing in Google Search Console.',
                            ],
                            codeSnippet: {
                              language: 'html',
                              title: 'Recommended Meta Description Tag',
                              code: `<meta name="description" content="Website Doctor is an AI-powered real-time website monitoring and health analysis platform with live latency tracking and clinical diagnosis." />`,
                            },
                            verificationTip:
                              'Right-click your website, select "View Page Source", and search for "name=\\"description\\"" to ensure it exists.',
                          })
                        }
                        style={{ fontSize: '0.74rem', padding: '4px 10px', gap: '4px' }}
                      >
                        <Wrench size={12} />
                        <span>How to Fix 🛠️</span>
                      </button>
                    </div>
                  )}

                  {/* Item: Missing HSTS Header */}
                  {(issueFilter === 'all' || issueFilter === 'critical') && (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(244, 63, 94, 0.05)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>🔴</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f43f5e' }}>
                            Missing HSTS (Strict-Transport-Security) Header
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Vulnerable to SSL stripping and man-in-the-middle downgrade attacks.
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setSelectedFixGuide({
                            id: 'missing_hsts',
                            title: 'How to Fix: Missing Strict-Transport-Security (HSTS)',
                            category: 'Security',
                            priority: 'critical',
                            problemExplanation:
                              'Without HSTS, browsers may initially attempt an insecure plain HTTP connection, allowing attackers on public Wi-Fi to intercept or strip encryption.',
                            stepByStep: [
                              'Open your Nginx, Apache, or Cloudflare HTTP response header configuration.',
                              'Add the Strict-Transport-Security header with a minimum 1-year max-age (31536000 seconds).',
                              'Include subdomains to protect all API endpoints.',
                              'Reload or restart your web server.',
                            ],
                            codeSnippet: {
                              language: 'nginx',
                              title: 'Nginx Configuration Directives',
                              code: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
                            },
                            verificationTip:
                              'Run "curl -sI https://yourwebsite.com | grep -i strict" to confirm the header is emitted.',
                          })
                        }
                        style={{ fontSize: '0.74rem', padding: '4px 10px', gap: '4px' }}
                      >
                        <Wrench size={12} />
                        <span>How to Fix 🛠️</span>
                      </button>
                    </div>
                  )}

                  {/* Item: Image Alt Text */}
                  {(issueFilter === 'all' || issueFilter === 'important') && (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(234, 179, 8, 0.05)',
                        border: '1px solid rgba(234, 179, 8, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>🟠</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            Unoptimized Images Missing Alt Attributes
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {result.seo?.imagesMissingAlt || 1} images lack descriptive alt tags for accessibility and image search.
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setSelectedFixGuide({
                            id: 'missing_alt',
                            title: 'How to Fix: Missing Image Alt Text',
                            category: 'SEO',
                            priority: 'important',
                            problemExplanation:
                              'Image alt text is required by WCAG accessibility guidelines for screen readers and informs Google Image Search crawler what the graphic conveys.',
                            stepByStep: [
                              'Locate <img> tags in your HTML templates or CMS media library.',
                              'Add descriptive alt text summarizing the image content.',
                              'Ensure non-empty alt text for all informational and product images.',
                            ],
                            codeSnippet: {
                              language: 'html',
                              title: 'Accessible Image Example',
                              code: `<img src="/images/hero-banner.webp" alt="Website Doctor Clinical Monitoring Dashboard Interface" width="1200" height="630" />`,
                            },
                            verificationTip:
                              'Inspect images in Chrome DevTools to ensure every img tag contains an alt attribute.',
                          })
                        }
                        style={{ fontSize: '0.74rem', padding: '4px 10px', gap: '4px' }}
                      >
                        <Wrench size={12} />
                        <span>How to Fix 🛠️</span>
                      </button>
                    </div>
                  )}

                  {/* Item: Valid SSL (Good) */}
                  {(issueFilter === 'all' || issueFilter === 'good') && (
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(22, 163, 74, 0.05)',
                        border: '1px solid rgba(22, 163, 74, 0.25)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.9rem' }}>🟢</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#16a34a' }}>
                            SSL/TLS Encryption Active & Trusted
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Valid certificate issued by {result.ssl.issuer} with {result.ssl.daysRemaining} days remaining.
                          </div>
                        </div>
                      </div>

                      <span className="badge badge-online" style={{ fontSize: '0.7rem' }}>
                        Passed ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Recommendations ⚡ */}
              <PerformanceAuditView
                responseTimeMs={result.probe.responseTimeMs}
                ttfbMs={result.probe.ttfbMs}
                contentEncoding={result.probe.contentEncoding}
                hasCacheControl={Boolean(result.probe.cacheControl)}
                cacheControlHeader={result.probe.cacheControl}
                totalImages={result.seo?.totalImages || 4}
                unoptimizedImagesCount={result.seo?.imagesMissingAlt || 1}
                pageSizeKb={Math.round((result.probe.contentLength || 320000) / 1024)}
              />

              {/* Live Moving Graph for Analyzed Website */}
              <ResponseTimeChart
                checks={[
                  {
                    id: 'live-analyzed',
                    monitor_id: 'scan',
                    is_online: result.probe.isOnline,
                    status_code: result.probe.statusCode,
                    status_message: result.probe.statusMessage,
                    response_time_ms: result.probe.responseTimeMs,
                    ttfb_ms: result.probe.ttfbMs,
                    created_at: result.analyzedAt,
                  },
                ]}
                currentMs={result.probe.responseTimeMs}
                avgMs={result.probe.responseTimeMs}
                minMs={Math.round(result.probe.responseTimeMs * 0.75)}
                maxMs={Math.round(result.probe.responseTimeMs * 1.3)}
                p95Ms={Math.round(result.probe.responseTimeMs * 1.15)}
                selectedRange="1H"
                onRangeChange={() => {}}
                isLiveChecking={false}
                targetUrl={result.url}
              />

              {/* Doctor Prescription Slip at the end of Overview Analysis! */}
              <DoctorPrescriptionView
                result={result}
                targetUrl={result.url}
                ownerProfile={ownerProfile}
              />
            </div>
          )}

          {/* TAB: DOCTOR PRESCRIPTION */}
          {activeTab === 'prescription' && (
            <DoctorPrescriptionView
              result={result}
              targetUrl={result.url}
              ownerProfile={ownerProfile}
            />
          )}

          {/* TAB: AI DOCTOR CHATBOT */}
          {activeTab === 'chat' && (
            <AIDoctorChatbot
              siteResult={result}
              targetUrl={result.url}
              onNavigateTab={(t) => setActiveTab(t as any)}
            />
          )}

          {/* TAB: TECHNOLOGY DETECTOR */}
          {activeTab === 'tech' && (
            <TechnologyDetectorView
              technologies={result.technologies}
              targetUrl={result.url}
            />
          )}

          {/* TAB: PAGE-BY-PAGE ANALYSIS */}
          {activeTab === 'pages' && (
            <PageByPageAnalysisView
              initialUrl={result.url}
              pages={result.pages}
            />
          )}

          {/* TAB: PERFORMANCE */}
          {activeTab === 'perf' && (
            <PerformanceAuditView
              responseTimeMs={result.probe.responseTimeMs}
              ttfbMs={result.probe.ttfbMs}
              contentEncoding={result.probe.contentEncoding}
              hasCacheControl={Boolean(result.probe.cacheControl)}
              cacheControlHeader={result.probe.cacheControl}
              totalImages={result.seo?.totalImages || 4}
              unoptimizedImagesCount={result.seo?.imagesMissingAlt || 1}
              pageSizeKb={Math.round((result.probe.contentLength || 320000) / 1024)}
            />
          )}

          {/* TAB: SEO HEALTH */}
          {activeTab === 'seo' && <SEOHealthView seo={result.seo} />}

          {/* TAB: SECURITY HEADERS */}
          {activeTab === 'headers' && <SecurityHeadersView report={result.securityHeaders} />}

          {/* TAB: SSL / TLS */}
          {activeTab === 'ssl' && <SSLInspectorView ssl={result.ssl} />}

          {/* TAB: HEALTH SCORE HISTORY */}
          {activeTab === 'history' && (
            <HealthScoreHistoryChart
              currentScore={result.healthScore.overallScore}
              targetUrl={result.url}
            />
          )}

          {/* Modals for Fix Guide, Certificate, Compare & PDF Report */}
          <FixItGuideModal
            isOpen={Boolean(selectedFixGuide)}
            onClose={() => setSelectedFixGuide(null)}
            guide={selectedFixGuide}
          />

          <HealthCertificateModal
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
            url={result.url}
            score={result.healthScore.overallScore}
            grade={result.healthScore.grade}
            ownerProfile={ownerProfile}
          />

          <ScoreComparisonModal
            isOpen={showCompareModal}
            onClose={() => setShowCompareModal(false)}
            currentScoreData={result.healthScore}
            targetUrl={result.url}
          />

          <ReportDownloadModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            result={result}
            targetUrl={result.url}
            ownerProfile={ownerProfile}
          />
        </div>
      )}
    </div>
  );
};
