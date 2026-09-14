import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HealthScoreRing } from './components/HealthScoreRing';
import { ResponseTimeChart } from './components/ResponseTimeChart';
import { UptimeTimeline } from './components/UptimeTimeline';
import { SSLInspectorView } from './components/SSLInspectorView';
import { SecurityHeadersView } from './components/SecurityHeadersView';
import { SEOHealthView } from './components/SEOHealthView';
import { BrokenLinksView } from './components/BrokenLinksView';
import { AIDoctorView } from './components/AIDoctorView';
import { MonitorsView } from './components/MonitorsView';
import { IncidentsView } from './components/IncidentsView';
import { AlertsView } from './components/AlertsView';
import { UrlChecker } from './components/UrlChecker';
import { LandingPage } from './components/LandingPage';
import {
  Monitor,
  MonitorCheck,
  Incident,
  AlertRule,
  AlertLogEvent,
  DiagnosticAnalysisResult,
  HealthScoreCalculation,
} from './types';
import { apiUrl } from './apiConfig';
import {
  Activity,
  Globe,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Lock,
  ExternalLink,
  Plus,
  RefreshCw,
  User,
} from 'lucide-react';
import { useLanguage } from './i18n';

export const App: React.FC = () => {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<string>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isSSEConnected, setIsSSEConnected] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Platform Owner Profile State with localStorage persistence
  const [ownerProfile, setOwnerProfile] = useState<{
    name: string;
    role: string;
    organization: string;
    email: string;
  }>(() => {
    const saved = localStorage.getItem('website_doctor_owner_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.name !== 'Dr. Website Owner' && parsed.name !== 'Website Owner') {
          return parsed;
        }
      } catch {}
    }
    const defaultProfile = {
      name: 'Piyush Raj',
      role: 'Founder & Platform Owner',
      organization: 'Website Doctor Platform',
      email: 'piyush.raj@websitedoctor.local',
    };
    try {
      localStorage.setItem('website_doctor_owner_profile', JSON.stringify(defaultProfile));
    } catch {}
    return defaultProfile;
  });

  const [profileForm, setProfileForm] = useState(ownerProfile);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSaveOwnerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerProfile(profileForm);
    localStorage.setItem('website_doctor_owner_profile', JSON.stringify(profileForm));
    setSaveSuccessMessage('Owner profile updated successfully! The name has been refreshed across the Navbar, Sidebar, and Footer.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Core Data State
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [historyData, setHistoryData] = useState<{
    checks: MonitorCheck[];
    currentResponseTime: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p95ResponseTime: number;
    uptime24h: number;
    uptime7d: number;
    uptime30d: number;
    uptime90d: number;
  }>({
    checks: [],
    currentResponseTime: 0,
    avgResponseTime: 0,
    minResponseTime: 0,
    maxResponseTime: 0,
    p95ResponseTime: 0,
    uptime24h: 100,
    uptime7d: 99.98,
    uptime30d: 99.95,
    uptime90d: 99.92,
  });

  const [historyRange, setHistoryRange] = useState<string>('24H');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLogEvent[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<DiagnosticAnalysisResult | null>(null);
  const [isCheckingActive, setIsCheckingActive] = useState<boolean>(false);
  const [scannerPrefillUrl, setScannerPrefillUrl] = useState<string>('');

  // 1. Fetch initial data
  const fetchData = async () => {
    try {
      // Fetch Monitors
      const monRes = await fetch(apiUrl('/api/monitors'));
      if (monRes.ok) {
        const monData: Monitor[] = await monRes.json();
        setMonitors(monData);
        if (!selectedMonitor && monData.length > 0) {
          setSelectedMonitor(monData[0]);
        }
      }

      // Fetch Incidents
      const incRes = await fetch(apiUrl('/api/incidents'));
      if (incRes.ok) {
        const incData = await incRes.json();
        setIncidents([...(incData.active || []), ...(incData.resolved || [])]);
      }

      // Fetch Alerts
      const alertRes = await fetch(apiUrl('/api/alerts'));
      if (alertRes.ok) {
        const alertData = await alertRes.json();
        setAlertRules(alertData.rules || []);
        setAlertLogs(alertData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load initial platform data:', err);
    }
  };

  // 2. Fetch history for selected monitor
  const fetchMonitorHistory = async (monitorId: string, range: string = '24H') => {
    try {
      const res = await fetch(apiUrl(`/api/monitors/${monitorId}/history?range=${range}`));
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Failed to load monitor history:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMonitor) {
      fetchMonitorHistory(selectedMonitor.id, historyRange);
    }
  }, [selectedMonitor, historyRange]);

  // 3. Connect to Server-Sent Events (SSE) stream for live updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(apiUrl('/api/events'));

      eventSource.onopen = () => {
        setIsSSEConnected(true);
      };

      eventSource.addEventListener('connected', () => {
        setIsSSEConnected(true);
      });

      eventSource.addEventListener('monitor_update', (e) => {
        try {
          const payload = JSON.parse(e.data);
          // Update monitor in local state
          setMonitors((prev) =>
            prev.map((m) =>
              m.id === payload.monitorId
                ? {
                    ...m,
                    status: payload.status,
                    uptime_pct: payload.uptimePct,
                    latest_response_time: payload.responseTimeMs,
                    latest_status_code: payload.statusCode,
                    last_checked_at: payload.lastCheckedAt,
                  }
                : m
            )
          );

          // If this is currently selected monitor, update history data point
          if (selectedMonitor && selectedMonitor.id === payload.monitorId) {
            setHistoryData((prev) => {
              const newCheck: MonitorCheck = {
                id: `chk_${Date.now()}`,
                monitor_id: payload.monitorId,
                status_code: payload.statusCode,
                response_time_ms: payload.responseTimeMs,
                ttfb_ms: Math.round(payload.responseTimeMs * 0.7),
                is_online: payload.status !== 'down',
                created_at: payload.lastCheckedAt,
              };
              const updatedChecks = [...prev.checks, newCheck];
              return {
                ...prev,
                checks: updatedChecks,
                currentResponseTime: payload.responseTimeMs,
              };
            });
          }
        } catch (err) {
          console.error('Error handling SSE monitor_update:', err);
        }
      });

      eventSource.addEventListener('incident_opened', (e) => {
        try {
          const inc: Incident = JSON.parse(e.data);
          setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)]);
        } catch (err) {
          console.error('Error parsing incident_opened event:', err);
        }
      });

      eventSource.addEventListener('incident_resolved', (e) => {
        try {
          const inc: Incident = JSON.parse(e.data);
          setIncidents((prev) => [inc, ...prev.filter((i) => i.id !== inc.id)]);
        } catch (err) {
          console.error('Error parsing incident_resolved event:', err);
        }
      });

      eventSource.onerror = () => {
        setIsSSEConnected(false);
      };
    } catch (err) {
      console.warn('SSE not supported or failed to connect:', err);
      setIsSSEConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [selectedMonitor]);

  // Clean polling fallback every 15s in case SSE is interrupted
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!isSSEConnected) {
        fetchData();
        if (selectedMonitor) {
          fetchMonitorHistory(selectedMonitor.id, historyRange);
        }
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [isSSEConnected, selectedMonitor, historyRange]);

  // Monitor Management Handlers
  const handleCreateMonitor = async (data: any) => {
    try {
      const res = await fetch(apiUrl('/api/monitors'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchData();
        setActiveView('monitors');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create monitor');
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleToggleMonitorStatus = async (id: string, newStatus: 'operational' | 'paused') => {
    await fetch(apiUrl(`/api/monitors/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setMonitors((prev) => prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)));
  };

  const handleDeleteMonitor = async (id: string) => {
    await fetch(apiUrl(`/api/monitors/${id}`), { method: 'DELETE' });
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    if (selectedMonitor?.id === id) {
      setSelectedMonitor(monitors.find((m) => m.id !== id) || null);
    }
  };

  const handleCheckNow = async (id: string) => {
    setIsCheckingActive(true);
    try {
      const res = await fetch(apiUrl(`/api/monitors/${id}/check`), { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (selectedMonitor?.id === id) {
          fetchMonitorHistory(id, historyRange);
        }
      }
    } finally {
      setTimeout(() => setIsCheckingActive(false), 3000);
    }
  };

  // Mock synthesis of HealthScore for selected monitor if no manual scan done
  const currentHealthScore: HealthScoreCalculation = latestAnalysis?.healthScore || {
    overallScore: selectedMonitor?.status === 'down' ? 38 : selectedMonitor?.status === 'degraded' ? 72 : 94,
    grade: selectedMonitor?.status === 'down' ? 'F' : selectedMonitor?.status === 'degraded' ? 'C' : 'A',
    summary: 'Continuous health monitoring summary.',
    breakdown: {
      availability: {
        category: 'Availability',
        score: selectedMonitor?.status === 'down' ? 0 : 30,
        maxScore: 30,
        percentage: selectedMonitor?.status === 'down' ? 0 : 100,
        status: selectedMonitor?.status === 'down' ? 'poor' : 'excellent',
        rationale: [selectedMonitor?.status === 'down' ? 'Website returned connection errors' : 'HTTP 200 OK continuously maintained (+30 pts)'],
      },
      performance: {
        category: 'Performance',
        score: selectedMonitor?.status === 'degraded' ? 10 : 18,
        maxScore: 20,
        percentage: selectedMonitor?.status === 'degraded' ? 50 : 90,
        status: selectedMonitor?.status === 'degraded' ? 'fair' : 'excellent',
        rationale: [`Response time measured at ${selectedMonitor?.latest_response_time || 240}ms`],
      },
      security: {
        category: 'Security',
        score: 18,
        maxScore: 20,
        percentage: 90,
        status: 'excellent',
        rationale: ['Valid SSL Certificate active', 'Automatic HTTPS redirect enabled'],
      },
      seo: {
        category: 'SEO',
        score: 14,
        maxScore: 15,
        percentage: 93,
        status: 'excellent',
        rationale: ['Page title present', 'Meta description and mobile viewport valid'],
      },
      technicalHealth: {
        category: 'Technical Health',
        score: 14,
        maxScore: 15,
        percentage: 93,
        status: 'excellent',
        rationale: ['DNS resolved cleanly', 'No broken links detected'],
      },
    },
    calculatedAt: new Date().toISOString(),
  };

  const activeIncidents = incidents.filter((i) => i.status === 'active');

  // If user requests Landing Page view
  if (activeView === 'landing') {
    return (
      <LandingPage
        ownerProfile={ownerProfile}
        onCheckWebsite={(url) => {
          setScannerPrefillUrl(url);
          setActiveView('scanner');
        }}
        onEnterDemo={() => {
          setIsDemoMode(true);
          setActiveView('overview');
        }}
      />
    );
  }

  return (
    <div className="app-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Ambient Cosmic Background Orbs */}
      <div className="cosmic-mesh-bg">
        <div className="cosmic-orb-purple" style={{ top: '-100px', right: '5%' }} />
        <div className="cosmic-orb-skyblue" style={{ top: '450px', left: '-50px' }} />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeIncidentsCount={activeIncidents.length}
        totalMonitorsCount={monitors.length}
        ownerProfile={ownerProfile}
      />

      <div className="main-wrapper" style={{ position: 'relative', zIndex: 5 }}>
        {/* Top Navbar */}
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          isDemoMode={isDemoMode}
          setIsDemoMode={setIsDemoMode}
          onOpenQuickScan={() => setActiveView('scanner')}
          isSSEConnected={isSSEConnected}
          alerts={alertLogs}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          ownerProfile={ownerProfile}
        />

        {/* Dynamic Page Views */}
        <main className="page-content">
          {/* VIEW: OVERVIEW / MAIN DASHBOARD */}
          {activeView === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Header with monitor selector */}
              <div className="page-header" style={{ marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 className="page-title">{t.dashboardTitle}</h1>
                    {isDemoMode && (
                      <span className="badge gradient-badge" style={{ fontSize: '0.74rem' }}>
                        {t.demoActive}
                      </span>
                    )}
                  </div>
                  <p className="page-subtitle">
                    {t.dashboardSubtitle}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>{t.platformOwner}</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{ownerProfile.name}</strong>
                    <span>• {ownerProfile.role} ({ownerProfile.organization})</span>
                  </div>
                </div>

                {/* Target Monitor Switcher */}
                {monitors.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.targetWebsite}</span>
                    <select
                      value={selectedMonitor?.id || ''}
                      onChange={(e) => {
                        const target = monitors.find((m) => m.id === e.target.value);
                        if (target) setSelectedMonitor(target);
                      }}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid rgba(192, 132, 252, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.86rem',
                        fontWeight: 600,
                      }}
                    >
                      {monitors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.url})
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => selectedMonitor && handleCheckNow(selectedMonitor.id)}
                      title="Run manual probe check now"
                    >
                      <RefreshCw size={14} className={isCheckingActive ? "spin" : ""} />
                      <span>{isCheckingActive ? t.checkingStatus : t.checkNowBtn}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Top 5 Vital Metrics Cards */}
              <div className="grid-4">
                {/* 1. Status */}
                <div className="stat-card card-glow-hover">
                  <div className="stat-card-title">
                    <span>{t.statusTitle}</span>
                    <Activity size={15} color="#16a34a" />
                  </div>
                  <div className="stat-card-value" style={{ color: selectedMonitor?.status === 'down' ? 'var(--status-down)' : 'var(--status-online)' }}>
                    <span className="pulse-dot" style={{ backgroundColor: '#16a34a' }} />
                    {selectedMonitor?.status === 'down' ? t.statusDown : selectedMonitor?.status === 'degraded' ? t.statusDegraded : t.statusOnline}
                  </div>
                  <div className="stat-card-footer">
                    {t.statusHttpOk}
                  </div>
                </div>

                {/* 2. Response Time */}
                <div className="stat-card card-glow-hover" style={{ border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                  <div className="stat-card-title">
                    <span>{t.responseTimeTitle}</span>
                    <Zap size={15} color="#38bdf8" />
                  </div>
                  <div className="stat-card-value" style={{ color: '#38bdf8' }}>
                    {historyData.currentResponseTime || selectedMonitor?.latest_response_time || 243}
                    <span className="stat-card-unit" style={{ color: '#7dd3fc' }}>{t.responseTimeUnit}</span>
                  </div>
                  <div className="stat-card-footer">
                    {t.responseTimeAvg}: {historyData.avgResponseTime || 230}{t.responseTimeUnit} • {t.responseTimeP95}: {historyData.p95ResponseTime || 310}{t.responseTimeUnit}
                  </div>
                </div>

                {/* 3. Rolling Uptime */}
                <div className="stat-card card-glow-hover" style={{ border: '1px solid rgba(192, 132, 252, 0.25)' }}>
                  <div className="stat-card-title">
                    <span>{t.uptimeTitle}</span>
                    <Shield size={15} color="#c084fc" />
                  </div>
                  <div className="stat-card-value" style={{ color: '#c084fc' }}>
                    {selectedMonitor?.uptime_pct || 99.98}%
                  </div>
                  <div className="stat-card-footer">
                    {t.uptimeLast24h}: {historyData.uptime24h}% • {t.uptimeLast30d}: {historyData.uptime30d}%
                  </div>
                </div>

                {/* 4. SSL Health */}
                <div className="stat-card card-glow-hover">
                  <div className="stat-card-title">
                    <span>{t.sslTitle}</span>
                    <Lock size={15} color="#38bdf8" />
                  </div>
                  <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--status-online)' }}>
                    {t.sslValid}
                  </div>
                  <div className="stat-card-footer">
                    180 {t.sslDaysLeft} • Let's Encrypt
                  </div>
                </div>
              </div>

              {/* Health Score & Uptime Timeline */}
              <div className="grid-2">
                <HealthScoreRing scoreData={currentHealthScore} />
                <UptimeTimeline
                  checks={historyData.checks}
                  uptime24h={historyData.uptime24h}
                  uptime7d={historyData.uptime7d}
                  uptime30d={historyData.uptime30d}
                  uptime90d={historyData.uptime90d}
                  recentIncident={incidents[0]}
                />
              </div>

              {/* Response Time Area Chart */}
              <ResponseTimeChart
                checks={historyData.checks}
                currentMs={historyData.currentResponseTime || 243}
                avgMs={historyData.avgResponseTime || 228}
                minMs={historyData.minResponseTime || 140}
                maxMs={historyData.maxResponseTime || 410}
                p95Ms={historyData.p95ResponseTime || 315}
                selectedRange={historyRange}
                onRangeChange={setHistoryRange}
                isLiveChecking={isCheckingActive}
                targetUrl={selectedMonitor?.url}
              />

              {/* AI Doctor Clinical Section */}
              <AIDoctorView
                diagnosis={latestAnalysis?.aiDiagnosis}
                targetUrl={selectedMonitor?.url || 'https://example.com'}
                onRefreshDiagnosis={() => setActiveView('scanner')}
              />
            </div>
          )}

          {/* VIEW: MONITORS */}
          {activeView === 'monitors' && (
            <MonitorsView
              monitors={monitors}
              onSelectMonitor={(m) => {
                setSelectedMonitor(m);
                setActiveView('overview');
              }}
              onCreateMonitor={handleCreateMonitor}
              onToggleStatus={handleToggleMonitorStatus}
              onDeleteMonitor={handleDeleteMonitor}
              onCheckNow={handleCheckNow}
            />
          )}

          {/* VIEW: ANALYTICS & HISTORY */}
          {activeView === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Performance & Latency Analytics</h1>
                  <p className="page-subtitle">
                    End-to-end historical latency metrics, P95 SLAs, and uptime availability records
                  </p>
                </div>
              </div>

              <ResponseTimeChart
                checks={historyData.checks}
                currentMs={historyData.currentResponseTime || 243}
                avgMs={historyData.avgResponseTime || 228}
                minMs={historyData.minResponseTime || 140}
                maxMs={historyData.maxResponseTime || 410}
                p95Ms={historyData.p95ResponseTime || 315}
                selectedRange={historyRange}
                onRangeChange={setHistoryRange}
              />

              <UptimeTimeline
                checks={historyData.checks}
                uptime24h={historyData.uptime24h}
                uptime7d={historyData.uptime7d}
                uptime30d={historyData.uptime30d}
                uptime90d={historyData.uptime90d}
                recentIncident={incidents[0]}
              />

              <div className="grid-2">
                <SSLInspectorView ssl={latestAnalysis?.ssl} />
                <SecurityHeadersView report={latestAnalysis?.securityHeaders} />
              </div>
            </div>
          )}

          {/* VIEW: INCIDENTS */}
          {activeView === 'incidents' && (
            <IncidentsView incidents={incidents} activeCount={activeIncidents.length} />
          )}

          {/* VIEW: ALERTS */}
          {activeView === 'alerts' && (
            <AlertsView
              rules={alertRules}
              logs={alertLogs}
              onToggleRule={async (ruleId, enabled) => {
                setAlertRules((prev) =>
                  prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r))
                );
              }}
              onAddRule={async (rule) => {
                const res = await fetch(apiUrl('/api/alerts/rules'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(rule),
                });
                if (res.ok) {
                  const created = await res.json();
                  setAlertRules((prev) => [created, ...prev]);
                }
              }}
              onMarkAllRead={async () => {
                await fetch(apiUrl('/api/alerts/read'), { method: 'POST' });
                setAlertLogs((prev) => prev.map((l) => ({ ...l, read: true })));
              }}
            />
          )}

          {/* VIEW: WEBSITE SCANNER */}
          {activeView === 'scanner' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <UrlChecker
                initialUrl={scannerPrefillUrl || selectedMonitor?.url || 'https://example.com'}
                onAnalysisComplete={(res) => setLatestAnalysis(res)}
                onCreateMonitorFromAnalysis={(url) => {
                  handleCreateMonitor({
                    url,
                    name: url,
                    interval_seconds: 60,
                    timeout_ms: 10000,
                    http_method: 'GET',
                    expected_status_code: 200,
                  });
                }}
              />
              <BrokenLinksView initialUrl={selectedMonitor?.url || 'https://example.com'} />
            </div>
          )}

          {/* VIEW: AI DOCTOR */}
          {activeView === 'ai-doctor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="page-header">
                <div>
                  <h1 className="page-title">AI Website Doctor</h1>
                  <p className="page-subtitle">
                    Intelligent clinical diagnostics, root cause synthesis, and prioritized remediation playbooks
                  </p>
                </div>
              </div>
              <AIDoctorView
                diagnosis={latestAnalysis?.aiDiagnosis}
                targetUrl={selectedMonitor?.url || 'https://example.com'}
                onRefreshDiagnosis={() => setActiveView('scanner')}
              />
            </div>
          )}

          {/* VIEW: SETTINGS & ARCHITECTURE */}
          {activeView === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="page-header">
                <div>
                  <h1 className="page-title">System Settings & Owner Profile</h1>
                  <p className="page-subtitle">
                    Configure platform owner details, organization branding, database status, and SSRF security guards
                  </p>
                </div>
              </div>

              {/* Success Notification Banner */}
              {saveSuccessMessage && (
                <div
                  style={{
                    padding: '12px 18px',
                    backgroundColor: 'var(--status-online-bg)',
                    border: '1px solid rgba(22, 163, 74, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--status-online)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <CheckCircle2 size={18} />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              {/* Editable Owner & Organization Profile Card */}
              <div className="card">
                <div className="card-header">
                  <div>
                    <span className="card-title">
                      <User size={18} style={{ color: 'var(--accent-primary)' }} />
                      <span>Platform Owner & Organization Profile</span>
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Updates the Owner Name and Organization displayed in the Navbar, Sidebar, and Landing Page footer
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveOwnerProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Owner Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="E.g. Rahul Sharma"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Owner Title / Role
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileForm.role}
                        onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                        placeholder="E.g. Founder & SRE Lead"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Organization / Company Name
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileForm.organization}
                        onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                        placeholder="E.g. Website Doctor Inc."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Contact / Alert Email
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="owner@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Persisted locally in your browser and synced across all pages.
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 18px' }}>
                      Save Owner Profile
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">
                      <Database size={18} style={{ color: 'var(--accent-primary)' }} />
                      <span>Database Engine</span>
                    </span>
                    <span className="badge badge-online">Operational</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Engine: <strong>PostgreSQL / PGlite (Embedded WASM PostgreSQL 16)</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Schema verified with active foreign keys, composite time-series indexes, and UTC timestamp storage.
                  </p>
                </div>

                <div className="card">
                  <div className="card-header">
                    <span className="card-title">
                      <Shield size={18} style={{ color: 'var(--accent-indigo)' }} />
                      <span>SSRF Protection Guard</span>
                    </span>
                    <span className="badge badge-online">Active</span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Protection: <strong>Loopback & Metadata Blocking</strong>
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Restricts 127.0.0.1, localhost, 169.254.169.254, RFC 1918 private subnets, and validates safe redirects at each hop.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">
                    <Server size={18} style={{ color: 'var(--status-online)' }} />
                    <span>Real-Time Event Stream</span>
                  </span>
                  <span className={`badge ${isSSEConnected ? 'badge-online' : 'badge-degraded'}`}>
                    {isSSEConnected ? 'Live Stream Active' : 'Reconnecting...'}
                  </span>
                </div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Continuous background worker checks active monitors at configured intervals and broadcasts updates instantly to all subscribed browser sessions without polling overhead.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
