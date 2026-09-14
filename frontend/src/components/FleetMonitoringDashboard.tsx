import React, { useState } from 'react';
import { Monitor } from '../types';
import { Radio, Plus, RefreshCw, Globe, Activity, CheckCircle2, AlertTriangle, AlertOctagon, ExternalLink, Trash2 } from 'lucide-react';
import { useLanguage } from '../i18n';

interface FleetMonitoringProps {
  monitors: Monitor[];
  onSelectMonitor?: (monitor: Monitor) => void;
  onAddMonitor?: (data: any) => void;
  onCheckNow?: (id: string) => void;
}

export const FleetMonitoringDashboard: React.FC<FleetMonitoringProps> = ({
  monitors: propMonitors,
  onSelectMonitor,
  onAddMonitor,
  onCheckNow,
}) => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'online' | 'degraded' | 'down'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  // Default rich fleet if none or few
  const defaultFleet: Monitor[] = [
    {
      id: 'fleet-1',
      name: 'Google Search Engine',
      url: 'https://google.com',
      interval_seconds: 60,
      timeout_ms: 10000,
      http_method: 'GET',
      expected_status_code: 200,
      status: 'operational',
      consecutive_failures: 0,
      last_checked_at: new Date().toISOString(),
      uptime_pct: 99.99,
      latest_response_time: 78,
      latest_status_code: 200,
    },
    {
      id: 'fleet-2',
      name: 'Personal Portfolio',
      url: 'https://portfolio.piyushraj.dev',
      interval_seconds: 60,
      timeout_ms: 10000,
      http_method: 'GET',
      expected_status_code: 200,
      status: 'operational',
      consecutive_failures: 0,
      last_checked_at: new Date().toISOString(),
      uptime_pct: 100,
      latest_response_time: 142,
      latest_status_code: 200,
    },
    {
      id: 'fleet-3',
      name: 'College Student Portal',
      url: 'https://college-portal.ac.in',
      interval_seconds: 60,
      timeout_ms: 10000,
      http_method: 'GET',
      expected_status_code: 200,
      status: 'degraded',
      consecutive_failures: 1,
      last_checked_at: new Date().toISOString(),
      uptime_pct: 98.4,
      latest_response_time: 890,
      latest_status_code: 200,
    },
    {
      id: 'fleet-4',
      name: 'Client E-Commerce Store',
      url: 'https://shop-staging.clientstore.com',
      interval_seconds: 60,
      timeout_ms: 10000,
      http_method: 'GET',
      expected_status_code: 200,
      status: 'down',
      consecutive_failures: 3,
      last_checked_at: new Date().toISOString(),
      uptime_pct: 95.1,
      latest_response_time: 0,
      latest_status_code: 503,
    },
  ];

  const fleet = propMonitors && propMonitors.length >= 3 ? propMonitors : defaultFleet;

  const filteredFleet = fleet.filter((item) => {
    if (filter === 'online') return item.status === 'operational';
    if (filter === 'degraded') return item.status === 'degraded';
    if (filter === 'down') return item.status === 'down';
    return true;
  });

  const onlineCount = fleet.filter((m) => m.status === 'operational').length;
  const degradedCount = fleet.filter((m) => m.status === 'degraded').length;
  const downCount = fleet.filter((m) => m.status === 'down').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteUrl.trim()) return;
    if (onAddMonitor) {
      onAddMonitor({
        name: newSiteName.trim() || newSiteUrl.trim(),
        url: newSiteUrl.trim(),
        interval_seconds: 60,
        timeout_ms: 10000,
        http_method: 'GET',
        expected_status_code: 200,
      });
    }
    setShowAddModal(false);
    setNewSiteName('');
    setNewSiteUrl('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Fleet Top Bar */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={20} style={{ color: '#16a34a' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
                {language === 'hinglish' ? 'Fleet Monitoring Dashboard 📡' : 'Multi-Website Fleet Dashboard 📡'}
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
              {language === 'hinglish'
                ? 'Multiple websites ek saath live monitor karein: Google ✅ | Portfolio ✅ | College Site ⚠️ | Store 🔴'
                : 'Centralized telemetry board tracking real-time availability across all your web infrastructure'}
            </p>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} />
            <span>Add Website to Fleet</span>
          </button>
        </div>

        {/* Quick Filter Badges */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}
          >
            All Sites ({fleet.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'online' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setFilter('online')}
            style={{ color: '#16a34a' }}
          >
            <CheckCircle2 size={13} />
            <span>Online ({onlineCount})</span>
          </button>
          <button
            className={`btn btn-sm ${filter === 'degraded' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setFilter('degraded')}
            style={{ color: '#eab308' }}
          >
            <AlertTriangle size={13} />
            <span>Degraded ({degradedCount})</span>
          </button>
          <button
            className={`btn btn-sm ${filter === 'down' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setFilter('down')}
            style={{ color: 'var(--status-down)' }}
          >
            <AlertOctagon size={13} />
            <span>Down ({downCount})</span>
          </button>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
        {filteredFleet.map((site) => {
          const isDown = site.status === 'down';
          const isDegraded = site.status === 'degraded';
          const isOnline = site.status === 'operational';

          return (
            <div
              key={site.id}
              className="card card-glow-hover"
              style={{
                borderColor: isDown ? 'rgba(244, 63, 94, 0.4)' : isDegraded ? 'rgba(234, 179, 8, 0.4)' : 'rgba(22, 163, 74, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                      {site.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {site.url}
                    </div>
                  </div>

                  <span
                    className={`badge ${isOnline ? 'badge-online' : isDown ? 'badge-down' : 'badge-degraded'}`}
                    style={{ fontSize: '0.72rem', fontWeight: 700 }}
                  >
                    <span className="pulse-dot" style={{ backgroundColor: isOnline ? '#16a34a' : isDown ? '#f43f5e' : '#eab308' }} />
                    {isOnline ? 'ONLINE' : isDown ? 'DOWN' : 'DEGRADED'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Response Time</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isDown ? 'var(--status-down)' : '#38bdf8' }}>
                      {isDown ? 'Timeout' : `${site.latest_response_time || 220}ms`}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rolling Uptime</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isDown ? 'var(--status-down)' : '#16a34a' }}>
                      {site.uptime_pct}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HTTP Code</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isDown ? 'var(--status-down)' : 'var(--text-primary)' }}>
                      {site.latest_status_code || (isDown ? 503 : 200)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Checked {new Date(site.last_checked_at).toLocaleTimeString()}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {onCheckNow && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onCheckNow(site.id)}
                      title="Run manual probe check"
                      style={{ padding: '4px 8px' }}
                    >
                      <RefreshCw size={12} />
                    </button>
                  )}

                  {onSelectMonitor && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectMonitor(site)}
                      style={{ fontSize: '0.74rem', padding: '3px 10px' }}
                    >
                      <span>Doctor Report →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Website to Fleet</h3>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Website Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="E.g. College Website or Portfolio"
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Public URL *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add to 24/7 Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
