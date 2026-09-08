import React, { useState } from 'react';
import { MonitorCheck } from '../types';

interface ResponseTimeChartProps {
  checks: MonitorCheck[];
  currentMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  selectedRange: string;
  onRangeChange: (range: string) => void;
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
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; check: MonitorCheck } | null>(null);

  const ranges = ['1H', '6H', '24H', '7D', '30D'];

  const width = 760;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const validChecks = checks.filter((c) => c.response_time_ms > 0);
  const maxVal = Math.max(maxMs * 1.15, 300);

  // Generate SVG Path
  const points = validChecks.map((c, i) => {
    const x = padding.left + (i / Math.max(1, validChecks.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (c.response_time_ms / maxVal) * graphHeight;
    return { x, y, check: c };
  });

  const pathD = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
    : '';

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="card-title">Response Time & Latency Trends</span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            High-precision end-to-end network duration
          </div>
        </div>

        {/* Time filters */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
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
        }}
      >
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{currentMs} ms</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Average</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{avgMs} ms</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>P95 Latency</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: p95Ms > 800 ? 'var(--status-degraded)' : 'var(--text-primary)' }}>{p95Ms} ms</div>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Min / Max</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{minMs} / {maxMs} ms</div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        {validChecks.length === 0 ? (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            Collecting initial telemetry points...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: '100%', height: 'auto', minWidth: '480px', display: 'block' }}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, idx) => {
              const y = padding.top + graphHeight * (1 - ratio);
              const labelVal = Math.round(maxVal * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="var(--border-subtle)"
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

            {/* Gradient Fill */}
            <path d={areaD} fill="url(#areaGrad)" />

            {/* Line Stroke */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Points */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.check.id === p.check.id ? 5 : 2.5}
                fill={hoveredPoint?.check.id === p.check.id ? '#fff' : 'var(--accent-primary)'}
                stroke="var(--bg-app)"
                strokeWidth="1.5"
                style={{ cursor: 'pointer', transition: 'r 150ms' }}
                onMouseEnter={() => setHoveredPoint(p)}
              />
            ))}
          </svg>
        )}

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: `${hoveredPoint.y - 45}px`,
              left: `${Math.min(hoveredPoint.x, width - 120)}px`,
              pointerEvents: 'none',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              fontSize: '0.74rem',
              boxShadow: 'var(--shadow-dropdown)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
              {hoveredPoint.check.response_time_ms} ms (TTFB: {hoveredPoint.check.ttfb_ms}ms)
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              {new Date(hoveredPoint.check.created_at).toLocaleTimeString()} • HTTP {hoveredPoint.check.status_code}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
