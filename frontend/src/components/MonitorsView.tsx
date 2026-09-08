import React, { useState } from 'react';
import { Monitor } from '../types';
import { Globe, Plus, Play, Pause, Trash2, RefreshCw, ExternalLink, Activity, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';

interface MonitorsViewProps {
  monitors: Monitor[];
  onSelectMonitor: (monitor: Monitor) => void;
  onCreateMonitor: (data: {
    url: string;
    name: string;
    interval_seconds: number;
    timeout_ms: number;
    http_method: string;
    expected_status_code: number;
    keyword_match?: string;
  }) => Promise<void>;
  onToggleStatus: (id: string, newStatus: 'operational' | 'paused') => Promise<void>;
  onDeleteMonitor: (id: string) => Promise<void>;
  onCheckNow: (id: string) => Promise<void>;
  isCreating?: boolean;
}

export const MonitorsView: React.FC<MonitorsViewProps> = ({
  monitors,
  onSelectMonitor,
  onCreateMonitor,
  onToggleStatus,
  onDeleteMonitor,
  onCheckNow,
  isCreating = false,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);

  // Form State
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [intervalSec, setIntervalSec] = useState(60);
  const [timeoutMs, setTimeoutMs] = useState(10000);
  const [httpMethod, setHttpMethod] = useState('GET');
  const [expectedCode, setExpectedCode] = useState(200);
  const [keywordMatch, setKeywordMatch] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    await onCreateMonitor({
      url,
      name: name || url,
      interval_seconds: Number(intervalSec),
      timeout_ms: Number(timeoutMs),
      http_method: httpMethod,
      expected_status_code: Number(expectedCode),
      keyword_match: keywordMatch || undefined,
    });

    setShowCreateModal(false);
    setUrl('');
    setName('');
    setKeywordMatch('');
  };

  const handleCheckClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckingId(id);
    try {
      await onCheckNow(id);
    } finally {
      setCheckingId(null);
    }
  };

  const filtered = monitors.filter(
    (m) =>
      m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Monitors</h1>
          <p className="page-subtitle">
            Continuous health checks, availability monitoring and failure incident tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Filter monitors..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '8px 12px 8px 30px',
                fontSize: '0.84rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                width: '200px',
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
          </div>

          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Create Monitor</span>
          </button>
        </div>
      </div>

      {/* Monitors Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Globe size={28} />
          </div>
          <h3 className="empty-state-title">No Monitors Found</h3>
          <p className="empty-state-desc">
            Add your first website URL to commence 24/7 continuous health, latency, and uptime monitoring.
          </p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Add First Website</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((m) => {
            const isOnline = m.status === 'operational';
            const isDegraded = m.status === 'degraded';
            const isDown = m.status === 'down';
            const isPaused = m.status === 'paused';

            return (
              <div
                key={m.id}
                className="card"
                onClick={() => onSelectMonitor(m)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ maxWidth: '210px', overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.96rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {m.url}
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        isOnline
                          ? 'badge-online'
                          : isDegraded
                          ? 'badge-degraded'
                          : isDown
                          ? 'badge-down'
                          : 'badge-neutral'
                      }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {isOnline && <span className="pulse-dot" />}
                      {isOnline ? 'Operational' : isDegraded ? 'Degraded' : isDown ? 'Down' : 'Paused'}
                    </span>
                  </div>

                  {/* Telemetry Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', margin: '12px 0' }}>
                    <div style={{ padding: '6px 10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Response</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
                        {m.latest_response_time || 0} ms
                      </div>
                    </div>
                    <div style={{ padding: '6px 10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Uptime</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
                        {m.uptime_pct}%
                      </div>
                    </div>
                    <div style={{ padding: '6px 10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Interval</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>
                        {m.interval_seconds}s
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Last check: {m.last_checked_at ? new Date(m.last_checked_at).toLocaleTimeString() : 'Pending'}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
                      onClick={(e) => handleCheckClick(m.id, e)}
                      disabled={checkingId === m.id}
                      title="Run manual probe right now"
                    >
                      <RefreshCw size={13} className={checkingId === m.id ? 'spin' : ''} />
                      <span>Check</span>
                    </button>

                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.74rem', gap: '4px' }}
                      onClick={() => onToggleStatus(m.id, isPaused ? 'operational' : 'paused')}
                      title={isPaused ? 'Resume monitoring' : 'Pause monitoring'}
                    >
                      {isPaused ? <Play size={13} color="var(--status-online)" /> : <Pause size={13} />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '4px 8px', color: 'var(--status-down)' }}
                    onClick={() => {
                      if (confirm(`Delete monitor "${m.name}"?`)) {
                        onDeleteMonitor(m.id);
                      }
                    }}
                    title="Delete monitor"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Monitor Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Create New Website Monitor</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Target Website URL *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    Protected by SSRF guard (localhost and internal IPs are restricted).
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Friendly Monitor Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="E.g. Production Landing Page"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Check Interval
                    </label>
                    <select
                      value={intervalSec}
                      onChange={(e) => setIntervalSec(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <option value={30}>Every 30 Seconds</option>
                      <option value={60}>Every 1 Minute</option>
                      <option value={300}>Every 5 Minutes</option>
                      <option value={900}>Every 15 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={timeoutMs}
                      onChange={(e) => setTimeoutMs(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      HTTP Method
                    </label>
                    <select
                      value={httpMethod}
                      onChange={(e) => setHttpMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    >
                      <option value="GET">GET</option>
                      <option value="HEAD">HEAD</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                      Expected Status Code
                    </label>
                    <input
                      type="number"
                      value={expectedCode}
                      onChange={(e) => setExpectedCode(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: 'var(--bg-input)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Optional Keyword / Content Check
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Welcome or Status: OK"
                    value={keywordMatch}
                    onChange={(e) => setKeywordMatch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Start Monitoring'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
