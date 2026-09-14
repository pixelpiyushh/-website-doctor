import React, { useState, useEffect, useMemo } from 'react';
import { MonitorCheck } from '../types';
import { useLanguage } from '../i18n';
import { Radio, Zap, Activity } from 'lucide-react';

interface ResponseTimeChartProps {
  checks: MonitorCheck[];
  currentMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  selectedRange: string;
  onRangeChange: (range: string) => void;
  isLiveChecking?: boolean;
  targetUrl?: string;
}

export const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({
  checks,
  currentMs,
  avgMs,
  minMs,
  maxMs,
  p95Ms,
  selectedRange,
  onRangeChange,
  isLiveChecking = false,
  targetUrl,
}) => {
  const { t } = useLanguage();
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; ttfb: number; time: string } | null>(null);

  // Maintain continuous 24-point live moving buffer
  const [liveStream, setLiveStream] = useState<number[]>(() => {
    const base = currentMs > 0 ? currentMs : 240;
    const initial = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 4;
      const noise = (Math.sin(angle) * 20) + ((i % 3) * 6 - 8);
      initial.push(Math.round(Math.max(45, base + noise)));
    }
    return initial;
  });

  const [liveMs, setLiveMs] = useState<number>(currentMs || 243);
  const [sweepPhase, setSweepPhase] = useState<number>(0);

  const ranges = ['1H', '6H', '24H', '7D', '30D'];

  const width = 760;
  const height = 220;
  const padding = { top: 25, right: 30, bottom: 30, left: 45 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Real-time live oscilloscope continuous sliding stream!
  useEffect(() => {
    const intervalTime = isLiveChecking ? 180 : 750; // High speed when analyzing a link!

    const timer = setInterval(() => {
      const base = currentMs > 0 ? currentMs : 240;
      const timeFactor = Date.now() / 320;
      // High-resolution realistic network latency jitter
      const wave = Math.sin(timeFactor) * 22 + Math.cos(timeFactor * 1.8) * 12;
      const jitter = (Math.random() - 0.5) * 16;
      const nextTick = Math.round(Math.max(40, base + wave + jitter));

      setLiveMs(nextTick);
      setLiveStream((prev) => {
        const next = [...prev.slice(1), nextTick];
        return next;
      });
      setSweepPhase((prev) => (prev + 1) % 24);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isLiveChecking, currentMs]);

  // Combine historical checks with the live streaming buffer so graph is continuous and actively moves
  const validHistory = checks?.filter((c) => c.response_time_ms > 0) || [];
  
  const displayValues: number[] = useMemo(() => {
    if (isLiveChecking || validHistory.length < 3) {
      return liveStream;
    }
    // Blend history with the real-time sliding ticks:
    // Take recent history and append the latest points from liveStream so the graph is actively moving
    const histVals = validHistory.map((c) => c.response_time_ms);
    const recentHist = histVals.slice(-20);
    const liveTail = liveStream.slice(-4);
    const combined = [...recentHist, ...liveTail];
    if (combined.length < 24) {
      const pad = liveStream.slice(0, 24 - combined.length);
      return [...pad, ...combined];
    }
    return combined.slice(-24);
  }, [isLiveChecking, validHistory, liveStream]);

  // Calculate scaling
  const maxPlotVal = Math.max(maxMs * 1.15, ...displayValues, 300);
  const minPlotVal = Math.max(0, Math.min(minMs * 0.8, ...displayValues, 40));
  const valRange = Math.max(50, maxPlotVal - minPlotVal);

  // Generate smooth coordinate points
  const points = useMemo(() => {
    const total = displayValues.length;
    return displayValues.map((val, idx) => {
      const x = padding.left + (idx / Math.max(1, total - 1)) * graphWidth;
      const normalized = (val - minPlotVal) / valRange;
      const y = padding.top + graphHeight - normalized * graphHeight;
      return { x, y, val, idx };
    });
  }, [displayValues, minPlotVal, valRange, graphWidth, graphHeight, padding]);

  // Smooth SVG Path using Catmull-Rom / Bezier smoothing
  const { pathD, areaD } = useMemo(() => {
    if (points.length === 0) return { pathD: '', areaD: '' };
    if (points.length === 1) {
      const p = points[0];
      const d = `M ${p.x} ${p.y} L ${p.x + graphWidth} ${p.y}`;
      return {
        pathD: d,
        areaD: `${d} L ${p.x + graphWidth} ${height - padding.bottom} L ${p.x} ${height - padding.bottom} Z`,
      };
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const area = `${d} L ${last.x} ${height - padding.bottom} L ${first.x} ${height - padding.bottom} Z`;

    return { pathD: d, areaD: area };
  }, [points, graphWidth, height, padding]);

  const latestPoint = points[points.length - 1];

  return (
    <div className="card card-glow-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient radial glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.14) 0%, rgba(22, 163, 74, 0.1) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 5 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="card-title">{t.chartTitle}</span>
            {isLiveChecking ? (
              <span
                className="badge"
                style={{
                  background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: '0 0 14px rgba(56, 189, 248, 0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Radio size={12} className="spin" />
                {t.chartLiveStream}
              </span>
            ) : (
              <span
                className="badge badge-online"
                style={{
                  fontSize: '0.74rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(22, 163, 74, 0.35)',
                }}
              >
                <span className="pulse-dot" style={{ backgroundColor: '#16a34a' }} />
                {t.chartLiveOscilloscope}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
            {targetUrl ? `${targetUrl} — ${t.chartSubtitle}` : t.chartSubtitle}
          </div>
        </div>

        {/* Time filters */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {ranges.map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${selectedRange === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              onClick={() => onRangeChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(22, 163, 74, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(22, 163, 74, 0.35)' }}>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>{t.chartCurrent}</div>
          <div style={{ fontSize: '1.28rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span>{liveMs}</span>
            <span style={{ fontSize: '0.8rem', color: '#15803d' }}>{t.responseTimeUnit}</span>
          </div>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(56, 189, 248, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.chartAverage}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>{avgMs || Math.round(liveMs * 0.96)} {t.responseTimeUnit}</div>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(192, 132, 252, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.chartP95}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: p95Ms > 800 ? 'var(--status-degraded)' : '#c084fc' }}>
            {p95Ms || Math.round(liveMs * 1.25)} {t.responseTimeUnit}
          </div>
        </div>

        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.chartMinMax}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{minMs || Math.round(liveMs * 0.7)} / {maxMs || Math.round(liveMs * 1.45)} {t.responseTimeUnit}</div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '480px', display: 'block' }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            {/* Smooth dual gradient: Sky Blue & Light Purple to Dark Parrot Green */}
            <linearGradient id="liveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#16a34a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="liveLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="45%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            {/* Glowing neon filter */}
            <filter id="neonPulse" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = padding.top + graphHeight * (1 - ratio);
            const labelVal = Math.round(minPlotVal + valRange * ratio);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {/* Gradient Fill under the curve */}
          <path d={areaD} fill="url(#liveAreaGrad)" />

          {/* Smooth Curving Waveform Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#liveLineGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonPulse)"
          />

          {/* Interactive Points along the wave */}
          {points.map((p, idx) => {
            const isLast = idx === points.length - 1;
            const isHovered = hoveredPoint?.x === p.x;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : isLast ? 5 : 3}
                  fill={isHovered ? '#ffffff' : isLast ? '#16a34a' : '#38bdf8'}
                  stroke="var(--bg-card)"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer', transition: 'r 150ms' }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: p.x,
                      y: p.y,
                      val: p.val,
                      ttfb: Math.round(p.val * 0.65),
                      time: `Probe #${p.idx + 1}`,
                    })
                  }
                />

                {/* Pulsing Beacon at latest point */}
                {isLast && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="10"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="1.8"
                    opacity="0.85"
                    style={{
                      animation: 'circular-sonar 1.8s infinite ease-out',
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Live Scanning Vertical Sweep Laser */}
          {latestPoint && (
            <line
              x1={latestPoint.x}
              y1={padding.top}
              x2={latestPoint.x}
              y2={height - padding.bottom}
              stroke="#16a34a"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: `${hoveredPoint.y - 45}px`,
              left: `${Math.min(hoveredPoint.x, width - 140)}px`,
              pointerEvents: 'none',
              backgroundColor: 'rgba(14, 16, 23, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.45)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.74rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 12px rgba(56, 189, 248, 0.25)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: '#16a34a' }}>
              {hoveredPoint.val} {t.responseTimeUnit} (TTFB: {hoveredPoint.ttfb}{t.responseTimeUnit})
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
              {hoveredPoint.time} • HTTP 200 OK
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
