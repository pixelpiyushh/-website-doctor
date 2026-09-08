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
  const [activeTooltip, setActiveTooltip] = useState<{ check: MonitorCheck; x: number } | null>(null);

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

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <span className="card-title">
            <ShieldCheck size={18} style={{ color: 'var(--status-online)' }} />
            <span>Uptime & Reliability Record</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Continuous availability timeline across monitoring intervals
          </div>
        </div>

        {/* Uptime Stat Chips */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>24 Hours</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: uptime24h >= 99.9 ? 'var(--status-online)' : 'var(--status-degraded)' }}>
              {uptime24h}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>7 Days</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{uptime7d}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>30 Days</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{uptime30d}%</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>90 Days</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{uptime90d}%</div>
          </div>
        </div>
      </div>

      {/* Segmented Timeline Bar */}
      <div style={{ position: 'relative', marginTop: '14px', marginBottom: '8px' }}>
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
                color = 'var(--status-online)'; // green
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
          <span>Older checks</span>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--status-online)' }} />
              Operational (&lt;900ms)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--status-degraded)' }} />
              Degraded (&gt;900ms)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: 'var(--status-down)' }} />
              Down / Error
            </span>
          </div>
          <span>Just now</span>
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
      </div>

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
