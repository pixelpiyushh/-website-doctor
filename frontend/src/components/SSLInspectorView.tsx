import React from 'react';
import { SSLCheckResult } from '../types';
import { Lock, ShieldCheck, AlertTriangle, XCircle, ArrowRightLeft, Calendar, Key, Globe } from 'lucide-react';

interface SSLInspectorViewProps {
  ssl?: SSLCheckResult;
}

export const SSLInspectorView: React.FC<SSLInspectorViewProps> = ({ ssl }) => {
  if (!ssl) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
        No SSL certificate data available. Run a website diagnosis to inspect TLS.
      </div>
    );
  }

  const isHealthy = ssl.status === 'valid';
  const isWarning = ssl.status === 'expiring_soon';
  const isError = ssl.status === 'expired' || ssl.status === 'invalid' || ssl.status === 'none';

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <Lock size={18} style={{ color: isHealthy ? 'var(--status-online)' : isWarning ? 'var(--status-degraded)' : 'var(--status-down)' }} />
          <span>SSL / TLS Certificate Health</span>
        </span>
        <div
          className={`badge ${isHealthy ? 'badge-online' : isWarning ? 'badge-degraded' : 'badge-down'}`}
        >
          {isHealthy && <ShieldCheck size={12} />}
          {isWarning && <AlertTriangle size={12} />}
          {isError && <XCircle size={12} />}
          {ssl.statusText}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* Certificate Issuer & Validity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Certificate Issuer</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} style={{ color: 'var(--accent-primary)' }} />
              {ssl.issuer || 'Unknown Issuer'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Subject (Common Name)</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              {ssl.subject || 'Not specified'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Validity Period</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />
              <span>{ssl.validFrom || 'N/A'} — {ssl.validTo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Days remaining countdown & Redirect */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Days Remaining</span>
              <span style={{ fontWeight: 700, color: isHealthy ? 'var(--status-online)' : 'var(--status-degraded)' }}>
                {ssl.daysRemaining} Days
              </span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--border-subtle)',
                marginTop: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(5, (ssl.daysRemaining / 90) * 100))}%`,
                  backgroundColor: isHealthy ? 'var(--status-online)' : isWarning ? 'var(--status-degraded)' : 'var(--status-down)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 600ms ease',
                }}
              />
            </div>
          </div>

          {/* HTTPS Redirect Indicator */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: ssl.httpToHttpsRedirect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${ssl.httpToHttpsRedirect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
              <ArrowRightLeft size={15} style={{ color: ssl.httpToHttpsRedirect ? 'var(--status-online)' : 'var(--status-degraded)' }} />
              <span>HTTP → HTTPS Redirect</span>
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.78rem',
                color: ssl.httpToHttpsRedirect ? 'var(--status-online)' : 'var(--status-degraded)',
              }}
            >
              {ssl.httpToHttpsRedirect ? 'Enforced' : 'Not Detected'}
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Protocol: <strong style={{ color: 'var(--text-primary)' }}>{ssl.protocol || 'TLS 1.3'}</strong> • Cipher:{' '}
            <span style={{ fontFamily: 'var(--font-mono)' }}>{ssl.cipherName || 'AES-GCM'}</span>
          </div>
        </div>
      </div>

      {/* Subject Alt Names (SANs) */}
      {ssl.subjectAltNames && ssl.subjectAltNames.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={13} />
            <span>Subject Alternative Names (SANs)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {ssl.subjectAltNames.map((san, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {san}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
