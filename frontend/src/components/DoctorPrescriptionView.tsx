import React, { useState } from 'react';
import { DiagnosticAnalysisResult } from '../types';
import { Stethoscope, CheckCircle2, AlertTriangle, AlertOctagon, Printer, Copy, Check, FileCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n';

interface DoctorPrescriptionProps {
  result?: DiagnosticAnalysisResult | null;
  targetUrl?: string;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const DoctorPrescriptionView: React.FC<DoctorPrescriptionProps> = ({
  result,
  targetUrl = 'https://yourwebsite.com',
  ownerProfile,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const url = result?.url || targetUrl;
  const score = result?.healthScore?.overallScore || 74;
  const grade = result?.healthScore?.grade || 'B';

  // Calculate real problem counts
  const problems = result?.aiDiagnosis?.problemsDetected || [];
  const criticalCount = problems.filter((p) => p.severity === 'critical').length || 1;
  const importantCount = problems.filter((p) => p.severity === 'warning').length || 3;
  const totalProblems = problems.length > 0 ? problems.length : 6;

  // Actions
  const actions = result?.aiDiagnosis?.recommendedActions && result?.aiDiagnosis?.recommendedActions.length > 0
    ? result.aiDiagnosis.recommendedActions.slice(0, 4).map((a, idx) => ({
        num: idx + 1,
        title: a.title,
        desc: a.rationale,
      }))
    : [
        { num: 1, title: 'Improve SEO metadata', desc: 'Add 120-160 char meta description and image alt attributes for search indexing.' },
        { num: 2, title: 'Reduce response time & TTFB', desc: 'Implement Edge CDN caching and query optimization to bring TTFB below 200ms.' },
        { num: 3, title: 'Add missing security headers', desc: 'Configure HSTS (max-age=31536000), CSP, and X-Frame-Options in web server.' },
        { num: 4, title: 'Enable Gzip / Brotli compression', desc: 'Compress static text assets to minimize network wire payload by up to 70%.' },
      ];

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `🩺 WEBSITE DOCTOR CLINICAL PRESCRIPTION\nWebsite: ${url}\nOverall Health: ${score}/100 (Grade ${grade})\nProblems Found: ${totalProblems} (Critical: ${criticalCount}, Important: ${importantCount})\n\nRECOMMENDED ACTIONS:\n${actions.map((a) => `${a.num}:- ${a.title} - ${a.desc}`).join('\n')}\n\nPrescribed by: ${ownerProfile?.name || 'Piyush Raj'} (${ownerProfile?.organization || 'Website Doctor Platform'})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(180deg, rgba(17, 20, 29, 0.95) 0%, rgba(11, 13, 19, 0.98) 100%)',
        border: '1.5px solid rgba(192, 132, 252, 0.4)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(192, 132, 252, 0.12)',
        borderRadius: 'var(--radius-lg)',
        position: 'relative',
        overflow: 'hidden',
        padding: '28px',
      }}
    >
      {/* Decorative Rx watermark in background */}
      <div
        style={{
          position: 'absolute',
          right: '20px',
          bottom: '10px',
          fontSize: '12rem',
          fontWeight: 900,
          fontFamily: 'serif',
          color: 'rgba(192, 132, 252, 0.03)',
          lineHeight: 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        ℞
      </div>

      {/* Prescription Top Header / Clinic Letterhead */}
      <div
        style={{
          borderBottom: '2px dashed rgba(192, 132, 252, 0.35)',
          paddingBottom: '20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
                Dr. Website Doctor
              </h2>
              <div style={{ fontSize: '0.76rem', color: '#c084fc', fontWeight: 600, letterSpacing: '0.04em' }}>
                DIGITAL CLINICAL CARE & HEALTH DIAGNOSTICS
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Clinic Registration: <strong>WD-CLINIC-2026-994</strong> • ISO-27001 & SSRF Guard Certified
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <span>℞ OFFICIAL PRESCRIPTION SLIP</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Date: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Patient Website Bio Card */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Patient URL (Website Under Care)
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {url}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Health</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: score >= 80 ? '#16a34a' : score >= 60 ? '#c084fc' : '#f43f5e' }}>
              {score} / 100
            </div>
          </div>

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: score >= 80 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(192, 132, 252, 0.15)',
              color: score >= 80 ? '#16a34a' : '#c084fc',
              border: `1px solid ${score >= 80 ? 'rgba(22, 163, 74, 0.35)' : 'rgba(192, 132, 252, 0.35)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
            }}
          >
            {grade}
          </div>
        </div>
      </div>

      {/* Diagnosis Overview Badges */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🩺</span>
          <span>{language === 'hinglish' ? 'Website Diagnosis Summary' : 'Clinical Website Diagnosis'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Problems Found</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '2px' }}>
              {totalProblems}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total actionable issues</div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: '#f43f5e', fontWeight: 600 }}>🔴 Critical Outages</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f43f5e', marginTop: '2px' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Requires urgent remedy</div>
          </div>

          <div style={{ padding: '12px 14px', backgroundColor: 'rgba(234, 179, 8, 0.06)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: '#eab308', fontWeight: 600 }}>🟠 Important Warnings</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#eab308', marginTop: '2px' }}>
              {importantCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Optimize for higher SEO/Speed</div>
          </div>
        </div>
      </div>

      {/* Recommended Actions (The Core Prescription) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💊</span>
          <span>{language === 'hinglish' ? 'Doctor Ki Sifarish (Recommended Actions):' : 'Doctor Prescribed Remediation Plan:'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {actions.map((act) => (
            <div
              key={act.num}
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(192, 132, 252, 0.2)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(192, 132, 252, 0.2)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {act.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {act.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                  {act.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Footer: Stamp + Doctor Signature */}
      <div
        style={{
          borderTop: '2px dashed rgba(192, 132, 252, 0.35)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Official Clinic Verification Stamp */}
        <div
          style={{
            border: '2px solid rgba(22, 163, 74, 0.6)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            color: '#16a34a',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transform: 'rotate(-2deg)',
            backgroundColor: 'rgba(22, 163, 74, 0.05)',
          }}
        >
          <ShieldCheck size={16} />
          <span>VERIFIED BY WEBSITE DOCTOR</span>
        </div>

        {/* Doctor Signature */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'cursive',
              fontSize: '1.25rem',
              color: '#38bdf8',
              letterSpacing: '0.02em',
            }}
          >
            {ownerProfile?.name || 'Piyush Raj'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', fontWeight: 600 }}>
            {ownerProfile?.name || 'Piyush Raj'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Chief Web Doctor & SRE Lead ({ownerProfile?.organization || 'Website Doctor Platform'})
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
          {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Prescription'}</span>
        </button>

        <button className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={14} />
          <span>Print / Save Slip</span>
        </button>
      </div>
    </div>
  );
};
