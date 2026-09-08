import React, { useState } from 'react';
import { AlertRule, AlertLogEvent } from '../types';
import { Bell, Plus, ShieldAlert, CheckCircle2, Sliders, Mail, MessageSquare } from 'lucide-react';

interface AlertsViewProps {
  rules: AlertRule[];
  logs: AlertLogEvent[];
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onAddRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => void;
  onMarkAllRead: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  rules,
  logs,
  onToggleRule,
  onAddRule,
  onMarkAllRead,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('website_down');
  const [threshold, setThreshold] = useState(1000);
  const [channel, setChannel] = useState<'in_app' | 'email' | 'webhook'>('in_app');
  const [recipient, setRecipient] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRule({
      name: name || 'Custom Alert Trigger',
      type,
      threshold: Number(threshold),
      enabled: true,
      channel,
      recipient: recipient || undefined,
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alert Policies & Notification Feed</h1>
          <p className="page-subtitle">
            Configure automated incident dispatch thresholds across email, webhooks, and dashboard alerts
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span>New Alert Rule</span>
        </button>
      </div>

      <div className="grid-2">
        {/* Rules Config Column */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Active Alert Policies ({rules.length})</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rules.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: <strong style={{ color: 'var(--text-secondary)' }}>{r.type.replace(/_/g, ' ')}</strong>
                    {r.threshold ? ` • Threshold: ${r.threshold}` : ''} • Channel: {r.channel}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={r.enabled}
                    onChange={(e) => onToggleRule(r.id, e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Feed Column */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Bell size={18} style={{ color: 'var(--accent-indigo)' }} />
              <span>Notification Dispatch Log</span>
            </span>
            <button className="btn btn-ghost btn-sm" onClick={onMarkAllRead} style={{ fontSize: '0.74rem' }}>
              Mark all read
            </button>
          </div>

          <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {logs.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
                No alert dispatches in record.
              </div>
            ) : (
              logs.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: ev.severity === 'critical' ? 'var(--status-down-bg)' : 'rgba(255, 255, 255, 0.01)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  {ev.severity === 'critical' ? (
                    <ShieldAlert size={16} style={{ color: 'var(--status-down)', marginTop: '2px', flexShrink: 0 }} />
                  ) : (
                    <CheckCircle2 size={16} style={{ color: 'var(--status-online)', marginTop: '2px', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{ev.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {ev.message}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      {ev.websiteUrl}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Alert Rule Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Create New Alert Trigger Rule</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Prod Gateway Outage Notification"
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Trigger Condition Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                    <option value="website_down">Website Down (HTTP 5xx / Connection Error)</option>
                    <option value="response_time_high">Response Time Exceeds Latency Threshold</option>
                    <option value="ssl_expiring">SSL Certificate Expiring Soon</option>
                    <option value="status_code_changed">Status Code Differs from Expected</option>
                    <option value="consecutive_failures">Multiple Consecutive Probe Failures</option>
                    <option value="health_score_dropped">Overall Health Score Drops Below Threshold</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Numeric Threshold (ms / count / days / score)
                  </label>
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                    Dispatch Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
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
                    <option value="in_app">In-App Live Dashboard Feed</option>
                    <option value="email">Email Notification</option>
                    <option value="webhook">Custom Webhook (Slack / Discord / PagerDuty)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
