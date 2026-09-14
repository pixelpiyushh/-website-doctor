import React, { useState } from 'react';
import { HealthScoreCalculation } from '../types';
import { Info, X, ShieldCheck, Zap, Lock, Search, Wrench, HelpCircle, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HealthScoreRingProps {
  scoreData?: HealthScoreCalculation;
}

export const HealthScoreRing: React.FC<HealthScoreRingProps> = ({ scoreData }) => {
  const { t, language } = useLanguage();
  const [showExplanation, setShowExplanation] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'weaknesses' | 'formula'>('weaknesses');

  if (!scoreData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No health score telemetry available yet. Run a diagnostic scan to generate score.
        </div>
      </div>
    );
  }

  const { overallScore, grade, breakdown } = scoreData;

  // Compute weak areas with lost points
  const weakAreas = Object.entries(breakdown)
    .map(([key, cat]) => ({
      key,
      ...cat,
      lostPoints: cat.maxScore - cat.score,
    }))
    .filter((cat) => cat.lostPoints > 0)
    .sort((a, b) => b.lostPoints - a.lostPoints);

  // Projected score if top 2 weaknesses are fixed
  const recoverablePoints = weakAreas.slice(0, 2).reduce((sum, w) => sum + Math.round(w.lostPoints * 0.85), 0);
  const projectedScore = Math.min(98, overallScore + recoverablePoints);

  // Circular ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  let strokeColor = 'var(--status-online)';
  if (overallScore < 60) strokeColor = 'var(--status-down)';
  else if (overallScore < 80) strokeColor = 'var(--status-degraded)';

  const categoryIcons: Record<string, any> = {
    availability: ShieldCheck,
    performance: Zap,
    security: Lock,
    seo: Search,
    technicalHealth: Wrench,
  };

  const categoryNameMap: Record<string, string> = {
    availability: t.catAvailability,
    performance: t.catPerformance,
    security: t.catSecurity,
    seo: t.catSEO,
    technicalHealth: t.catTechnical,
  };

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <span className="card-title">
          <span>{t.healthScoreTitle}</span>
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setActiveTab('weaknesses');
              setShowWhyModal(true);
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.78rem',
              gap: '6px',
              backgroundColor: 'rgba(192, 132, 252, 0.12)',
              borderColor: 'rgba(192, 132, 252, 0.4)',
              color: '#c084fc',
              fontWeight: 700,
            }}
            title="Inspect reasons for this score and see direct solutions"
          >
            <HelpCircle size={14} />
            <span>{language === 'hinglish' ? `Mera score ${overallScore} kyu hai?` : `Why is my score ${overallScore}?`}</span>
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setActiveTab('formula');
              setShowWhyModal(true);
            }}
            style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px' }}
            title="Explain how score is calculated"
          >
            <Info size={14} />
            <span>{t.formulaBtn}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
        {/* Ring Chart with Circular Motion & Purple/Skyblue Gradient */}
        <div style={{ position: 'relative', width: '136px', height: '136px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Ambient Circular Glow */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 75%)',
              filter: 'blur(10px)',
              pointerEvents: 'none',
              animation: 'pulse-glow-ring 4s infinite ease-in-out',
            }}
          />

          <svg width="136" height="136" viewBox="0 0 136 136" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#c084fc" floodOpacity="0.55" />
              </filter>
            </defs>

            {/* Rotating Outer Dashed Orbit Ring */}
            <circle
              cx="68"
              cy="68"
              r="64"
              fill="none"
              stroke="rgba(192, 132, 252, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              style={{ transformOrigin: '68px 68px', animation: 'spin-clockwise 25s linear infinite' }}
            />

            {/* Background Track */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="transparent"
              stroke="var(--border-subtle)"
              strokeWidth="10"
              transform="rotate(-90 68 68)"
            />

            {/* Progress Stroke with Gradient & Glow */}
            <circle
              cx="68"
              cy="68"
              r={radius}
              fill="transparent"
              stroke={overallScore >= 80 ? "url(#scoreRingGradient)" : strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter={overallScore >= 80 ? "url(#ringGlow)" : undefined}
              transform="rotate(-90 68 68)"
              style={{ transition: 'stroke-dashoffset 800ms ease, stroke 400ms ease' }}
            />
          </svg>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 800, lineHeight: 1, background: 'linear-gradient(135deg, #ffffff 40%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {overallScore}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.05em', marginTop: '3px' }}>
              {t.healthGrade} {grade}
            </span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '220px' }}>
          {Object.entries(breakdown).map(([key, cat]) => {
            const Icon = categoryIcons[key] || ShieldCheck;
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Icon size={13} style={{ color: 'var(--text-muted)' }} />
                    {categoryNameMap[key] || cat.category}
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {cat.score} / {cat.maxScore} pts
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--border-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${cat.percentage}%`,
                      backgroundColor:
                        cat.status === 'excellent'
                          ? 'var(--status-online)'
                          : cat.status === 'good'
                          ? '#16a34a'
                          : cat.status === 'fair'
                          ? 'var(--status-degraded)'
                          : 'var(--status-down)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 600ms ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why is my score X & Methodology Modal */}
      {showWhyModal && (
        <div className="modal-overlay" onClick={() => setShowWhyModal(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: '#c084fc' }} />
                  <span>
                    {language === 'hinglish'
                      ? `Score Analysis: Aapka Score ${overallScore}/100 Kyu Hai?`
                      : `Score Diagnostic: Why is your score ${overallScore}/100?`}
                  </span>
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {language === 'hinglish'
                    ? 'Kamiyo ki list aur score ko 90+ le jaane ke seedhe upay'
                    : 'Identified weak areas, lost points, and direct solutions to reach Grade A'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWhyModal(false)}>
                <X size={16} />
              </button>
            </div>

            {/* Projected Score Banner */}
            <div
              style={{
                margin: '16px 24px 0',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(56, 189, 248, 0.1) 100%)',
                border: '1px solid rgba(192, 132, 252, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: '#c084fc', fontWeight: 600 }}>
                  {language === 'hinglish' ? 'PROJECTION POTENTIAL' : 'OPTIMIZATION POTENTIAL'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {language === 'hinglish'
                    ? `Neeche diye gaye 2-3 steps implement karke score badhaayein:`
                    : `Fix top weak areas below to boost your website health:`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800 }}>
                <span style={{ color: 'var(--text-muted)' }}>{overallScore}</span>
                <ArrowRight size={16} color="#38bdf8" />
                <span style={{ color: '#16a34a' }}>{projectedScore}/100 (Grade A)</span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '6px', padding: '14px 24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                className={`btn btn-sm ${activeTab === 'weaknesses' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                onClick={() => setActiveTab('weaknesses')}
              >
                <span>⚠️ {language === 'hinglish' ? `Kamiyan & Upay (${weakAreas.length})` : `Weak Areas & Solutions (${weakAreas.length})`}</span>
              </button>
              <button
                className={`btn btn-sm ${activeTab === 'formula' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                onClick={() => setActiveTab('formula')}
              >
                <span>📊 {language === 'hinglish' ? 'Pura Formula Breakdown' : 'Full Formula Breakdown'}</span>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {activeTab === 'weaknesses' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {weakAreas.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontWeight: 700 }}>Fantastic! No major weak areas detected.</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Your website is scoring at the top of its clinical health tier.
                      </div>
                    </div>
                  ) : (
                    weakAreas.map((area, idx) => {
                      const Icon = categoryIcons[area.key] || AlertTriangle;
                      return (
                        <div
                          key={area.key}
                          style={{
                            padding: '14px 16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                                  color: 'var(--status-down)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                }}
                              >
                                #{idx + 1}
                              </span>
                              <strong style={{ fontSize: '0.92rem' }}>{categoryNameMap[area.key] || area.category}</strong>
                            </div>
                            <span className="badge" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--status-down)', fontWeight: 700, fontSize: '0.76rem' }}>
                              -{area.lostPoints} pts lost ({area.score}/{area.maxScore})
                            </span>
                          </div>

                          {/* Why it was dropped */}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {language === 'hinglish' ? 'Kyu Points Kate:' : 'Why points were deducted:'}
                            </span>
                            <ul style={{ paddingLeft: '18px', marginTop: '4px', color: 'var(--text-muted)' }}>
                              {area.rationale.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Actionable Solution */}
                          <div
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(22, 163, 74, 0.08)',
                              border: '1px solid rgba(22, 163, 74, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              color: '#16a34a',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                            }}
                          >
                            <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <strong>{language === 'hinglish' ? 'Doctor Ki Salah (Solution):' : 'Prescribed Remediation:'}</strong>{' '}
                              {area.key === 'seo'
                                ? 'Add missing <title>, meta description (120-160 chars), ensure single <h1>, and generate /sitemap.xml to gain up to +11 pts.'
                                : area.key === 'security'
                                ? 'Configure HSTS (Strict-Transport-Security) and Content-Security-Policy headers to gain up to +6 pts.'
                                : area.key === 'performance'
                                ? 'Enable Brotli/Gzip compression on your web server and optimize server TTFB under 250ms to gain up to +8 pts.'
                                : area.key === 'technicalHealth'
                                ? 'Fix broken 404 links and verify DNS A/AAAA records to restore up to +5 pts.'
                                : 'Ensure 100% server uptime and resolve HTTP 5xx errors to retain max availability points.'}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    Website Doctor evaluates 5 clinical pillars derived exclusively from real network, TLS, header, and content probes. Scores are never arbitrarily generated.
                  </p>

                  {Object.entries(breakdown).map(([key, cat]) => (
                    <div
                      key={key}
                      style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.88rem' }}>
                        <span>{categoryNameMap[key] || cat.category}</span>
                        <span style={{ color: 'var(--accent-primary)' }}>
                          {cat.score} / {cat.maxScore} pts ({cat.percentage}%)
                        </span>
                      </div>
                      <ul style={{ paddingLeft: '18px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {cat.rationale.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setShowWhyModal(false)}>
                {language === 'hinglish' ? 'Samajh Gaya (Done)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
