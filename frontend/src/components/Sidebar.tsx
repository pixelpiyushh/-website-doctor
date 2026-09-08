import React from 'react';
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  AlertTriangle,
  Bell,
  SearchCode,
  Stethoscope,
  Settings,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  activeIncidentsCount: number;
  totalMonitorsCount: number;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
  activeIncidentsCount,
  totalMonitorsCount,
  ownerProfile,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitors', label: 'Monitors', icon: Globe, badge: totalMonitorsCount > 0 ? String(totalMonitorsCount) : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? `${activeIncidentsCount} active` : undefined,
      isAlert: activeIncidentsCount > 0,
    },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'scanner', label: 'Website Scanner', icon: SearchCode },
    { id: 'ai-doctor', label: 'AI Doctor', icon: Stethoscope },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <a
          href="#"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('landing');
          }}
        >
          <div className="brand-icon-wrapper">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div>Website Doctor</div>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '0.02em' }}>
              Digital Care for Web
            </div>
          </div>
        </a>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '8px 12px 4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveView(item.id);
                onClose();
              }}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-item-badge ${item.isAlert ? 'alert-badge' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Owner Profile Card */}
        <div
          onClick={() => setActiveView('settings')}
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'border-color var(--transition-fast)',
          }}
          title="Click to edit Owner Profile in Settings"
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-indigo) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.84rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {ownerProfile?.name ? ownerProfile.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ownerProfile?.name || 'Piyush Raj'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ownerProfile?.role || 'Founder & Platform Owner'}
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.78rem' }}
          onClick={() => setActiveView('landing')}
        >
          <span>Landing Page Preview</span>
          <ExternalLink size={13} />
        </button>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Website Doctor v1.0 • Production SaaS
        </div>
      </div>
    </aside>
  );
};
