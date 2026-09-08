import React, { useState } from 'react';
import { Incident } from '../types';
import { AlertOctagon, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface IncidentsViewProps {
  incidents: Incident[];
  activeCount: number;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ incidents, activeCount }) => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const activeIncidents = incidents.filter((i) => i.status === 'active');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Incidents & Outages</h1>
          <p className="page-subtitle">
            Lifecycle tracking of downtime, degraded performance and resolution event logs
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`badge ${activeCount > 0 ? 'badge-down' : 'badge-online'}`} style={{ fontSize: '0.82rem' }}>
            {activeCount > 0 ? `${activeCount} Active Outages` : 'All Systems Operational'}
          </span>
        </div>
      </div>

      {/* Active Incidents Banner / List */}
      {activeIncidents.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)', backgroundColor: 'var(--status-down-bg)' }}>
          <div className="card-header">
            <span className="card-title" style={{ color: 'var(--status-down)' }}>
              <AlertOctagon size={18} />
              <span>Active Outage Incidents</span>
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.94rem' }}>{inc.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    Target: {inc.websiteUrl}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--status-down)', marginTop: '4px' }}>
                    Reason: {inc.cause} • Started: {new Date(inc.startedAt).toLocaleTimeString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-down" style={{ fontSize: '0.72rem' }}>
                    INVESTIGATING
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Incidents Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            <ShieldCheck size={18} style={{ color: 'var(--status-online)' }} />
            <span>Resolved Incident History ({resolvedIncidents.length})</span>
          </span>
        </div>

        {resolvedIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No past incidents recorded. Your monitors enjoy spotless uptime history.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Incident Title</th>
                  <th>Affected Monitor</th>
                  <th>Root Cause</th>
                  <th>Duration</th>
                  <th>Resolved At</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {resolvedIncidents.map((inc) => (
                  <tr key={inc.id} onClick={() => setSelectedIncident(inc)} style={{ cursor: 'pointer' }}>
                    <td>
                      <span className="badge badge-online" style={{ fontSize: '0.7rem' }}>
                        RESOLVED
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{inc.title}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {inc.websiteUrl}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inc.cause}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {inc.durationSeconds ? `${Math.round(inc.durationSeconds / 60)} min` : '< 1 min'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.74rem' }}>
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Timeline Detail Modal */}
      {selectedIncident && (
        <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedIncident.title}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {selectedIncident.websiteUrl}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIncident(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Status</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, textTransform: 'capitalize', color: selectedIncident.status === 'active' ? 'var(--status-down)' : 'var(--status-online)' }}>
                    {selectedIncident.status}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Started</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    {new Date(selectedIncident.startedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Total Duration</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>
                    {selectedIncident.durationSeconds ? `${Math.round(selectedIncident.durationSeconds / 60)} min` : 'Ongoing'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px' }}>Event Timeline</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px' }}>
                  {/* Vertical timeline rule */}
                  <div style={{ position: 'absolute', top: 6, bottom: 6, left: 7, width: '2px', backgroundColor: 'var(--border-medium)' }} />

                  {(selectedIncident.timeline || []).map((ev, i) => (
                    <div key={ev.id || i} style={{ position: 'relative' }}>
                      {/* Timeline dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-24px',
                          top: '3px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor:
                            ev.severity === 'resolved'
                              ? 'var(--status-online)'
                              : ev.severity === 'critical'
                              ? 'var(--status-down)'
                              : 'var(--accent-indigo)',
                          border: '3px solid var(--bg-surface)',
                        }}
                      />
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginTop: '2px', fontWeight: 500 }}>
                        {ev.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIncident(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
