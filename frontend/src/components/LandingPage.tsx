import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Zap,
  Lock,
  Link2,
  Stethoscope,
  Bell,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onCheckWebsite: (url: string) => void;
  onEnterDemo: () => void;
  ownerProfile?: {
    name: string;
    role: string;
    organization: string;
  };
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCheckWebsite, onEnterDemo, ownerProfile }) => {
  const [heroUrl, setHeroUrl] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroUrl.trim()) {
      onCheckWebsite(heroUrl.trim());
    }
  };

  const faqs = [
    {
      q: 'How does Website Doctor monitor my website in real time?',
      a: 'Our background monitoring engine conducts non-intrusive HTTP/HTTPS probes across customizable intervals (from 30 seconds to 15 minutes). We measure high-resolution DNS lookup, TCP handshake, TLS negotiation, and Time-to-First-Byte (TTFB). Telemetry is streamed directly to your dashboard via Server-Sent Events (SSE).',
    },
    {
      q: 'How does the SSRF Guard protect against internal network scans?',
      a: 'Website Doctor enforces rigorous Server-Side Request Forgery (SSRF) verification. We block localhost, link-local metadata addresses (e.g. AWS/GCP 169.254.169.254), private subnet ranges (10.x, 172.16-31.x, 192.168.x), and re-validate every redirect hop before establishing sockets.',
    },
    {
      q: 'Does the AI Doctor invent or hallucinate technical problems?',
      a: 'Never. The AI Doctor adheres to a strict factual diagnosis contract: it only diagnoses problems directly substantiated by measured telemetry (e.g. actual HTTP 5xx codes, measured latencies >600ms, missing headers, or expiring SSL dates). If insufficient data exists, it explicitly states so.',
    },
    {
      q: 'Can I monitor multiple endpoints and APIs simultaneously?',
      a: 'Yes. You can configure multiple active monitors with custom timeouts, HTTP methods (GET/HEAD), expected HTTP status codes, and optional body keyword matching.',
    },
    {
      q: 'How do automated alerts and incidents work?',
      a: 'When a website fails consecutive checks (configurable, default 2), Website Doctor automatically opens an Incident, logs an event timeline, and dispatches alerts across configured channels (in-app feed, email, or webhook). When the website recovers, the incident is automatically resolved and downtime duration is calculated.',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient Cosmic Background Orbs (Light Purple & Sky Blue) */}
      <div className="cosmic-mesh-bg">
        <div className="cosmic-orb-purple" style={{ top: '-120px', left: '-80px' }} />
        <div className="cosmic-orb-skyblue" style={{ top: '180px', right: '-100px' }} />
        <div className="cosmic-orb-purple" style={{ top: '800px', left: '20%' }} />
        <div className="cosmic-orb-skyblue" style={{ top: '1500px', right: '15%' }} />
      </div>

      {/* Top Hero Navigation Bar */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1300px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 40%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Website Doctor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={onEnterDemo}>
            View Live Demo
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onCheckWebsite('https://example.com')}>
            Launch App
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ padding: '60px 20px 50px', textAlign: 'center', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <div
          className="badge gradient-badge"
          style={{
            marginBottom: '20px',
            fontSize: '0.82rem',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Sparkles size={14} style={{ color: '#c084fc' }} />
          <span>AI-Powered Real-Time Website Monitoring & Diagnostics</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '18px',
          }}
        >
          Diagnose your website <br />
          <span className="gradient-text">before your users do.</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 32px',
            lineHeight: 1.55,
          }}
        >
          Real-time website health monitoring, performance latency analytics, SSL certificate inspection, broken link detection, and intelligent clinical diagnostics — all in one unified platform.
        </p>

        {/* Hero URL Input Form */}
        <form
          onSubmit={handleHeroSubmit}
          style={{
            display: 'flex',
            gap: '10px',
            maxWidth: '620px',
            margin: '0 auto 20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="input-group"
            style={{
              flex: '1 1 340px',
              padding: '0 16px',
              borderColor: 'rgba(192, 132, 252, 0.35)',
              boxShadow: '0 0 16px rgba(192, 132, 252, 0.12)',
            }}
          >
            <Globe size={18} color="#c084fc" />
            <input
              type="text"
              className="input-field"
              placeholder="https://yourwebsite.com"
              value={heroUrl}
              onChange={(e) => setHeroUrl(e.target.value)}
              style={{ fontSize: '1rem', padding: '14px 10px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ flex: '1 1 180px' }}>
            <span>Check My Website</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center', marginBottom: '40px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onEnterDemo}>
            View Demo Dashboard →
          </button>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            No credit card required • Instant automated diagnosis
          </span>
        </div>

        {/* Circular Orbital Motion Visualizer */}
        <div className="orbit-stage-wrapper">
          {/* 3 Concentric Dashed Orbit Rings */}
          <div className="orbit-ring ring-1" />
          <div className="orbit-ring ring-2" />
          <div className="orbit-ring ring-3" />

          {/* 3 Orbiting Celestial Satellite Badges */}
          <div className="orbit-satellite sat-1">
            <Stethoscope size={14} style={{ color: '#c084fc' }} />
            <span>🩺 AI Clinical Doctor</span>
          </div>

          <div className="orbit-satellite sat-2">
            <Zap size={14} style={{ color: '#38bdf8' }} />
            <span>⚡ 99.98% High SLA</span>
          </div>

          <div className="orbit-satellite sat-3">
            <Shield size={14} style={{ color: '#16a34a' }} />
            <span>🔒 SSL 256-bit Valid</span>
          </div>

          {/* Center Pulsing Radar Core */}
          <div
            style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'var(--gradient-magic)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 35px rgba(192, 132, 252, 0.65), 0 0 50px rgba(56, 189, 248, 0.45)',
              zIndex: 5,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: '50%',
                border: '1.5px solid rgba(192, 132, 252, 0.55)',
                animation: 'circular-sonar 2.2s infinite ease-out',
              }}
            />
            <Activity size={38} color="#ffffff" style={{ animation: 'pulse 1.8s infinite ease-in-out' }} />
          </div>
        </div>

        {/* Realistic Dashboard Preview Frame */}
        <div
          style={{
            marginTop: '30px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(192, 132, 252, 0.35)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(192, 132, 252, 0.15)',
            overflow: 'hidden',
            textAlign: 'left',
          }}
        >
          {/* Mock Window Titlebar */}
          <div
            style={{
              padding: '12px 18px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                https://demo-store.example.com • Telemetry Stream
              </span>
            </div>
            <div className="badge gradient-badge" style={{ fontSize: '0.72rem' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#38bdf8' }} /> LIVE 243ms
            </div>
          </div>

          {/* Mock Dashboard Preview Content */}
          <div style={{ padding: '24px' }}>
            <div className="grid-4" style={{ marginBottom: '18px' }}>
              <div className="card-glow-hover" style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>System Status</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-online)', marginTop: '2px' }}>
                  🟢 ONLINE
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>HTTP 200 OK</div>
              </div>
              <div className="card-glow-hover" style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Response Latency</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>243 ms</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>TTFB: 168ms</div>
              </div>
              <div className="card-glow-hover" style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rolling Uptime</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#c084fc', marginTop: '2px' }}>
                  99.98%
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Last 30 days</div>
              </div>
              <div className="card-glow-hover" style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SSL Certificate</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-online)', marginTop: '2px' }}>
                  Valid (180d)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Let's Encrypt</div>
              </div>
            </div>

            {/* AI Diagnosis Snippet */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(192, 132, 252, 0.08)',
                border: '1px solid rgba(192, 132, 252, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Stethoscope size={22} style={{ color: '#c084fc', flexShrink: 0 }} />
              <div style={{ fontSize: '0.86rem' }}>
                <strong style={{ color: '#c084fc' }}>AI Doctor Clinical Verdict: </strong>
                "Your website is operating with low latency (243ms) and valid SSL. We recommend adding HSTS and CSP headers to elevate your security score from 94 to 100."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Feature Sections */}
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '80px', position: 'relative', zIndex: 10 }}>
        {/* Section 1: Real-Time Monitoring */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="badge badge-skyblue" style={{ marginBottom: '10px' }}>1. Continuous Availability</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Real-Time Monitoring
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Keep tabs on your website around the clock. Configure custom intervals, HTTP methods (GET/HEAD), timeout ceilings, and expected response codes. Our scheduler runs autonomously in the background and broadcasts live updates straight to your screen.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#38bdf8" /> Operational, Degraded, and Down state machine
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#38bdf8" /> Keyword and content payload verification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#38bdf8" /> Zero-polling Server-Sent Events push feed
              </li>
            </ul>
          </div>
          <div className="card card-glow-hover" style={{ padding: '28px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <Globe size={34} color="#38bdf8" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Autonomous Health Checks</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Monitors update every 30s. State transitions trigger automated incident events without human latency.
            </div>
          </div>
        </div>

        {/* Section 2: Performance Analytics */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card card-glow-hover" style={{ padding: '28px', order: 2, border: '1px solid rgba(192, 132, 252, 0.25)' }}>
            <BarChart3 size={34} color="#c084fc" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>High-Precision Latency Tracking</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Inspect TTFB, DNS resolution, and P95 latency percentiles to diagnose sluggish API microservices.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-purple" style={{ marginBottom: '10px' }}>2. Speed & Latency</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Performance Analytics
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Diagnose latency bottlenecks before customers abandon carts. Track high-resolution time-to-first-byte, TCP connect duration, TLS negotiation overhead, and payload compression (gzip, Brotli) across 1H, 6H, 24H, 7D, and 30D spans.
            </p>
          </div>
        </div>

        {/* Section 3: SSL & Security Checks */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="badge badge-skyblue" style={{ marginBottom: '10px' }}>3. Cryptographic Guard</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              SSL & Security Checks
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Never let an expired SSL certificate kill your brand credibility. Inspect certificate issuers, expiration countdowns, subject alternative names (SANs), TLS ciphers, and verify automatic HTTP → HTTPS redirect behavior.
            </p>
          </div>
          <div className="card card-glow-hover" style={{ padding: '28px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <Lock size={34} color="#38bdf8" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Zero Certificate Surprises</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Proactive alerts trigger when certificates reach 14 days to expiration, giving DevOps teams ample time to renew.
            </div>
          </div>
        </div>

        {/* Section 4: Broken Link Detection */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card card-glow-hover" style={{ padding: '28px', order: 2, border: '1px solid rgba(192, 132, 252, 0.25)' }}>
            <Link2 size={34} color="#c084fc" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dead Link Crawler</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Bounded concurrency crawler extracts page links and verifies HTTP 200 vs 404/500 with SSRF protection.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-purple" style={{ marginBottom: '10px' }}>4. Crawler & Integrity</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Broken Link Detection
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Preserve SEO crawl budget and visitor trust. Our crawler safely crawls internal and external hyperlinks on your site, categorizing URLs into working, broken (4xx/5xx), and redirected links with the exact source page context.
            </p>
          </div>
        </div>

        {/* Section 5: AI Website Diagnosis */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '10px' }}>5. Intelligent Doctor</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              AI Website Diagnosis
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              No generic platitudes. The AI Doctor analyzes real collected telemetry to produce a clinical health assessment: pinpointing root causes and generating prioritized step-by-step remediation snippets for Nginx, Apache, and DNS.
            </p>
          </div>
          <div className="card card-glow-hover" style={{ padding: '28px', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
            <Stethoscope size={34} color="#c084fc" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Grounded in Real Telemetry</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              The AI never hallucinates or invents fake issues. If data is unmeasured, it explicitly reports "Insufficient data".
            </div>
          </div>
        </div>

        {/* Section 6: Monitoring Alerts */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card card-glow-hover" style={{ padding: '28px', order: 2, border: '1px solid rgba(56, 189, 248, 0.25)' }}>
            <Bell size={34} color="#38bdf8" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Multi-Channel Dispatch</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Configurable policies for downtime, latency spikes, SSL expiry, consecutive failures, and score dips.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-skyblue" style={{ marginBottom: '10px' }}>6. Immediate Notification</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Monitoring Alerts
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Get alerted the instant anomalies happen. Filter noise by setting consecutive failure thresholds and customize channels across in-dashboard real-time feeds, email dispatches, or webhooks.
            </p>
          </div>
        </div>

        {/* Section 7: Historical Analytics */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '10px' }}>7. Long-Term Reliability</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Historical Analytics
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Track SLA compliance with 24-hour, 7-day, 30-day, and 90-day availability percentages. Segmented status bars show historical health at a glance with full incident duration timelines.
            </p>
          </div>
          <div className="card card-glow-hover" style={{ padding: '28px', border: '1px solid rgba(192, 132, 252, 0.25)' }}>
            <BarChart3 size={34} color="#c084fc" style={{ marginBottom: '14px' }} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>99.99% Proof for SLA</div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
              Demonstrate enterprise reliability with persistent check records saved in PostgreSQL.
            </div>
          </div>
        </div>

        {/* Section 8: How It Works */}
        <div style={{ textAlign: 'center' }}>
          <div className="badge gradient-badge" style={{ marginBottom: '12px' }}>8. Workflow</div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '32px' }}>
            How Website Doctor Works
          </h2>

          <div className="grid-3" style={{ textAlign: 'left' }}>
            <div className="card card-glow-hover" style={{ border: '1px solid rgba(192, 132, 252, 0.3)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#c084fc', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>01</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Enter Target URL</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Our SSRF Guard normalizes and verifies the address, filtering loopbacks and private metadata IP addresses.
              </p>
            </div>
            <div className="card card-glow-hover" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>02</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>Continuous Probes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Autonomous workers execute periodic probes, tracking TTFB, TLS validity, HTTP headers, and availability state.
              </p>
            </div>
            <div className="card card-glow-hover" style={{ border: '1px solid rgba(22, 163, 74, 0.35)' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#16a34a', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>03</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>AI Doctor Prescription</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                Actionable remediation guides and instant incident resolution keep your website performing in top health.
              </p>
            </div>
          </div>
        </div>

        {/* Section 9: FAQ */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="badge gradient-badge" style={{ marginBottom: '12px' }}>9. FAQ</div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '820px', margin: '0 auto' }}>
            {faqs.map((f, i) => (
              <div
                key={i}
                className="card card-glow-hover"
                style={{ cursor: 'pointer', padding: '18px 22px' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.96rem' }}>
                  <span>{f.q}</span>
                  <ChevronRight
                    size={16}
                    color="#c084fc"
                    style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}
                  />
                </div>
                {openFaq === i && (
                  <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Banner */}
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '54px 24px',
            background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.15) 0%, rgba(56, 189, 248, 0.14) 100%)',
            border: '1px solid rgba(192, 132, 252, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(192, 132, 252, 0.2)',
            borderRadius: 'var(--radius-xl)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '350px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
            Ready to give your website a clean bill of health?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 26px', fontSize: '0.98rem', lineHeight: 1.55 }}>
            Start monitoring any public website URL in under 10 seconds. Free, automated, and continuous.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onCheckWebsite('https://example.com')}>
              <span>Diagnose My Website Now</span>
              <ArrowRight size={17} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={onEnterDemo}>
              Open Demo Showcase
            </button>
          </div>
        </div>
      </div>

      {/* Section 10: Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '40px 20px',
          marginTop: '60px',
          backgroundColor: 'var(--bg-surface)',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon-wrapper" style={{ width: '24px', height: '24px' }}>
              <Shield size={13} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Website Doctor</span>
            <span>— Diagnose your website before your users do.</span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onEnterDemo(); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Demo
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onCheckWebsite('https://example.com'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Scanner
            </a>
            <span style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} {ownerProfile?.organization || 'Website Doctor'} • Owned by{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{ownerProfile?.name || 'Piyush Raj'}</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
