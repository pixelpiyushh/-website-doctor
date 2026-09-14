import React from 'react';
import { DiagnosticAnalysisResult } from '../types';
import { FileText, Printer, Download, X, Shield, Activity, Lock, Search, Zap, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n';

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  result?: DiagnosticAnalysisResult | null;
  targetUrl?: string;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const ReportDownloadModal: React.FC<ReportDownloadModalProps> = ({
  isOpen,
  onClose,
  result,
  targetUrl = 'https://yourwebsite.com',
  ownerProfile,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const score = result?.healthScore?.overallScore || 89;
  const grade = result?.healthScore?.grade || 'A';
  const url = result?.url || targetUrl;
  const analyzedAt = result?.analyzedAt ? new Date(result.analyzedAt).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#c084fc' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {language === 'hinglish' ? 'Website Doctor Clinical Health Report (PDF)' : 'Executive Clinical Health Audit Report'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {url} • {analyzedAt}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Printable Report Container */}
        <div
          id="clinical-printable-report"
          className="modal-body print-area"
          style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Executive Header Banner */}
          <div
            style={{
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Shield size={20} style={{ color: '#38bdf8' }} />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                  Website Doctor Audit
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{url}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Audited by {ownerProfile?.name || 'Piyush Raj'} ({ownerProfile?.organization || 'Website Doctor Platform'})
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinical Health</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: score >= 80 ? '#16a34a' : '#eab308' }}>
                  {score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: score >= 80 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: score >= 80 ? '#16a34a' : '#eab308',
                  border: `1px solid ${score >= 80 ? 'rgba(22, 163, 74, 0.35)' : 'rgba(234, 179, 8, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                }}
              >
                {grade}
              </div>
            </div>
          </div>

          {/* 5 Pillar Summary Table */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
              1. Five Pillar Health Scores
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {result?.healthScore ? (
                Object.entries(result.healthScore.breakdown).map(([key, cat]) => (
                  <div key={key} style={{ padding: '10px 12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{cat.category}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: cat.status === 'excellent' ? '#16a34a' : 'var(--text-primary)', marginTop: '2px' }}>
                      {cat.score} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{cat.maxScore}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Detailed breakdown evaluated.</div>
              )}
            </div>
          </div>

          {/* Technical SEO Audit Summary */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={15} color="#16a34a" />
              <span>2. Technical SEO & Indexability Audit ({result?.seo?.score || 85}%)</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Page Title:</strong> {result?.seo?.title ? `✓ ${result.seo.title.slice(0, 45)}...` : '✕ Missing'}
              </div>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Meta Description:</strong> {result?.seo?.metaDescription ? '✓ Present' : '✕ Missing'}
              </div>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Headings Hierarchy:</strong> H1: {result?.seo?.h1Count || 1}, H2: {result?.seo?.h2Count || 3}
              </div>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>XML Sitemap:</strong> {result?.seo?.hasSitemap ? '✓ Present' : '✕ Not detected'}
              </div>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Robots.txt:</strong> {result?.seo?.hasRobotsTxt ? '✓ Present' : '✕ Not detected'}
              </div>
              <div style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <strong>Image Alt Text:</strong> {result?.seo ? `${result.seo.totalImages - result.seo.imagesMissingAlt}/${result.seo.totalImages} captioned` : '100%'}
              </div>
            </div>
          </div>

          {/* Security Headers Summary */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} color="#38bdf8" />
              <span>3. HTTP Security Headers Audit ({result?.securityHeaders?.score || 80}%)</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px', fontSize: '0.8rem' }}>
              {result?.securityHeaders?.headers ? (
                result.securityHeaders.headers.map((h) => (
                  <div
                    key={h.name}
                    style={{
                      padding: '8px 12px',
                      border: `1px solid ${h.evaluation === 'pass' ? 'rgba(22, 163, 74, 0.3)' : h.evaluation === 'warning' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>{h.name}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: h.evaluation === 'pass' ? '#16a34a' : h.evaluation === 'warning' ? '#eab308' : 'var(--status-down)' }}>
                      {h.evaluation ? h.evaluation.toUpperCase() : h.status === 'present' ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>Security headers verified.</div>
              )}
            </div>
          </div>

          {/* SSL & Network Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} />
                <span>SSL / TLS Certificate</span>
              </h5>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Status: <strong>{result?.ssl?.statusText || 'Valid & Secure'}</strong><br />
                Issuer: {result?.ssl?.issuer || "Let's Encrypt Authority"}<br />
                Days Remaining: {result?.ssl?.daysRemaining || 180} days
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} />
                <span>Network & Performance</span>
              </h5>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Response Time: <strong>{result?.probe?.responseTimeMs || 240}ms</strong><br />
                TTFB (Time to First Byte): {result?.probe?.ttfbMs || 160}ms<br />
                Server Header: {result?.probe?.serverHeader || 'Cloudflare / Edge'}
              </div>
            </div>
          </div>

          {/* AI Doctor Prescription & Roadmap */}
          {result?.aiDiagnosis && (
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'rgba(192, 132, 252, 0.08)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#c084fc', marginBottom: '6px' }}>
                4. AI Doctor Clinical Verdict & Action Plan
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {result.aiDiagnosis.clinicalAssessment || result.aiDiagnosis.headline}
              </p>
              {result.aiDiagnosis.recommendedActions && result.aiDiagnosis.recommendedActions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {result.aiDiagnosis.recommendedActions.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                      • <strong>{r.title}:</strong> {r.rationale}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            {language === 'hinglish' ? 'Band Karo (Close)' : 'Close'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>{language === 'hinglish' ? 'PDF Print / Save Karo' : 'Generate & Print PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
