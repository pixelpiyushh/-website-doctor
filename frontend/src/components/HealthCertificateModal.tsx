import React, { useState } from 'react';
import { Award, X, Printer, Copy, Check, ShieldCheck, Sparkles, Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HealthCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  score?: number;
  grade?: string;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const HealthCertificateModal: React.FC<HealthCertificateProps> = ({
  isOpen,
  onClose,
  url = 'https://example.com',
  score = 94,
  grade = 'A+',
  ownerProfile,
}) => {
  const { language } = useLanguage();
  const [copiedBadge, setCopiedBadge] = useState(false);

  if (!isOpen) return null;

  const certId = `WD-CERT-${Math.abs(url.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1000)).toString(16).toUpperCase()}-2026`;
  const issuedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const embedCode = `<!-- Website Doctor Certified Badge -->\n<a href="https://website-doctor-bmka.vercel.app" target="_blank" rel="noopener noreferrer">\n  <img src="https://img.shields.io/badge/Website%20Doctor-Certified%20${score}%2F100-16a34a?style=for-the-badge&logo=shield" alt="Website Doctor Certified Grade ${grade}" />\n</a>`;

  const handleCopyBadge = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: '740px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Certificate Border Card */}
        <div
          id="digital-health-certificate"
          className="print-area"
          style={{
            background: 'linear-gradient(145deg, #0d1017 0%, #151922 50%, #0d1017 100%)',
            border: '8px double #eab308',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 30px',
            boxShadow: '0 0 50px rgba(234, 179, 8, 0.25), 0 20px 60px rgba(0, 0, 0, 0.9)',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {/* Close button */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ position: 'absolute', top: '16px', right: '16px' }}
          >
            <X size={18} />
          </button>

          {/* Top Gold Medallion */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 14px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef08a 0%, #eab308 50%, #ca8a04 100%)',
              color: '#713f12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(234, 179, 8, 0.5)',
            }}
          >
            <Award size={36} />
          </div>

          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
            OFFICIAL DIGITAL VERIFICATION SEAL
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.9rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 30%, #fef08a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px',
            }}
          >
            Website Health Certificate 🏆
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 24px' }}>
            This official credential certifies that the domain below has achieved industry-standard uptime, security posture, and Core Web Vitals excellence.
          </p>

          {/* Certified Domain Callout */}
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '540px',
              margin: '0 auto 24px',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#eab308', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em' }}>
              VERIFIED CERTIFIED DOMAIN
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
              {url}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', marginTop: '6px', fontSize: '0.82rem' }}>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>Overall Score: {score}/100</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#eab308', fontWeight: 700 }}>Grade: {grade} Excellence</span>
            </div>
          </div>

          {/* Verified Criteria Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', maxWidth: '580px', margin: '0 auto 28px' }}>
            <div className="badge" style={{ backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', border: '1px solid rgba(22, 163, 74, 0.35)' }}>
              ✓ 99.9%+ Uptime Availability
            </div>
            <div className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
              ✓ Sub-200ms Server TTFB
            </div>
            <div className="badge" style={{ backgroundColor: 'rgba(192, 132, 252, 0.12)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.35)' }}>
              ✓ SSL/TLS Certificate Valid
            </div>
            <div className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.35)' }}>
              ✓ Security Headers Pass
            </div>
          </div>

          {/* Signature & Certificate ID Footer */}
          <div
            style={{
              borderTop: '1px solid rgba(234, 179, 8, 0.25)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Certificate Serial:</div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: '#eab308', fontWeight: 700 }}>
                {certId}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Issued: {issuedDate}</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'cursive', fontSize: '1.3rem', color: '#38bdf8' }}>
                {ownerProfile?.name || 'Piyush Raj'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                {ownerProfile?.name || 'Piyush Raj'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Platform Founder ({ownerProfile?.organization || 'Website Doctor Platform'})
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCopyBadge}>
            {copiedBadge ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copiedBadge ? 'Badge Code Copied!' : 'Copy Embed Badge HTML'}</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / Save Certificate PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
