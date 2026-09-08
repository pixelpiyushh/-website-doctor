import React, { useState } from 'react';
import { HealthScoreCalculation } from '../types';
import { Info, X, ShieldCheck, Zap, Lock, Search, Wrench } from 'lucide-react';

interface HealthScoreRingProps {
  scoreData?: HealthScoreCalculation;
}

export const HealthScoreRing: React.FC<HealthScoreRingProps> = ({ scoreData }) => {
  const [showExplanation, setShowExplanation] = useState(false);

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

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span>Website Health Score</span>
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowExplanation(true)}
          style={{ padding: '4px 8px', fontSize: '0.78rem', gap: '4px' }}
          title="Explain how score is calculated"
        >
          <Info size={14} />
          <span>Formula</span>
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
        {/* Ring Chart */}
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke="var(--border-subtle)"
              strokeWidth="10"
            />
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
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
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>
              {overallScore}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              GRADE {grade}
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
                    {cat.category}
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
                          ? '#10b981'
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

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="modal-overlay" onClick={() => setShowExplanation(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Transparent Score Methodology</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowExplanation(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                Website Doctor evaluates 5 clinical pillars derived exclusively from real network, TLS, header, and content probes. Scores are never arbitrarily generated.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
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
                      <span>{cat.category}</span>
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
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-sm" onClick={() => setShowExplanation(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
