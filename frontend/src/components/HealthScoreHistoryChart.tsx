import React from 'react';
import { HealthHistoryPoint } from '../types';
import { TrendingUp, CheckCircle2, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HealthHistoryProps {
  currentScore?: number;
  targetUrl?: string;
}

export const HealthScoreHistoryChart: React.FC<HealthHistoryProps> = ({
  currentScore = 74,
  targetUrl = 'https://example.com',
}) => {
  const { language } = useLanguage();

  const historyPoints: HealthHistoryPoint[] = [
    {
      date: '2026-09-10',
      displayDate: 'Sep 10',
      score: 61,
      grade: 'D',
      milestone: 'Initial Diagnostic Scan',
      resolvedIssues: ['Baseline network latency established', 'DNS records inspected'],
    },
    {
      date: '2026-09-12',
      displayDate: 'Sep 12',
      score: 69,
      grade: 'C',
      milestone: 'SSL & Caching Optimization',
      resolvedIssues: ['HTTPS redirection enabled (+4 pts)', 'Browser Cache-Control configured (+4 pts)'],
    },
    {
      date: '2026-09-14',
      displayDate: 'Sep 14 (Today)',
      score: currentScore,
      grade: currentScore >= 80 ? 'A' : currentScore >= 70 ? 'B' : 'C',
      milestone: 'SEO Tags & Alt Attributes Updated',
      resolvedIssues: ['Meta description length optimized (+3 pts)', 'Image alt attributes added (+2 pts)'],
    },
  ];

  // SVG Chart dimensions
  const width = 600;
  const height = 180;
  const padding = 35;

  const minScore = 50;
  const maxScore = 100;

  const points = historyPoints.map((pt, idx) => {
    const x = padding + (idx / (historyPoints.length - 1)) * (width - padding * 2);
    const y = height - padding - ((pt.score - minScore) / (maxScore - minScore)) * (height - padding * 2);
    return { ...pt, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="card-title">
            <TrendingUp size={18} style={{ color: '#c084fc' }} />
            <span>{language === 'hinglish' ? 'Health Score History (Tarakki Ka Graph) 📊' : 'Health Score Historical Progression 📊'}</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'hinglish'
              ? `Aapki website ka score samay ke saath kaise behtar hua: Sep 10 (61) ➔ Sep 12 (69) ➔ Sep 14 (${currentScore})`
              : `Chronological health progression for ${targetUrl} as recommendations were resolved`}
          </div>
        </div>

        <div className="badge badge-online" style={{ fontSize: '0.78rem' }}>
          <Sparkles size={12} />
          <span>+{currentScore - 61} pts Total Improvement</span>
        </div>
      </div>

      {/* SVG Trend Line Graph */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', marginTop: '10px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '420px', overflow: 'visible' }}>
          <defs>
            <linearGradient id="historyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-subtle)" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-subtle)" strokeDasharray="3 3" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#historyGradient)" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="url(#historyGradient)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Dots & Labels */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="6" fill="#0d1017" stroke="#c084fc" strokeWidth="3" />
              <circle cx={p.x} cy={p.y} r="2.5" fill="#ffffff" />
              <text x={p.x} y={p.y - 12} fill="#ffffff" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                {p.score}
              </text>
              <text x={p.x} y={height - padding + 16} fill="var(--text-muted)" fontSize="10" fontWeight="600" textAnchor="middle">
                {p.displayDate}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Timeline Steps Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
        {historyPoints.map((pt, idx) => (
          <div
            key={idx}
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(192, 132, 252, 0.15)',
                  color: '#c084fc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {pt.score}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {pt.displayDate}: {pt.milestone}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {pt.resolvedIssues.join(' • ')}
                </div>
              </div>
            </div>

            <div className="badge badge-online" style={{ fontSize: '0.72rem' }}>
              Grade {pt.grade}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
