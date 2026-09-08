# Website Doctor 🩺🌐

> **“Diagnose your website before your users do.”**
> A production-quality, AI-powered real-time website monitoring, performance analytics, and health diagnostics SaaS platform.

---

## 🌟 Overview & Capabilities

Website Doctor acts as a 24/7 digital physician for websites, continuously monitoring availability, latency spikes, SSL certificate expiration, security header posture, broken hyperlinks, and technical SEO health.

### Core Features

1. **Continuous Real-Time Monitoring**:
   - Autonomous background scheduler prober running every 30s to 15m.
   - States: 🟢 Operational, 🟡 Degraded (>900ms), 🔴 Down.
   - Live push updates via Server-Sent Events (SSE) stream (`/api/events`) with automatic fallback to polling.
2. **High-Precision Latency Analytics**:
   - High-resolution timing measuring DNS resolution, TCP handshake, TLS negotiation, and Time-to-First-Byte (TTFB).
   - Time filters: 1H, 6H, 24H, 7D, 30D with Current, Avg, Min, Max, and P95 latency percentiles.
3. **Uptime & SLA Tracking**:
   - Segmented color-coded status bar (Green = success, Yellow = slow >900ms, Red = failed).
   - Rolling availability percentages across 24 hours, 7 days, 30 days, and 90 days.
4. **SSL / TLS Certificate Inspector**:
   - Inspects issuer, validity dates, days remaining countdown bar, Subject Alternative Names (SANs), TLS ciphers, and verifies automatic HTTP → HTTPS 301/308 redirects.
5. **Security Headers Auditor**:
   - Audits HSTS, Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy.
   - Detailed educational explanations: "What this means", "Why it matters", and copyable configuration snippets (Nginx/Apache).
6. **Broken Link Crawler**:
   - Bounded concurrency crawler checking page hyperlinks for 404/500/timeouts with source page attribution and status filters.
7. **Technical SEO Analyzer**:
   - Audits `<title>`, `<meta name="description">`, OpenGraph social cards, mobile viewport, heading hierarchy (`<h1>`/`<h2>`), image `alt` attributes, `/sitemap.xml`, and `/robots.txt`.
8. **Transparent 0–100 Website Health Score**:
   - Formula: Availability (30 pts) + Performance (20 pts) + Security (20 pts) + SEO (15 pts) + Technical Health (15 pts).
   - Animated circular SVG ring with score breakdown modal.
9. **AI Doctor Clinical Diagnosis**:
   - Factual clinical assessment strictly grounded in collected telemetry (zero hallucination).
   - Categorized problems (Critical, Warning, Optimization) and prioritized remediation playbook with code snippets.
10. **Incident Lifecycle & Alert Management**:
    - Detects consecutive failures, opens incidents, tracks step-by-step event timelines (unreachable → alert triggered → recovered).
    - Multi-channel alert rules (website down, latency spikes, SSL expiry) and persistent notification logs.
11. **Strict SSRF Guard**:
    - Blocks localhost, 127.0.0.1, AWS/GCP cloud metadata IP (`169.254.169.254`), RFC 1918 private subnets, and re-validates every redirect hop.
12. **Universal Database Storage**:
    - Works out of the box with embedded PostgreSQL (PGlite) or connects to any external PostgreSQL cluster via `DATABASE_URL`.

---

## 🏗 Architecture

```
Browser (React + TypeScript + Dark SaaS UI)
   │
   ├─ REST API Requests ──────────────► Express API Server (Port 3001)
   │                                        │
   ├◄─ Real-time Telemetry (SSE) ───────────┤
   │                                        ├─ Database (PGlite / PostgreSQL)
   │                                        ├─ Incident & Alert Service
   │                                        └─ Prober & Diagnostic Engines
   │                                              ├─ SSRF Guard
   │                                              ├─ HTTP & Latency Prober
   │                                              ├─ SSL/TLS Inspector
   │                                              ├─ DNS Resolver
   │                                              ├─ SEO & Meta Parser
   │                                              ├─ Broken Link Crawler
   │                                              └─ AI Doctor Engine
```

---

## 🚀 Quick Start

### 1. Requirements
- Node.js >= 18.0.0 (Tested on Node.js v24.19.0)

### 2. Run Locally

From the root directory:

```powershell
# Start backend API (Port 3001)
npm run dev:backend

# In another terminal, start frontend dashboard (Port 5173)
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

### 3. Run Automated Tests

```powershell
npm test
```

---

## 🔒 Security & SSRF Protection

All URL inputs undergo strict validation:
- Enforces HTTP/HTTPS protocol.
- Resolves hostnames via DNS to both IPv4 and IPv6 addresses.
- Rejects any address in private, loopback, multicast, or link-local ranges:
  - `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
  - `169.254.0.0/16` (Cloud metadata service)
  - `::1`, `fc00::/7`, `fe80::/10`
- Re-verifies every redirect hop destination before following redirects.
