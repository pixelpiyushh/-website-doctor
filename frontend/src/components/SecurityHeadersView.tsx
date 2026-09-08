import React, { useState } from 'react';
import { SecurityHeadersReport } from '../types';
import { Shield, Check, AlertTriangle, ChevronDown, ChevronUp, Copy, CheckCheck } from 'lucide-react';

interface SecurityHeadersViewProps {
  report?: SecurityHeadersReport;
}

export const SecurityHeadersView: React.FC<SecurityHeadersViewProps> = ({ report }) => {
  const [expandedHeader, setExpandedHeader] = useState<string | null>(null);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
        No security header report available. Run website diagnosis to analyze headers.
      </div>
    );
  }

  const handleCopy = (name: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <span className="card-title">
            <Shield size={18} style={{ color: 'var(--accent-indigo)' }} />
            <span>HTTP Security Headers Audit</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Browser defense mechanisms against XSS, clickjacking, and content sniffing
          </div>
        </div>

        <div className="badge badge-info" style={{ fontSize: '0.8rem' }}>
          {report.presentCount} of {report.totalEvaluated} Configured ({report.score}%)
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {report.headers.map((h) => {
          const isPresent = h.status === 'present';
          const isExpanded = expandedHeader === h.name;

          return (
            <div
              key={h.name}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                overflow: 'hidden',
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedHeader(isExpanded ? null : h.name)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isPresent ? 'var(--status-online-bg)' : 'var(--status-degraded-bg)',
                      color: isPresent ? 'var(--status-online)' : 'var(--status-degraded)',
                    }}
                  >
                    {isPresent ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} />}
                  </div>
                  <div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600 }}>
                      {h.name}
                    </span>
                    {h.value && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '2px',
                          maxWidth: '420px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.value}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`badge ${isPresent ? 'badge-online' : 'badge-degraded'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {isPresent ? '✓ Present' : '⚠ Missing'}
                  </span>
                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Accordion Details */}
              {isExpanded && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderTop: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    fontSize: '0.84rem',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                      What This Means
                    </strong>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{h.meaning}</p>
                  </div>

                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                      Why It Matters
                    </strong>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.45 }}>{h.whyItMatters}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Recommended Fix / Header Value
                      </strong>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.72rem', gap: '4px' }}
                        onClick={() => handleCopy(h.name, h.possibleFix)}
                      >
                        {copiedName === h.name ? <CheckCheck size={12} color="var(--status-online)" /> : <Copy size={12} />}
                        <span>{copiedName === h.name ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        overflowX: 'auto',
                      }}
                    >
                      {h.possibleFix}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '14px', fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        ℹ Note: Missing headers indicate opportunities to harden defenses. Missing an optional header does not automatically mean a site is compromised.
      </div>
    </div>
  );
};
