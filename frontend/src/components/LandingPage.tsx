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
    <div style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', minHeight: '100vh' }}>
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
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px' }}>
            <Shield size={17} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
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
      <section style={{ padding: '70px 20px 50px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          className="badge"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--accent-primary)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '20px',
            fontSize: '0.8rem',
            padding: '5px 14px',
          }}
        >
          <Sparkles size={13} />
          AI-Powered Real-Time Website Monitoring & Diagnostics
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '18px',
          }}
        >
          Diagnose your website <br />
          <span style={{ color: 'var(--accent-primary)' }}>before your users do.</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 36px',
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
            maxWidth: '600px',
            margin: '0 auto 20px',
            flexWrap: 'wrap',
          }}
        >
          <div className="input-group" style={{ flex: '1 1 340px', padding: '0 16px' }}>
            <Globe size={18} color="var(--text-muted)" />
            <input
              type="text"
              className="input-field"
              placeholder="https://example.com"
              value={heroUrl}
              onChange={(e) => setHeroUrl(e.target.value)}
              style={{ fontSize: '1rem', padding: '14px 10px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ flex: '1 1 160px' }}>
            <span>Check My Website</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={onEnterDemo}>
            View Demo Dashboard →
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            No credit card required • Instant automated diagnosis
          </span>
        </div>

        {/* Realistic Dashboard Preview Frame */}
        <div
          style={{
            marginTop: '50px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-medium)',
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
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
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                https://demo-store.example.com • Telemetry Stream
              </span>
            </div>
            <div className="badge badge-online" style={{ fontSize: '0.7rem' }}>
              <span className="pulse-dot" /> LIVE 243ms
            </div>
          </div>

          {/* Mock Dashboard Preview Content */}
          <div style={{ padding: '24px' }}>
            <div className="grid-4" style={{ marginBottom: '18px' }}>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>System Status</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--status-online)', marginTop: '2px' }}>
                  🟢 ONLINE
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>HTTP 200 OK</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Response Latency</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>243 ms</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>TTFB: 168ms</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rolling Uptime</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '2px' }}>
                  99.98%
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Last 30 days</div>
              </div>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
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
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid var(--accent-primary-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Stethoscope size={22} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.86rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>AI Doctor Clinical Verdict: </strong>
                "Your website is operating with low latency (243ms) and valid SSL. We recommend adding HSTS and CSP headers to elevate your security score from 94 to 100."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Feature Sections */}
      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        {/* Section 1: Real-Time Monitoring */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div className="badge badge-online" style={{ marginBottom: '10px' }}>1. Continuous Availability</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Real-Time Monitoring
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Keep tabs on your website around the clock. Configure custom intervals, HTTP methods (GET/HEAD), timeout ceilings, and expected response codes. Our scheduler runs autonomously in the background and broadcasts live updates straight to your screen.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--status-online)" /> Operational, Degraded, and Down state machine
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--status-online)" /> Keyword and content payload verification
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--status-online)" /> Zero-polling Server-Sent Events push feed
              </li>
            </ul>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <Globe size={32} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Active Health Checks</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Monitors update every 30s. State transitions trigger automated incident events without human latency.
            </div>
          </div>
        </div>

        {/* Section 2: Performance Analytics */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card" style={{ padding: '24px', order: 2 }}>
            <BarChart3 size={32} color="var(--accent-indigo)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Time-Series Latency Analysis</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inspect TTFB, DNS resolution, and P95 latency percentiles to diagnose sluggish API microservices.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-info" style={{ marginBottom: '10px' }}>2. Speed & Latency</div>
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
            <div className="badge badge-online" style={{ marginBottom: '10px' }}>3. Cryptographic Guard</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              SSL & Security Checks
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Never let an expired SSL certificate kill your brand credibility. Inspect certificate issuers, expiration countdowns, subject alternative names (SANs), TLS ciphers, and verify automatic HTTP → HTTPS redirect behavior.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <Lock size={32} color="var(--status-online)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Zero Certificate Surprise</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Proactive alerts trigger when certificates reach 14 days to expiration, giving DevOps teams ample time to renew.
            </div>
          </div>
        </div>

        {/* Section 4: Broken Link Detection */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card" style={{ padding: '24px', order: 2 }}>
            <Link2 size={32} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Dead Anchor Audit</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Bounded concurrency crawler extracts page links and verifies HTTP 200 vs 404/500 with SSRF protection.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-info" style={{ marginBottom: '10px' }}>4. Crawler & Integrity</div>
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
            <div className="badge badge-online" style={{ marginBottom: '10px' }}>5. Intelligent Doctor</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              AI Website Diagnosis
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              No generic platitudes. The AI Doctor analyzes real collected telemetry to produce a clinical health assessment: pinpointing root causes and generating prioritized step-by-step remediation snippets for Nginx, Apache, and DNS.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <Stethoscope size={32} color="var(--accent-primary)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Grounded in Real Telemetry</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              The AI never hallucinates or invents fake issues. If data is unmeasured, it explicitly reports "Insufficient data".
            </div>
          </div>
        </div>

        {/* Section 6: Monitoring Alerts */}
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div className="card" style={{ padding: '24px', order: 2 }}>
            <Bell size={32} color="var(--status-down)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Multi-Channel Dispatch</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Configurable policies for downtime, latency spikes, SSL expiry, consecutive failures, and score dips.
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div className="badge badge-info" style={{ marginBottom: '10px' }}>6. Immediate Notification</div>
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
            <div className="badge badge-online" style={{ marginBottom: '10px' }}>7. Long-Term Reliability</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              Historical Analytics
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.96rem', marginBottom: '16px' }}>
              Track SLA compliance with 24-hour, 7-day, 30-day, and 90-day availability percentages. Segmented status bars show historical health at a glance with full incident duration timelines.
            </p>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <BarChart3 size={32} color="var(--status-online)" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>99.99% Proof for SLA</div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Demonstrate enterprise reliability with persistent check records saved in PostgreSQL.
            </div>
          </div>
        </div>

        {/* Section 8: How It Works */}
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-info" style={{ marginBottom: '10px' }}>8. Workflow</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '32px' }}>
            How Website Doctor Works
          </h2>

          <div className="grid-3" style={{ textAlign: 'left' }}>
            <div className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '8px' }}>01</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Enter Target URL</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Our SSRF Guard normalizes and verifies the address, filtering loopbacks and private metadata IP addresses.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: '8px' }}>02</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>Continuous Probes</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Autonomous workers execute periodic probes, tracking TTFB, TLS validity, HTTP headers, and availability state.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-online)', marginBottom: '8px' }}>03</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>AI Doctor Prescription</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Actionable remediation guides and instant incident resolution keep your website performing in top health.
              </p>
            </div>
          </div>
        </div>

        {/* Section 9: FAQ */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="badge badge-online" style={{ marginBottom: '10px' }}>9. FAQ</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '820px', margin: '0 auto' }}>
            {faqs.map((f, i) => (
              <div
                key={i}
                className="card"
                style={{ cursor: 'pointer', padding: '16px 20px' }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.94rem' }}>
                  <span>{f.q}</span>
                  <ChevronRight
                    size={16}
                    color="var(--text-muted)"
                    style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 200ms' }}
                  />
                </div>
                {openFaq === i && (
                  <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55 }}>
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
            padding: '50px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)',
            border: '1px solid var(--accent-primary-border)',
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '10px' }}>
            Ready to give your website a clean bill of health?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Start monitoring any public website URL in under 10 seconds. Free, automated, and continuous.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => onCheckWebsite('https://example.com')}>
              Diagnose My Website Now
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
