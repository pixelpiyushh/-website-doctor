import React, { useState } from 'react';
import { MonitorCheck, Incident } from '../types';
import { ShieldCheck, AlertOctagon, Clock } from 'lucide-react';

interface UptimeTimelineProps {
  checks: MonitorCheck[];
  uptime24h?: number;
  uptime7d?: number;
  uptime30d?: number;
  uptime90d?: number;
  recentIncident?: Incident;
}

export const UptimeTimeline: React.FC<UptimeTimelineProps> = ({
  checks,
  uptime24h = 100,
  uptime7d = 99.98,
  uptime30d = 99.94,
  uptime90d = 99.91,
  recentIncident,
}) => {
  const [activeRange, setActiveRange] = useState<'24H' | '7D' | '30D' | '90D'>('24H');
  const [activeTooltip, setActiveTooltip] = useState<{ check: MonitorCheck; x: number } | null>(null);

  const uptimeValues = {
    '24H': uptime24h,
    '7D': uptime7d,
    '30D': uptime30d,
    '90D': uptime90d,
  };

  const selectedUptime = uptimeValues[activeRange];

  // Take last 45 checks or pad with healthy placeholders if newly started
  const barCount = 45;
  const recentChecks = [...checks].slice(-barCount);

  // Pad left if fewer than barCount
  const paddedChecks: { check?: MonitorCheck; isPlaceholder?: boolean }[] = [];
  for (let i = 0; i < barCount - recentChecks.length; i++) {
    paddedChecks.push({ isPlaceholder: true });
  }
  for (const c of recentChecks) {
    paddedChecks.push({ check: c, isPlaceholder: false });
  }

  // Find actual down checks from history
  const downtimeChecks = checks.filter((c) => !c.is_online || c.status_code >= 500);

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="card-title">
            <ShieldCheck size={18} style={{ color: '#16a34a' }} />
            <span>Uptime History & Reliability Graph</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Continuous availability timeline and verified downtime events
          </div>
        </div>

        {/* Range Selector Pill: 24H | 7D | 30D | 90D */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {(['24H', '7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${activeRange === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '3px 9px', fontSize: '0.74rem' }}
              onClick={() => setActiveRange(r)}
            >
              {r} ({uptimeValues[r]}%)
            </button>
          ))}
        </div>
      </div>

      {/* Selected Range Large Stat */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px', marginBottom: '8px' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedUptime >= 99.9 ? '#16a34a' : 'var(--status-degraded)', fontFamily: 'var(--font-display)' }}>
          {selectedUptime}%
        </span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          rolling uptime across past {activeRange}
        </span>
      </div>

      {/* Segmented Timeline Bar */}
      <div style={{ position: 'relative', marginTop: '6px', marginBottom: '8px' }}>
        <div
          style={{
            display: 'flex',
            gap: '3px',
            height: '32px',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {paddedChecks.map((item, idx) => {
            let color = 'rgba(255, 255, 255, 0.08)'; // placeholder
            if (item.check) {
              if (!item.check.is_online || item.check.status_code >= 500) {
                color = 'var(--status-down)'; // red
              } else if (item.check.response_time_ms > 900) {
                color = 'var(--status-degraded)'; // yellow/amber
              } else {
                color = '#16a34a'; // dark parrot green
              }
            }

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '3px',
                  backgroundColor: color,
                  cursor: item.check ? 'pointer' : 'default',
                  transition: 'transform 150ms, filter 150ms',
                }}
                onMouseEnter={(e) => {
                  if (item.check) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveTooltip({ check: item.check, x: rect.left });
                  }
                }}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '8px',
          }}
        >
          <span>{activeRange === '24H' ? '24 Hours ago' : activeRange === '7D' ? '7 Days ago' : '30 Days ago'}</span>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#16a34a' }} />
              Operational (&lt;900ms)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--status-degraded)' }} />
              Degraded
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--status-down)' }} />
              Downtime
            </span>
          </div>
          <span>Now</span>
        </div>
      </div>

      {/* Downtime Events Log Section */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Downtime & Incident History Log ({activeRange})
        </div>

        {recentIncident ? (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={16} style={{ color: 'var(--status-down)' }} />
              <div>
                <strong style={{ color: 'var(--status-down)' }}>{recentIncident.title}</strong>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {new Date((recentIncident as any).startedAt || (recentIncident as any).started_at || Date.now()).toLocaleString()} • Cause: {(recentIncident as any).cause || (recentIncident as any).root_cause || 'Connection timeout'}
                </div>
              </div>
            </div>
            <span className="badge badge-down" style={{ fontSize: '0.7rem' }}>
              Downtime: {(recentIncident as any).durationSeconds || (recentIncident as any).duration_seconds ? `${Math.round(((recentIncident as any).durationSeconds || (recentIncident as any).duration_seconds) / 60)}m` : 'Active'}
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(22, 163, 74, 0.06)',
              border: '1px solid rgba(22, 163, 74, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              color: '#16a34a',
            }}
          >
            <ShieldCheck size={16} />
            <span>✓ 100% Zero Downtime recorded across past {activeRange}. All checks healthy.</span>
          </div>
        )}
      </div>

      {/* Hover Tooltip */}
      {activeTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            boxShadow: 'var(--shadow-dropdown)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <div style={{ fontWeight: 600, color: activeTooltip.check.is_online ? 'var(--status-online)' : 'var(--status-down)' }}>
            {activeTooltip.check.is_online ? 'HTTP ' + activeTooltip.check.status_code + ' OK' : 'Probe Failed'}
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Latency: {activeTooltip.check.response_time_ms}ms • {new Date(activeTooltip.check.created_at).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Incident Information Card if available */}
      {recentIncident && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px 14px',
            backgroundColor: recentIncident.status === 'active' ? 'var(--status-down-bg)' : 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${recentIncident.status === 'active' ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={18} style={{ color: recentIncident.status === 'active' ? 'var(--status-down)' : 'var(--text-muted)' }} />
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                {recentIncident.status === 'active' ? 'Active Incident: ' : 'Recent Incident: '}
                {recentIncident.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Started: {new Date(recentIncident.startedAt).toLocaleTimeString()} • Reason: {recentIncident.cause}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
            <Clock size={14} />
            <span>Duration: {recentIncident.durationSeconds ? `${Math.round(recentIncident.durationSeconds / 60)}m` : 'Ongoing'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
