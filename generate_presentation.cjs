const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  const pptx = new pptxgen();

  // 16:9 Widescreen layout (13.33 x 7.5 inches)
  pptx.defineLayout({ name: 'WIDESCREEN_16x9', width: 13.33, height: 7.5 });
  pptx.layout = 'WIDESCREEN_16x9';

  // Master Color Palette
  const C = {
    bg: '0B0F19',          // Deep obsidian dark
    cardBg: '151D2E',      // Card surface
    cardBgAlt: '1E293B',   // Elevated card surface
    border: '243048',      // Card border
    borderAccent: '38BDF8',// Active border
    textWhite: 'F8FAFC',   // Primary text
    textMuted: '94A3B8',   // Secondary text
    textSub: 'CBD5E1',     // Subtitle text
    emerald: '10B981',     // Status online / primary accent
    cyan: '38BDF8',        // Diagnostic / network accent
    indigo: '818CF8',      // AI / intelligence accent
    amber: 'F59E0B',       // Warning accent
    coral: 'EF4444',       // Critical / down accent
    darkBlue: '0F172A',
  };

  const FONT_TITLE = 'Segoe UI';
  const FONT_BODY = 'Segoe UI';

  // Helper: Standard Slide Background, Header, and Footer
  function initSlide(slide, category, title, subtitle, slideNum) {
    // Solid dark background
    slide.background = { color: C.bg };

    // Top accent bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0, y: 0, w: 13.33, h: 0.08,
      fill: { color: C.emerald },
      line: { color: C.emerald, width: 0 }
    });

    if (category) {
      // Category pill / tag
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: 0.4, w: 2.2, h: 0.32,
        fill: { color: '1E293B' },
        line: { color: C.cyan, width: 1 },
        rectRadius: 0.15
      });
      slide.addText(category.toUpperCase(), {
        x: 0.8, y: 0.4, w: 2.2, h: 0.32,
        fontSize: 10, fontFace: FONT_TITLE, bold: true, color: C.cyan,
        align: 'center', valign: 'middle'
      });
    }

    if (title) {
      slide.addText(title, {
        x: 0.8, y: 0.8, w: 11.5, h: 0.6,
        fontSize: 24, fontFace: FONT_TITLE, bold: true, color: C.textWhite,
        valign: 'middle'
      });
    }

    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8, y: 1.4, w: 11.5, h: 0.35,
        fontSize: 13, fontFace: FONT_BODY, color: C.textMuted,
        valign: 'middle'
      });
    }

    // Divider line
    slide.addShape(pptx.shapes.LINE, {
      x: 0.8, y: 1.85, w: 11.73, h: 0,
      line: { color: C.border, width: 1 }
    });

    // Footer
    if (slideNum > 1) {
      slide.addShape(pptx.shapes.LINE, {
        x: 0.8, y: 7.0, w: 11.73, h: 0,
        line: { color: C.border, width: 1 }
      });

      slide.addText('Website Doctor — AI-Powered Website Health Platform', {
        x: 0.8, y: 7.05, w: 5.5, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted
      });

      slide.addText('Presented by: Piyush Raj | Mini Project', {
        x: 6.0, y: 7.05, w: 4.5, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, align: 'center'
      });

      slide.addText(`${slideNum} / 14`, {
        x: 10.8, y: 7.05, w: 1.73, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY, bold: true, color: C.cyan, align: 'right'
      });
    }
  }

  // ==========================================
  // SLIDE 1: TITLE SLIDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C.bg };

    // Decorative background glow cards
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 0.8, w: 11.73, h: 5.8,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1.5 },
      rectRadius: 0.2
    });

    // Left Emerald Accent Stripe on container
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 0.8, w: 0.15, h: 5.8,
      fill: { color: C.emerald },
      line: { color: C.emerald, width: 0 },
      rectRadius: 0.05
    });

    // Badge: College Mini Project
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.4, y: 1.3, w: 3.4, h: 0.4,
      fill: { color: '1E293B' },
      line: { color: C.emerald, width: 1 },
      rectRadius: 0.2
    });
    slide.addText('ACADEMIC MINI PROJECT  •  2026', {
      x: 1.4, y: 1.3, w: 3.4, h: 0.4,
      fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.emerald,
      align: 'center', valign: 'middle'
    });

    // Main Project Title
    slide.addText('Website Doctor', {
      x: 1.4, y: 1.9, w: 10.0, h: 1.0,
      fontSize: 44, fontFace: FONT_TITLE, bold: true, color: C.textWhite
    });

    // Subtitle
    slide.addText('AI-Powered Real-Time Website Monitoring & Health Analysis Platform', {
      x: 1.4, y: 2.9, w: 10.0, h: 0.6,
      fontSize: 18, fontFace: FONT_TITLE, bold: true, color: C.cyan
    });

    // Tagline in quotation
    slide.addText('“Your Website’s Dedicated Digital Doctor”', {
      x: 1.4, y: 3.5, w: 10.0, h: 0.45,
      fontSize: 15, fontFace: FONT_BODY, italic: true, color: C.textSub
    });

    // Live Metrics Preview Strip
    const metrics = [
      { label: 'STATUS', val: '🟢 ONLINE', color: C.emerald },
      { label: 'HEALTH SCORE', val: '87 / 100', color: C.cyan },
      { label: 'LATENCY', val: '243 ms', color: C.indigo },
      { label: 'SSL SECURITY', val: 'VALID TLS', color: C.emerald },
      { label: 'MONITORING', val: '24/7 ACTIVE', color: C.amber }
    ];

    metrics.forEach((m, idx) => {
      const cardW = 1.9;
      const cardX = 1.4 + idx * (cardW + 0.18);
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: 4.15, w: cardW, h: 0.85,
        fill: { color: C.cardBgAlt },
        line: { color: C.border, width: 1 },
        rectRadius: 0.1
      });
      slide.addText(m.label, {
        x: cardX, y: 4.25, w: cardW, h: 0.25,
        fontSize: 9, fontFace: FONT_TITLE, bold: true, color: C.textMuted, align: 'center'
      });
      slide.addText(m.val, {
        x: cardX, y: 4.5, w: cardW, h: 0.4,
        fontSize: 13, fontFace: FONT_TITLE, bold: true, color: m.color, align: 'center'
      });
    });

    // Author & Department Info Footer Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.4, y: 5.3, w: 10.5, h: 0.95,
      fill: { color: '0F172A' },
      line: { color: C.border, width: 1 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'Presented By: ', options: { bold: true, color: C.textWhite, fontSize: 13 } },
      { text: 'Piyush Raj  ', options: { bold: true, color: C.emerald, fontSize: 14 } },
      { text: '(Student / Project Lead)\n', options: { color: C.textMuted, fontSize: 11 } },
      { text: 'Department: ', options: { bold: true, color: C.textWhite, fontSize: 11 } },
      { text: 'Computer Science & Engineering  |  College Project Presentation & Viva', options: { color: C.textMuted, fontSize: 11 } }
    ], {
      x: 1.6, y: 5.35, w: 10.1, h: 0.85,
      fontFace: FONT_BODY, valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 2: INTRODUCTION
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '01. Overview', 'Introduction to Website Doctor', 'Why modern websites need proactive clinical diagnosis rather than reactive fixes', 2);

    // Left Column: Key Explanations (3 cards)
    const points = [
      {
        num: '01',
        title: 'Websites Suffer From Silent Issues',
        desc: 'Websites frequently experience unexpected downtime, sudden latency spikes, expired SSL certificates, and security misconfigurations without immediate owner awareness.'
      },
      {
        num: '02',
        title: 'The Digital Doctor Metaphor',
        desc: 'Just as a medical doctor conducts routine health checkups to identify hidden illnesses early, Website Doctor runs continuous clinical diagnostic probes on target websites.'
      },
      {
        num: '03',
        title: 'Unified Health Intelligence',
        desc: 'Eliminates the need for multiple fragmented tools by aggregating uptime, response time, SSL integrity, security headers, and SEO into one unified, real-time dashboard.'
      }
    ];

    points.forEach((p, idx) => {
      const cardY = 2.15 + idx * 1.5;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: cardY, w: 5.6, h: 1.35,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });
      // Left accent badge
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 1.0, y: cardY + 0.15, w: 0.6, h: 0.35,
        fill: { color: '1E293B' },
        line: { color: C.cyan, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(p.num, {
        x: 1.0, y: cardY + 0.15, w: 0.6, h: 0.35,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.cyan, align: 'center', valign: 'middle'
      });
      slide.addText(p.title, {
        x: 1.75, y: cardY + 0.15, w: 4.5, h: 0.35,
        fontSize: 14, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(p.desc, {
        x: 1.0, y: cardY + 0.55, w: 5.2, h: 0.7,
        fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });

    // Right Column: Visual Health Flowchart
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 2.15, w: 5.73, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('CLINICAL DIAGNOSTIC LIFECYCLE', {
      x: 7.1, y: 2.35, w: 5.1, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.emerald
    });

    const flowSteps = [
      { step: '1', title: 'Target Website URL', detail: 'Public domain submitted (e.g., https://example.com)', color: C.cyan },
      { step: '2', title: 'Diagnostic Probing', detail: 'High-precision HTTP, TLS socket & DNS health checks', color: C.indigo },
      { step: '3', title: 'Automated Diagnosis', detail: 'Synthesizes transparent 0-100 Score & Clinical Advice', color: C.amber },
      { step: '4', title: 'Live Dashboard & Alerts', detail: 'Instant visibility with real-time SSE telemetry updates', color: C.emerald }
    ];

    flowSteps.forEach((s, idx) => {
      const stepY = 2.8 + idx * 0.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.1, y: stepY, w: 5.13, h: 0.75,
        fill: { color: C.cardBgAlt },
        line: { color: s.color, width: 1 },
        rectRadius: 0.1
      });
      slide.addText(s.step, {
        x: 7.25, y: stepY + 0.18, w: 0.4, h: 0.4,
        fontSize: 14, fontFace: FONT_TITLE, bold: true, color: s.color, align: 'center'
      });
      slide.addText(s.title, {
        x: 7.8, y: stepY + 0.12, w: 4.3, h: 0.28,
        fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(s.detail, {
        x: 7.8, y: stepY + 0.38, w: 4.3, h: 0.3,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted
      });
    });
  }

  // ==========================================
  // SLIDE 3: PROBLEM STATEMENT
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '02. Motivation', 'Problem Statement', 'The critical operational and technical challenges faced by website owners and developers', 3);

    const problems = [
      {
        tag: 'DOWNTIME',
        color: C.coral,
        title: 'Unannounced Website Outages',
        points: [
          'Websites can crash unexpectedly due to server faults or traffic surges.',
          'Downtime directly causes lost customers, ruined revenue, and damaged reputation.',
          'Owners often discover downtime only after users complain on social media.'
        ]
      },
      {
        tag: 'PERFORMANCE',
        color: C.amber,
        title: 'Silent Latency Degradation',
        points: [
          'A slow website (high TTFB) leads to massive user drop-off rates.',
          'Search engines penalize slow-loading pages in SEO search rankings.',
          'Without continuous metrics, intermittent performance bottlenecks stay invisible.'
        ]
      },
      {
        tag: 'SECURITY & SSL',
        color: C.indigo,
        title: 'SSL Expiry & Vulnerabilities',
        points: [
          'Expired SSL certificates trigger frightening browser security warnings.',
          'Missing security headers (HSTS, CSP) leave visitors vulnerable to attacks.',
          'Manual certificate expiry calendar reminders are frequently forgotten.'
        ]
      },
      {
        tag: 'TOOL FRAGMENTATION',
        color: C.cyan,
        title: 'Fragmented & Expensive Tools',
        points: [
          'Developers currently use 4 to 5 separate tools for DNS, ping, SSL, and SEO.',
          'Commercial monitoring platforms are overly complex and expensive for small projects.',
          'Lack of a single centralized health dashboard that anyone can understand.'
        ]
      }
    ];

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cardX = 0.8 + col * (5.7 + 0.33);
      const cardY = 2.15 + row * (2.25 + 0.2);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 5.7, h: 2.25,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });

      // Top Tag
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.25, y: cardY + 0.2, w: 1.8, h: 0.28,
        fill: { color: '1E293B' },
        line: { color: p.color, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(p.tag, {
        x: cardX + 0.25, y: cardY + 0.2, w: 1.8, h: 0.28,
        fontSize: 9, fontFace: FONT_TITLE, bold: true, color: p.color, align: 'center', valign: 'middle'
      });

      slide.addText(p.title, {
        x: cardX + 2.2, y: cardY + 0.2, w: 3.3, h: 0.3,
        fontSize: 13, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });

      // Bullet points
      const bulletText = p.points.map((pt) => `•  ${pt}`).join('\n');
      slide.addText(bulletText, {
        x: cardX + 0.25, y: cardY + 0.65, w: 5.2, h: 1.45,
        fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.2
      });
    });
  }

  // ==========================================
  // SLIDE 4: PROPOSED SOLUTION
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '03. Solution', 'Proposed Solution: Website Doctor', 'An all-in-one digital physician providing automated, continuous website diagnostics', 4);

    // Left Section: Core Solution Pillars
    const pillars = [
      {
        title: 'Single-Click Clinical Diagnosis',
        desc: 'User enters any publicly accessible website URL. Within seconds, Website Doctor audits HTTP response, SSL certificates, security headers, and SEO indicators.'
      },
      {
        title: 'Autonomous Continuous Monitoring',
        desc: 'A dedicated background worker continuously checks active websites every 15 to 60 seconds without requiring any manual intervention from the owner.'
      },
      {
        title: 'Transparent 0–100 Health Score',
        desc: 'Calculates an intuitive, un-blackboxed clinical score (0 to 100) based on availability, speed, security, and technical hygiene so non-technical owners understand health.'
      },
      {
        title: 'Real-Time Telemetry Stream (SSE)',
        desc: 'Leverages Server-Sent Events to push live latency and status updates directly to connected dashboards without refreshing the browser.'
      }
    ];

    pillars.forEach((pil, idx) => {
      const cardY = 2.15 + idx * 1.15;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: cardY, w: 6.2, h: 1.05,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.1
      });
      slide.addShape(pptx.shapes.OVAL, {
        x: 1.0, y: cardY + 0.25, w: 0.55, h: 0.55,
        fill: { color: '1E293B' },
        line: { color: C.emerald, width: 1 }
      });
      slide.addText(`✓`, {
        x: 1.0, y: cardY + 0.25, w: 0.55, h: 0.55,
        fontSize: 12, bold: true, color: C.emerald, align: 'center', valign: 'middle'
      });
      slide.addText(pil.title, {
        x: 1.7, y: cardY + 0.15, w: 5.1, h: 0.3,
        fontSize: 13, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(pil.desc, {
        x: 1.7, y: cardY + 0.45, w: 5.1, h: 0.55,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });

    // Right Section: Architecture Flow Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.3, y: 2.15, w: 5.23, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.cyan, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('END-TO-END DATA FLOW', {
      x: 7.6, y: 2.35, w: 4.6, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.cyan
    });

    const flowItems = [
      { icon: '1', title: 'User / Admin', subtitle: 'Enters website URL into dashboard' },
      { icon: '2', title: 'SSRF Guard & Prober', subtitle: 'Validates safety, resolves DNS, measures TTFB' },
      { icon: '3', title: 'Multi-Point Auditing', subtitle: 'Inspects TLS cert, response headers & page links' },
      { icon: '4', title: 'Diagnostic Engine', subtitle: 'Computes Health Score & generates clinical fixes' },
      { icon: '5', title: 'Live Dashboard', subtitle: 'Displays interactive charts, timeline & vitals' }
    ];

    flowItems.forEach((item, idx) => {
      const itemY = 2.8 + idx * 0.75;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 7.6, y: itemY, w: 4.63, h: 0.62,
        fill: { color: C.cardBgAlt },
        line: { color: C.border, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(item.icon, {
        x: 7.75, y: itemY + 0.12, w: 0.35, h: 0.35,
        fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center'
      });
      slide.addText(item.title, {
        x: 8.25, y: itemY + 0.08, w: 3.8, h: 0.25,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(item.subtitle, {
        x: 8.25, y: itemY + 0.32, w: 3.8, h: 0.25,
        fontSize: 9, fontFace: FONT_BODY, color: C.textMuted
      });
    });
  }

  // ==========================================
  // SLIDE 5: OBJECTIVES
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '04. Project Scope', 'Key Project Objectives', 'The primary technical and functional goals achieved in the development of Website Doctor', 5);

    const objectives = [
      {
        num: '01',
        title: 'Continuous Availability Monitoring',
        desc: 'Detect whether target websites are ONLINE, DEGRADED, or DOWN with zero manual polling overhead.',
        accent: C.emerald
      },
      {
        num: '02',
        title: 'High-Precision Latency Tracking',
        desc: 'Measure Time-To-First-Byte (TTFB), DNS lookup duration, TLS handshake, and overall response time in ms.',
        accent: C.cyan
      },
      {
        num: '03',
        title: 'HTTP & Server Status Auditing',
        desc: 'Validate HTTP status codes (200, 301, 404, 500, 504), compression encoding (gzip/br), and server headers.',
        accent: C.indigo
      },
      {
        num: '04',
        title: 'SSL / TLS Certificate Inspection',
        desc: 'Inspect TLS certificate expiration countdown, issuer authority (e.g. Let\'s Encrypt), and HTTPS redirect.',
        accent: C.amber
      },
      {
        num: '05',
        title: 'Intuitive 0–100 Health Score',
        desc: 'Provide a weighted, transparent grading algorithm that gives an immediate clinical health assessment.',
        accent: C.emerald
      },
      {
        num: '06',
        title: 'Real-Time Streaming Dashboard',
        desc: 'Stream live health metric events directly to the client browser using Server-Sent Events (SSE).',
        accent: C.cyan
      }
    ];

    objectives.forEach((obj, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cardX = 0.8 + col * (3.75 + 0.24);
      const cardY = 2.15 + row * (2.25 + 0.2);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 3.75, h: 2.25,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });

      // Top badge
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.25, y: cardY + 0.25, w: 0.65, h: 0.35,
        fill: { color: '1E293B' },
        line: { color: obj.accent, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(obj.num, {
        x: cardX + 0.25, y: cardY + 0.25, w: 0.65, h: 0.35,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: obj.accent, align: 'center', valign: 'middle'
      });

      slide.addText(obj.title, {
        x: cardX + 0.25, y: cardY + 0.75, w: 3.25, h: 0.55,
        fontSize: 14, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });

      slide.addText(obj.desc, {
        x: cardX + 0.25, y: cardY + 1.35, w: 3.25, h: 0.75,
        fontSize: 11, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 6: KEY FEATURES
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '05. Platform Features', 'Key Features of Website Doctor', 'Engineered to provide a comprehensive, multi-layer diagnosis for any web application', 6);

    // Featured Big Card: Real-Time Monitoring
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 2.15, w: 11.73, h: 1.5,
      fill: { color: '132338' },
      line: { color: C.emerald, width: 1.5 },
      rectRadius: 0.15
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1, y: 2.35, w: 2.6, h: 0.32,
      fill: { color: '064E3B' },
      line: { color: C.emerald, width: 1 },
      rectRadius: 0.15
    });
    slide.addText('⭐ FLAGSHIP FEATURE', {
      x: 1.1, y: 2.35, w: 2.6, h: 0.32,
      fontSize: 10, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center', valign: 'middle'
    });

    slide.addText('Real-Time Website Monitoring & Live SSE Streaming', {
      x: 1.1, y: 2.75, w: 8.5, h: 0.38,
      fontSize: 18, fontFace: FONT_TITLE, bold: true, color: C.textWhite
    });

    slide.addText('Autonomous continuous background worker schedules periodic probes (15s–60s) and broadcasts instant availability changes to dashboards via Server-Sent Events (SSE). No browser refresh needed.', {
      x: 1.1, y: 3.15, w: 11.0, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: C.textSub
    });

    // 4 Supporting Feature Cards
    const features = [
      {
        tag: 'PERFORMANCE',
        title: 'Latency & TTFB Analytics',
        desc: 'High-precision microsecond timers measuring DNS lookup, TCP connect, TTFB, and response duration with P95 metrics.',
        color: C.cyan
      },
      {
        tag: 'SECURITY',
        title: 'SSL / TLS Deep Inspector',
        desc: 'Validates certificate chains, days-to-expiry countdown, issuer credibility (e.g. Let\'s Encrypt), and HTTPS redirects.',
        color: C.indigo
      },
      {
        tag: 'DIAGNOSTICS',
        title: 'Clinical Health Score (0–100)',
        desc: 'Transparent formula grading Availability (30pts), Performance (20pts), Security (20pts), SEO (15pts), and Code Health (15pts).',
        color: C.emerald
      },
      {
        tag: 'SEO & HYGIENE',
        title: 'Broken Links & SEO Audit',
        desc: 'Embedded crawler checks internal & external links for 404/500 errors, audits meta descriptions, open graph, and sitemaps.',
        color: C.amber
      }
    ];

    features.forEach((feat, idx) => {
      const cardX = 0.8 + idx * (2.8 + 0.17);
      const cardY = 3.9;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 2.8, h: 2.8,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.2, y: cardY + 0.25, w: 1.5, h: 0.28,
        fill: { color: '1E293B' },
        line: { color: feat.color, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(feat.tag, {
        x: cardX + 0.2, y: cardY + 0.25, w: 1.5, h: 0.28,
        fontSize: 8, fontFace: FONT_TITLE, bold: true, color: feat.color, align: 'center', valign: 'middle'
      });

      slide.addText(feat.title, {
        x: cardX + 0.2, y: cardY + 0.65, w: 2.4, h: 0.55,
        fontSize: 13, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });

      slide.addText(feat.desc, {
        x: cardX + 0.2, y: cardY + 1.25, w: 2.4, h: 1.35,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 7: HOW IT WORKS
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '06. Execution Flow', 'How Website Doctor Works', 'Step-by-step technical pipeline from user URL input to live diagnostic reporting', 7);

    const steps = [
      { step: 'Step 1', title: 'URL Input & Validation', desc: 'User submits URL; SSRF Guard checks protocol and blocks internal/private IPs.' },
      { step: 'Step 2', title: 'DNS Resolution', desc: 'Queries A, AAAA, MX, and CNAME records to verify domain infrastructure.' },
      { step: 'Step 3', title: 'Network Latency Prober', desc: 'Measures high-precision DNS lookup, TCP handshake, and TTFB latency.' },
      { step: 'Step 4', title: 'TLS Socket Inspection', desc: 'Opens secure TLS socket to extract certificate validity, issuer, and cipher.' },
      { step: 'Step 5', title: 'Security Headers Audit', desc: 'Checks HSTS, CSP, X-Frame-Options, Referrer-Policy, and content security.' },
      { step: 'Step 6', title: 'Link Crawler & SEO', desc: 'Crawls page hyperlinks to detect broken URLs and verifies SEO meta tags.' },
      { step: 'Step 7', title: 'Health Score Calculation', desc: 'Aggregates test results into transparent 0–100 clinical score with grades.' },
      { step: 'Step 8', title: 'Dashboard Presentation', desc: 'Renders results on responsive UI with interactive SVG area and timeline charts.' },
      { step: 'Step 9', title: 'Continuous Worker Loop', desc: 'Schedules background re-checks every 15s; broadcasts updates over SSE.' }
    ];

    steps.forEach((s, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cardX = 0.8 + col * (3.75 + 0.24);
      const cardY = 2.15 + row * (1.45 + 0.15);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 3.75, h: 1.45,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.1
      });

      // Step pill
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.2, y: cardY + 0.18, w: 0.85, h: 0.26,
        fill: { color: '1E293B' },
        line: { color: C.emerald, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(s.step, {
        x: cardX + 0.2, y: cardY + 0.18, w: 0.85, h: 0.26,
        fontSize: 9, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center', valign: 'middle'
      });

      slide.addText(s.title, {
        x: cardX + 1.15, y: cardY + 0.18, w: 2.45, h: 0.28,
        fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });

      slide.addText(s.desc, {
        x: cardX + 0.2, y: cardY + 0.55, w: 3.35, h: 0.8,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 8: SYSTEM ARCHITECTURE
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '07. System Design', 'System Architecture & Data Flow', 'Modular, scalable full-stack architecture with decoupled frontend and background monitoring service', 8);

    // 5 Architectural Blocks arranged horizontally/vertically
    const layers = [
      {
        title: 'CLIENT / FRONTEND TIER',
        color: C.cyan,
        items: ['React 18 + Vite SPA', 'Vanilla CSS Design System', 'Server-Sent Events Client', 'Interactive SVG Telemetry Charts'],
        y: 2.15, h: 1.2
      },
      {
        title: 'API GATEWAY & ROUTING TIER',
        color: C.indigo,
        items: ['Express.js RESTful API Endpoints', 'CORS & Security Middleware', 'Real-time SSE Event Hub (/api/events)', 'Input Sanitization & Error Handler'],
        y: 3.5, h: 1.2
      },
      {
        title: 'CORE DIAGNOSTIC & MONITORING ENGINE',
        color: C.emerald,
        items: ['SSRF Security Guard', 'HTTP Network Prober', 'TLS Certificate Inspector', 'Continuous Worker Loop', 'Health Score Synthesizer (0-100)'],
        y: 4.85, h: 1.2
      }
    ];

    layers.forEach((layer) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 0.8, y: layer.y, w: 7.2, h: layer.h,
        fill: { color: C.cardBg },
        line: { color: layer.color, width: 1.2 },
        rectRadius: 0.12
      });

      slide.addText(layer.title, {
        x: 1.1, y: layer.y + 0.12, w: 6.6, h: 0.25,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: layer.color
      });

      const bullets = layer.items.map((it) => `• ${it}`).join('    ');
      slide.addText(bullets, {
        x: 1.1, y: layer.y + 0.42, w: 6.6, h: 0.65,
        fontSize: 10, fontFace: FONT_BODY, color: C.textWhite, lineSpacingMultiple: 1.2
      });
    });

    // Right Side: Database & External Targets
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 2.15, w: 4.23, h: 2.55,
      fill: { color: C.cardBg },
      line: { color: C.amber, width: 1.2 },
      rectRadius: 0.12
    });
    slide.addText('PERSISTENCE TIER', {
      x: 8.55, y: 2.35, w: 3.7, h: 0.25,
      fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.amber
    });
    slide.addText([
      { text: 'Relational Database Engine:\n', options: { bold: true, color: C.textWhite, fontSize: 11 } },
      { text: '• Native Embedded SQLite (<15MB RAM)\n', options: { color: C.textMuted, fontSize: 10 } },
      { text: '• PostgreSQL Compatible via DATABASE_URL\n\n', options: { color: C.textMuted, fontSize: 10 } },
      { text: 'Tables Stored:\n', options: { bold: true, color: C.textWhite, fontSize: 11 } },
      { text: '• monitors, monitor_checks, incidents,\n  alert_rules, broken_links, seo_checks', options: { color: C.textMuted, fontSize: 10 } }
    ], {
      x: 8.55, y: 2.7, w: 3.7, h: 1.8,
      fontFace: FONT_BODY
    });

    // External Target Websites Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 4.85, w: 4.23, h: 1.85,
      fill: { color: C.cardBg },
      line: { color: C.emerald, width: 1.2 },
      rectRadius: 0.12
    });
    slide.addText('EXTERNAL TARGETS', {
      x: 8.55, y: 5.05, w: 3.7, h: 0.25,
      fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.emerald
    });
    slide.addText('Public Websites & APIs (HTTP/HTTPS)\n• DNS Servers (A, AAAA, MX, CNAME)\n• TLS Handshake & Certificate Authorities\n• Target Web Application Servers', {
      x: 8.55, y: 5.4, w: 3.7, h: 1.15,
      fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.25
    });
  }

  // ==========================================
  // SLIDE 9: TECHNOLOGIES USED
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '08. Tech Stack', 'Technologies & Libraries Used', 'Production-ready modern technology stack powering frontend, backend, and deployment', 9);

    const techCategories = [
      {
        name: 'FRONTEND STACK',
        accent: C.cyan,
        techs: [
          { name: 'React 18', desc: 'Component-based UI architecture' },
          { name: 'Vite 6', desc: 'Ultra-fast Next-Gen frontend build tool' },
          { name: 'TypeScript', desc: 'End-to-end type safety & data contracts' },
          { name: 'Vanilla CSS', desc: 'Zero-framework custom obsidian design system' },
          { name: 'Lucide Icons', desc: 'Clean vector icons for medical/tech UI' }
        ]
      },
      {
        name: 'BACKEND STACK',
        accent: C.emerald,
        techs: [
          { name: 'Node.js (v24)', desc: 'Asynchronous event-driven runtime' },
          { name: 'Express.js', desc: 'Minimalist RESTful API web framework' },
          { name: 'Native TLS/Sockets', desc: 'Direct socket inspection for SSL certificates' },
          { name: 'Cheerio', desc: 'Server-side HTML parsing for SEO & links' },
          { name: 'SSRF Guard', desc: 'Custom loopback & private IP firewall' }
        ]
      },
      {
        name: 'DATABASE & DATA',
        accent: C.indigo,
        techs: [
          { name: 'Native SQLite', desc: 'Ultra-lightweight embedded DB (<15MB RAM)' },
          { name: 'PostgreSQL Pool', desc: 'External PostgreSQL compatibility' },
          { name: 'Time-Series Schema', desc: 'Indexed historical probe telemetry' },
          { name: 'JSON Storage', desc: 'Flexible storage for headers & issue trees' },
          { name: 'Seed Engine', desc: 'Pre-seeded realistic demonstration data' }
        ]
      },
      {
        name: 'DEPLOYMENT & CLOUD',
        accent: C.amber,
        techs: [
          { name: 'Vercel', desc: 'Global Edge CDN hosting React frontend' },
          { name: 'Render Cloud', desc: '24/7 background worker & Express API' },
          { name: 'GitHub', desc: 'Git source control & deployment trigger' },
          { name: 'Server-Sent Events', desc: 'Persistent real-time telemetry stream' },
          { name: 'DNS / Let\'s Encrypt', desc: 'Production SSL & automated certificates' }
        ]
      }
    ];

    techCategories.forEach((cat, idx) => {
      const cardX = 0.8 + idx * (2.8 + 0.17);
      const cardY = 2.15;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 2.8, h: 4.55,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });

      // Header Tag
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.2, y: cardY + 0.2, w: 2.4, h: 0.32,
        fill: { color: '1E293B' },
        line: { color: cat.accent, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(cat.name, {
        x: cardX + 0.2, y: cardY + 0.2, w: 2.4, h: 0.32,
        fontSize: 10, fontFace: FONT_TITLE, bold: true, color: cat.accent, align: 'center', valign: 'middle'
      });

      // Tech list items
      cat.techs.forEach((t, tIdx) => {
        const itemY = cardY + 0.65 + tIdx * 0.72;
        slide.addText(t.name, {
          x: cardX + 0.2, y: itemY, w: 2.4, h: 0.25,
          fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.textWhite
        });
        slide.addText(t.desc, {
          x: cardX + 0.2, y: itemY + 0.24, w: 2.4, h: 0.42,
          fontSize: 9.5, fontFace: FONT_BODY, color: C.textMuted
        });
      });
    });
  }

  // ==========================================
  // SLIDE 10: DASHBOARD / UI SHOWCASE
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '09. User Interface', 'Dashboard & Clinical Health UI', 'Modern, high-contrast dark SaaS dashboard delivering instant website health comprehension', 10);

    // Left Mockup Box: Simulated Live Dashboard Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 2.15, w: 7.2, h: 4.55,
      fill: { color: '0A0E17' },
      line: { color: C.cyan, width: 1.5 },
      rectRadius: 0.15
    });

    // Mockup Header Bar
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.0, y: 2.35, w: 6.8, h: 0.55,
      fill: { color: C.cardBgAlt },
      line: { color: C.border, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('Target: https://demo-store.example.com', {
      x: 1.2, y: 2.45, w: 4.2, h: 0.35,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.textWhite
    });
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.6, y: 2.45, w: 2.0, h: 0.32,
      fill: { color: '064E3B' },
      line: { color: C.emerald, width: 1 },
      rectRadius: 0.15
    });
    slide.addText('🟢 200 OK (ONLINE)', {
      x: 5.6, y: 2.45, w: 2.0, h: 0.32,
      fontSize: 10, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center', valign: 'middle'
    });

    // Big Health Score Ring Mockup
    slide.addShape(pptx.shapes.OVAL, {
      x: 1.3, y: 3.2, w: 1.8, h: 1.8,
      fill: { color: '1E293B' },
      line: { color: C.emerald, width: 4 }
    });
    slide.addText('87', {
      x: 1.3, y: 3.5, w: 1.8, h: 0.65,
      fontSize: 32, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center'
    });
    slide.addText('GRADE A', {
      x: 1.3, y: 4.15, w: 1.8, h: 0.3,
      fontSize: 10, fontFace: FONT_TITLE, bold: true, color: C.textMuted, align: 'center'
    });

    // Score Category Breakdown Table right next to ring
    const cats = [
      { name: 'Availability', score: '30 / 30 pts', status: 'Optimal', col: C.emerald },
      { name: 'Performance & TTFB', score: '18 / 20 pts', status: '243ms (Fast)', col: C.cyan },
      { name: 'Security & TLS Headers', score: '18 / 20 pts', status: 'Valid Cert', col: C.emerald },
      { name: 'Technical SEO Health', score: '11 / 15 pts', status: 'Meta Valid', col: C.amber },
      { name: 'Code & Broken Links', score: '10 / 15 pts', status: '0 Broken', col: C.emerald }
    ];

    cats.forEach((c, idx) => {
      const rowY = 3.15 + idx * 0.45;
      slide.addText(c.name, {
        x: 3.4, y: rowY, w: 2.0, h: 0.35,
        fontSize: 11, fontFace: FONT_BODY, bold: true, color: C.textWhite
      });
      slide.addText(c.score, {
        x: 5.4, y: rowY, w: 1.2, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted
      });
      slide.addText(c.status, {
        x: 6.5, y: rowY, w: 1.2, h: 0.35,
        fontSize: 10, fontFace: FONT_BODY, bold: true, color: c.col, align: 'right'
      });
    });

    // Bottom Vitals Strip in Mockup
    const subVitals = [
      { k: 'Response Time', v: '243 ms', c: C.cyan },
      { k: 'Rolling Uptime', v: '99.98%', c: C.emerald },
      { k: 'SSL Certificate', v: '180 Days Left', c: C.emerald },
      { k: 'Live Stream', v: 'SSE Connected', c: C.indigo }
    ];

    subVitals.forEach((v, idx) => {
      const vX = 1.0 + idx * 1.72;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: vX, y: 5.5, w: 1.62, h: 0.95,
        fill: { color: C.cardBgAlt },
        line: { color: C.border, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(v.k, {
        x: vX, y: 5.6, w: 1.62, h: 0.3,
        fontSize: 9, fontFace: FONT_BODY, color: C.textMuted, align: 'center'
      });
      slide.addText(v.v, {
        x: vX, y: 5.9, w: 1.62, h: 0.4,
        fontSize: 12, fontFace: FONT_TITLE, bold: true, color: v.c, align: 'center'
      });
    });

    // Right Side: UI Design Principles Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 8.3, y: 2.15, w: 4.23, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.15
    });
    slide.addText('UI / UX PRINCIPLES', {
      x: 8.55, y: 2.35, w: 3.7, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.cyan
    });

    const uiPoints = [
      { t: 'High-Contrast Dark Aesthetic', d: 'Obsidian styling reduces eye strain and highlights critical alert states on classroom projectors.' },
      { t: 'Color-Coded Status Tokens', d: '🟢 Green (Online), 🟡 Amber (Degraded/High Latency), 🔴 Red (Downtime/Outage).' },
      { t: 'At-A-Glance Vitals', d: 'Key indicators visible within 2 seconds without scrolling or digging through menus.' },
      { t: 'Responsive Layouts', d: 'Optimized for laptops, desktops, and mobile devices via CSS Flexbox and Grid.' }
    ];

    uiPoints.forEach((u, idx) => {
      const uY = 2.85 + idx * 0.95;
      slide.addText(`•  ${u.t}`, {
        x: 8.55, y: uY, w: 3.7, h: 0.3,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(u.d, {
        x: 8.8, y: uY + 0.28, w: 3.45, h: 0.55,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 11: REAL-TIME MONITORING
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '10. Core Capability', 'Real-Time Monitoring in Action', 'How the automated background worker tracks website health state transitions over time', 11);

    // Left Column: Example Chronological Timeline
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 2.15, w: 6.2, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('CHRONOLOGICAL INCIDENT TIMELINE EXAMPLE', {
      x: 1.1, y: 2.35, w: 5.6, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.cyan
    });

    const timeline = [
      { time: '10:00 AM', status: '🟢 ONLINE', ms: '210 ms', desc: 'Target website nominal (HTTP 200 OK)', color: C.emerald },
      { time: '10:05 AM', status: '🟢 ONLINE', ms: '235 ms', desc: 'All health checks passing cleanly', color: C.emerald },
      { time: '10:10 AM', status: '🟡 DEGRADED', ms: '920 ms', desc: 'Latency warning threshold exceeded (>900ms)', color: C.amber },
      { time: '10:15 AM', status: '🔴 DOWN', ms: '0 ms', desc: 'HTTP 504 Gateway Timeout; Outage incident opened', color: C.coral },
      { time: '10:20 AM', status: '🔴 DOWN', ms: '0 ms', desc: 'Consecutive failure #2; Critical alert dispatched', color: C.coral },
      { time: '10:25 AM', status: '🟢 RECOVERED', ms: '220 ms', desc: 'Service restored (200 OK); Incident auto-resolved', color: C.emerald }
    ];

    timeline.forEach((item, idx) => {
      const itemY = 2.8 + idx * 0.65;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 1.1, y: itemY, w: 5.6, h: 0.55,
        fill: { color: C.cardBgAlt },
        line: { color: item.color, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(item.time, {
        x: 1.25, y: itemY + 0.12, w: 1.0, h: 0.3,
        fontSize: 10, fontFace: FONT_BODY, bold: true, color: C.textMuted
      });
      slide.addText(item.status, {
        x: 2.25, y: itemY + 0.12, w: 1.3, h: 0.3,
        fontSize: 10, fontFace: FONT_TITLE, bold: true, color: item.color
      });
      slide.addText(item.desc, {
        x: 3.55, y: itemY + 0.12, w: 3.0, h: 0.3,
        fontSize: 9.5, fontFace: FONT_BODY, color: C.textWhite
      });
    });

    // Right Column: Mechanism Explanation
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.3, y: 2.15, w: 5.23, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('HOW REAL-TIME TELEMETRY WORKS', {
      x: 7.6, y: 2.35, w: 4.6, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.emerald
    });

    const mechPoints = [
      {
        t: 'Autonomous Worker Loop',
        d: 'A Node.js background timer wakes up every 15 seconds, queries all active monitors from the database, and schedules parallel asynchronous network probes.'
      },
      {
        t: 'Three-State Health Finite State Machine',
        d: 'Monitors transition smoothly between 🟢 Operational, 🟡 Degraded (latency >900ms), and 🔴 Down (HTTP 5xx, socket timeout, connection refused).'
      },
      {
        t: 'Server-Sent Events (SSE) Stream',
        d: 'When probe results arrive, the server pushes JSON event payloads directly to connected browser dashboards via a persistent HTTP streaming connection (/api/events).'
      },
      {
        t: 'Automatic Incident Lifecycle Management',
        d: 'Incidents are automatically opened upon consecutive probe failures and automatically closed when the website returns to normal operations.'
      }
    ];

    mechPoints.forEach((m, idx) => {
      const mY = 2.8 + idx * 0.95;
      slide.addText(`✔  ${m.t}`, {
        x: 7.6, y: mY, w: 4.6, h: 0.3,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(m.d, {
        x: 7.85, y: mY + 0.28, w: 4.35, h: 0.55,
        fontSize: 10, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.15
      });
    });
  }

  // ==========================================
  // SLIDE 12: TARGET USE CASES
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '11. Practical Application', 'Who Can Use Website Doctor?', 'Practical use cases across developers, business owners, startups, and academic students', 12);

    const useCases = [
      {
        role: 'Web Developers & Freelancers',
        tag: 'DEVELOPMENT',
        color: C.cyan,
        use: 'Verify staging & production deployments immediately before handing over deliverables to clients.'
      },
      {
        role: 'E-Commerce & Website Owners',
        tag: 'BUSINESS',
        color: C.emerald,
        use: 'Ensure checkout pages and storefronts stay online 24/7 to prevent revenue loss from unannounced outages.'
      },
      {
        role: 'SaaS Founders & Startups',
        tag: 'STARTUPS',
        color: C.indigo,
        use: 'Maintain high customer trust and meet 99.9% uptime Service Level Agreements (SLAs).'
      },
      {
        role: 'DevOps & IT System Admins',
        tag: 'OPERATIONS',
        color: C.amber,
        use: 'Monitor SSL certificate expiration dates and security headers without manual calendar tracking.'
      },
      {
        role: 'Digital Marketers & SEO Leads',
        tag: 'MARKETING',
        color: C.cyan,
        use: 'Identify broken links (404 errors), missing meta tags, and high TTFB latency that hurt Google rankings.'
      },
      {
        role: 'Computer Science Students',
        tag: 'EDUCATION',
        color: C.emerald,
        use: 'Learn how real-world network probes, TLS socket handshakes, SSRF firewalls, and SSE streams work.'
      }
    ];

    useCases.forEach((uc, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const cardX = 0.8 + col * (3.75 + 0.24);
      const cardY = 2.15 + row * (2.25 + 0.2);

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX, y: cardY, w: 3.75, h: 2.25,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 },
        rectRadius: 0.12
      });

      // Top Tag
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: cardX + 0.25, y: cardY + 0.2, w: 1.5, h: 0.28,
        fill: { color: '1E293B' },
        line: { color: uc.color, width: 1 },
        rectRadius: 0.08
      });
      slide.addText(uc.tag, {
        x: cardX + 0.25, y: cardY + 0.2, w: 1.5, h: 0.28,
        fontSize: 8.5, fontFace: FONT_TITLE, bold: true, color: uc.color, align: 'center', valign: 'middle'
      });

      slide.addText(uc.role, {
        x: cardX + 0.25, y: cardY + 0.65, w: 3.25, h: 0.55,
        fontSize: 13, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });

      slide.addText(uc.use, {
        x: cardX + 0.25, y: cardY + 1.25, w: 3.25, h: 0.8,
        fontSize: 10.5, fontFace: FONT_BODY, color: C.textMuted, lineSpacingMultiple: 1.18
      });
    });
  }

  // ==========================================
  // SLIDE 13: ADVANTAGES & FUTURE SCOPE
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, '12. Project Value', 'Advantages & Future Roadmap', 'Comparing current implemented advantages with upcoming extensions and future enhancements', 13);

    // Left Column: Current Implemented Advantages
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 2.15, w: 5.7, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.emerald, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText('CURRENT ADVANTAGES (IMPLEMENTED)', {
      x: 1.1, y: 2.35, w: 5.1, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.emerald
    });

    const currentAdv = [
      { t: 'All-In-One Unified Tool', d: 'Replaces 4+ fragmented tools for DNS, SSL, latency, headers, and broken links.' },
      { t: 'Zero-Bloat Lightweight Architecture', d: 'Uses native Node.js SQLite (<15MB RAM), booting in 0.5s without crashing free cloud tiers.' },
      { t: 'Transparent Health Scoring', d: 'No black-box mystery numbers; clear 5-category breakdown totaling 100 points.' },
      { t: 'Enterprise SSRF Security Guard', d: 'Strictly blocks loopbacks (127.0.0.1), private subnets, and AWS/GCP cloud metadata IPs.' },
      { t: 'Real-Time Telemetry Streaming', d: 'Instant visibility via Server-Sent Events (SSE) without manual page refreshing.' }
    ];

    currentAdv.forEach((adv, idx) => {
      const aY = 2.8 + idx * 0.75;
      slide.addText(`✅  ${adv.t}`, {
        x: 1.1, y: aY, w: 5.1, h: 0.28,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(adv.d, {
        x: 1.45, y: aY + 0.26, w: 4.75, h: 0.42,
        fontSize: 9.5, fontFace: FONT_BODY, color: C.textMuted
      });
    });

    // Right Column: Future Roadmap
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.8, y: 2.15, w: 5.73, h: 4.55,
      fill: { color: C.cardBg },
      line: { color: C.cyan, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addText('FUTURE SCOPE & ROADMAP', {
      x: 7.1, y: 2.35, w: 5.1, h: 0.3,
      fontSize: 12, fontFace: FONT_TITLE, bold: true, color: C.cyan
    });

    const futureScope = [
      { t: 'Multi-Channel Alert Dispatching', d: 'Instant notifications via Email (SMTP), Telegram bots, Slack, and Discord webhooks.' },
      { t: 'Multi-Region Distributed Probing', d: 'Latency and uptime comparisons across global nodes (North America, Europe, Asia).' },
      { t: 'Core Web Vitals Integration', d: 'Deep audits of Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and INP.' },
      { t: 'Public Status Pages', d: 'Shareable public status badges and branded status pages for users and clients.' },
      { t: 'Automated AI Remediation Playbooks', d: 'Generating automated Nginx, Apache, and Cloudflare configuration snippets.' }
    ];

    futureScope.forEach((fut, idx) => {
      const fY = 2.8 + idx * 0.75;
      slide.addText(`🚀  ${fut.t}`, {
        x: 7.1, y: fY, w: 5.1, h: 0.28,
        fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.textWhite
      });
      slide.addText(fut.d, {
        x: 7.45, y: fY + 0.26, w: 4.75, h: 0.42,
        fontSize: 9.5, fontFace: FONT_BODY, color: C.textMuted
      });
    });
  }

  // ==========================================
  // SLIDE 14: CONCLUSION & Q&A
  // ==========================================
  {
    const slide = pptx.addSlide();
    initSlide(slide, null, null, null, 14);

    // Main Center Showcase Card
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y: 0.8, w: 10.33, h: 5.8,
      fill: { color: C.cardBg },
      line: { color: C.border, width: 1.5 },
      rectRadius: 0.2
    });

    // Badge
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 4.66, y: 1.2, w: 4.0, h: 0.4,
      fill: { color: '1E293B' },
      line: { color: C.emerald, width: 1 },
      rectRadius: 0.2
    });
    slide.addText('PROJECT CONCLUSION & VIVA', {
      x: 4.66, y: 1.2, w: 4.0, h: 0.4,
      fontSize: 11, fontFace: FONT_TITLE, bold: true, color: C.emerald,
      align: 'center', valign: 'middle'
    });

    // Big Thank You
    slide.addText('Thank You!', {
      x: 2.0, y: 1.8, w: 9.33, h: 0.9,
      fontSize: 48, fontFace: FONT_TITLE, bold: true, color: C.textWhite, align: 'center'
    });

    slide.addText('Website Doctor is successfully deployed and running live on the cloud.', {
      x: 2.0, y: 2.8, w: 9.33, h: 0.45,
      fontSize: 15, fontFace: FONT_BODY, color: C.cyan, align: 'center'
    });

    // Summary Quote Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 2.2, y: 3.4, w: 8.93, h: 1.2,
      fill: { color: '0F172A' },
      line: { color: C.border, width: 1 },
      rectRadius: 0.1
    });
    slide.addText('“Website Doctor provides a simple, unified way to monitor and understand website health in real time. It combines availability, latency, HTTPS/SSL, and health indicators into one accessible dashboard — diagnosing issues before users do.”', {
      x: 2.4, y: 3.5, w: 8.53, h: 1.0,
      fontSize: 12, fontFace: FONT_BODY, italic: true, color: C.textSub,
      align: 'center', valign: 'middle', lineSpacingMultiple: 1.2
    });

    // Presenter & Q&A Footnote
    slide.addText('Presented by: Piyush Raj  •  Department of Computer Science & Engineering', {
      x: 2.0, y: 4.8, w: 9.33, h: 0.35,
      fontSize: 12, fontFace: FONT_BODY, bold: true, color: C.textMuted, align: 'center'
    });

    slide.addText('Questions & Discussion Welcomed', {
      x: 2.0, y: 5.2, w: 9.33, h: 0.5,
      fontSize: 16, fontFace: FONT_TITLE, bold: true, color: C.emerald, align: 'center'
    });
  }

  // Save the presentation
  const outputPath = path.resolve(process.cwd(), 'Website_Doctor_College_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation created successfully at: ${outputPath}`);
}

createPresentation().catch((err) => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
