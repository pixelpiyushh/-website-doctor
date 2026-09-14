import React, { useState } from 'react';
import { Activity, Bell, Search, Sparkles, Menu, ShieldAlert, CheckCircle2, Globe2 } from 'lucide-react';
import { AlertLogEvent } from '../types';
import { useLanguage } from '../i18n';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  onOpenQuickScan: () => void;
  isSSEConnected: boolean;
  alerts: AlertLogEvent[];
  onToggleSidebar: () => void;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveView,
  isDemoMode,
  setIsDemoMode,
  onOpenQuickScan,
  isSSEConnected,
  alerts,
  onToggleSidebar,
  ownerProfile,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onToggleSidebar}
          style={{ padding: '6px', display: 'flex', alignItems: 'center' }}
          aria-label="Toggle Navigation"
        >
          <Menu size={18} />
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveView('landing')}
          style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
          title="Return to Landing Page Homepage"
        >
          <span>🏠</span>
          <span style={{ fontWeight: 600 }}>Home</span>
        </button>

        {/* Live SSE status indicator */}
        <div
          className="badge"
          style={{
            backgroundColor: isSSEConnected ? 'rgba(22, 163, 74, 0.12)' : 'rgba(244, 63, 94, 0.1)',
            color: isSSEConnected ? '#16a34a' : 'var(--status-down)',
            border: `1px solid ${isSSEConnected ? 'rgba(22, 163, 74, 0.35)' : 'rgba(244, 63, 94, 0.25)'}`,
            fontSize: '0.74rem',
            padding: '3px 9px',
          }}
          title={isSSEConnected ? 'Real-time telemetry stream connected' : 'Connecting to live events...'}
        >
          <span className="pulse-dot" style={{ backgroundColor: '#16a34a' }} />
          {isSSEConnected ? t.liveTelemetry : t.reconnecting}
        </div>

        {/* Demo Data Badge */}
        {isDemoMode && (
          <div
            className="badge"
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={12} />
            {t.demoActive}
          </div>
        )}
      </div>

      <div className="top-navbar-right">
        {/* Language Switcher: 1st English | 2nd Hinglish */}
        <div
          className="lang-switcher"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 3px',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            gap: '2px',
          }}
          title="Select Language / Bhasha Chuniye (English / Hinglish)"
        >
          <button
            type="button"
            className={`btn btn-sm ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setLanguage('en')}
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: language === 'en' ? 700 : 500,
              borderRadius: 'var(--radius-full)',
              height: '24px',
              minHeight: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '0.78rem' }}>🌐</span>
            <span>English</span>
          </button>

          <button
            type="button"
            className={`btn btn-sm ${language === 'hinglish' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setLanguage('hinglish')}
            style={{
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: language === 'hinglish' ? 700 : 500,
              borderRadius: 'var(--radius-full)',
              height: '24px',
              minHeight: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '0.78rem' }}>🇮🇳</span>
            <span>Hinglish</span>
          </button>
        </div>

        {/* Toggle Demo Mode button */}
        <button
          className={`btn btn-sm ${isDemoMode ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setIsDemoMode(!isDemoMode)}
          style={{ fontSize: '0.78rem' }}
          title="Toggle between real live monitoring and simulated demo showcase"
        >
          <Sparkles size={14} style={{ color: isDemoMode ? '#818cf8' : 'var(--text-muted)' }} />
          {isDemoMode ? t.exitDemo : t.demoMode}
        </button>

        {/* Quick Check button */}
        <button className="btn btn-primary btn-sm" onClick={onOpenQuickScan}>
          <Activity size={14} />
          {t.diagnoseBtn}
        </button>

        {/* Owner Profile Chip */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setActiveView('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          }}
          title={`Website Owner: ${ownerProfile?.name || 'Owner'} (${ownerProfile?.role || 'Admin'}) — Click to edit in Settings`}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-indigo) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.74rem',
              fontWeight: 700,
            }}
          >
            {ownerProfile?.name ? ownerProfile.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ownerProfile?.name || 'Piyush Raj'}
          </span>
        </button>

        {/* Notifications dropdown trigger */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', padding: '7px' }}
            aria-label="View Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'var(--status-down)',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-dropdown)',
                zIndex: 60,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Alert Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {alerts.length} Total
                </span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                    No alerts triggered yet.
                  </div>
                ) : (
                  alerts.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'flex-start',
                      }}
                    >
                      {item.severity === 'critical' ? (
                        <ShieldAlert size={16} style={{ color: 'var(--status-down)', marginTop: '2px', flexShrink: 0 }} />
                      ) : (
                        <CheckCircle2 size={16} style={{ color: 'var(--status-online)', marginTop: '2px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>
                          {item.message}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderTop: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                }}
              >
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: '0.78rem' }}
                  onClick={() => {
                    setShowNotifications(false);
                    setActiveView('alerts');
                  }}
                >
                  View All Alerts & Rules →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
