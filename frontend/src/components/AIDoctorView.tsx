import React, { useState } from 'react';
import { AIDoctorDiagnosis } from '../types';
import { Stethoscope, AlertTriangle, CheckCircle2, Zap, ArrowRight, Copy, CheckCheck, Sparkles, Activity } from 'lucide-react';

interface AIDoctorViewProps {
  diagnosis?: AIDoctorDiagnosis;
  targetUrl?: string;
  onRefreshDiagnosis?: () => void;
  isLoading?: boolean;
}

export const AIDoctorView: React.FC<AIDoctorViewProps> = ({
  diagnosis,
  targetUrl = 'https://example.com',
  onRefreshDiagnosis,
  isLoading = false,
}) => {
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  if (!diagnosis || diagnosis.insufficientData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
        <Stethoscope size={36} style={{ color: 'var(--accent-primary)', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>AI Doctor Ready</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '6px auto 20px' }}>
          Insufficient data to determine this. Run a diagnostic check on any website to produce a clinical health report.
        </p>
        {onRefreshDiagnosis && (
          <button className="btn btn-primary" onClick={onRefreshDiagnosis} disabled={isLoading}>
            <Activity size={16} />
            <span>{isLoading ? 'Consulting AI Doctor...' : 'Analyze Website Now'}</span>
          </button>
        )}
      </div>
    );
  }

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Clinical Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)',
          border: '1px solid var(--accent-primary-border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-primary-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--accent-primary-border)',
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  {diagnosis.headline}
                </h2>
                <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                  <Sparkles size={11} />
                  {diagnosis.generatedBy}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Subject: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{targetUrl}</span> • Analyzed {new Date(diagnosis.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {onRefreshDiagnosis && (
            <button className="btn btn-secondary btn-sm" onClick={onRefreshDiagnosis} disabled={isLoading}>
              <Activity size={14} />
              <span>{isLoading ? 'Re-diagnosing...' : 'Re-run Doctor'}</span>
            </button>
          )}
        </div>

        {/* Narrative Clinical Assessment */}
        <div
          style={{
            marginTop: '16px',
            padding: '14px 18px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            color: 'var(--text-primary)',
          }}
        >
          {diagnosis.clinicalAssessment}
        </div>

        {/* Vital Signs Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            marginTop: '16px',
          }}
        >
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Availability</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--status-online)', marginTop: '2px' }}>
              {diagnosis.vitalSigns.availability}
            </div>
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Response Latency</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px' }}>
              {diagnosis.vitalSigns.responseTime}
            </div>
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SSL Health</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px' }}>
              {diagnosis.vitalSigns.sslHealth}
            </div>
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Security Headers</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px' }}>
              {diagnosis.vitalSigns.securityPosture}
            </div>
          </div>
          <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SEO Readiness</div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, marginTop: '2px' }}>
              {diagnosis.vitalSigns.seoReadiness}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Problems Detected vs Actionable Recommendations */}
      <div className="grid-2">
        {/* Problems Detected */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <AlertTriangle size={18} style={{ color: 'var(--status-down)' }} />
              <span>Problems Detected ({diagnosis.problemsDetected.length})</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {diagnosis.problemsDetected.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--status-online)', fontSize: '0.88rem' }}>
                <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                No active clinical issues detected. Website metrics are fully within optimal ranges.
              </div>
            ) : (
              diagnosis.problemsDetected.map((prob) => (
                <div
                  key={prob.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {prob.title}
                    </span>
                    <span
                      className={`badge ${
                        prob.severity === 'critical'
                          ? 'badge-down'
                          : prob.severity === 'warning'
                          ? 'badge-degraded'
                          : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {prob.severity.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {prob.description}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                    Measured fact: {prob.measuredFact}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Zap size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Prescribed Actions ({diagnosis.recommendedActions.length})</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {diagnosis.recommendedActions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No remediation actions required. Keep up regular health monitoring!
              </div>
            ) : (
              diagnosis.recommendedActions.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary-subtle)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {act.priority}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {act.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, paddingLeft: '28px' }}>
                    {act.rationale}
                  </p>

                  {act.implementationCodeSnippet && (
                    <div style={{ marginTop: '8px', paddingLeft: '28px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 6px', fontSize: '0.72rem', gap: '4px' }}
                          onClick={() => handleCopy(act.id, act.implementationCodeSnippet!)}
                        >
                          {copiedSnippetId === act.id ? (
                            <CheckCheck size={12} color="var(--status-online)" />
                          ) : (
                            <Copy size={12} />
                          )}
                          <span>{copiedSnippetId === act.id ? 'Copied' : 'Copy Snippet'}</span>
                        </button>
                      </div>
                      <pre
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'var(--bg-app)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.76rem',
                          color: 'var(--text-primary)',
                          overflowX: 'auto',
                        }}
                      >
                        {act.implementationCodeSnippet}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
