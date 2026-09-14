import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface SecurityHeaderItem {
  name: string;
  value?: string;
  status: 'present' | 'missing' | 'not_applicable';
  evaluation: 'pass' | 'warning' | 'fail';
  meaning: string;
  whyItMatters: string;
  possibleFix: string;
  snippet?: {
    nginx: string;
    apache: string;
    cloudflare: string;
  };
}

export interface SecurityHeadersReport {
  headers: SecurityHeaderItem[];
  score: number; // 0 to 100
  presentCount: number;
  passCount: number;
  warningCount: number;
  failCount: number;
  totalEvaluated: number;
}

const SECURITY_HEADER_DEFINITIONS = [
  {
    name: 'Strict-Transport-Security',
    meaning: 'Ensures browsers exclusively connect via secure HTTPS, preventing SSL stripping attacks.',
    whyItMatters: 'Protects user communication from downgrade attacks and eavesdropping across untrusted networks.',
    possibleFix: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload" to HTTP response headers.',
    snippet: {
      nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
      apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
      cloudflare: 'SSL/TLS -> Edge Certificates -> Enable HSTS (max-age 12 months)',
    },
  },
  {
    name: 'Content-Security-Policy',
    meaning: 'Restricts which scripts, styles, images, and resources can be loaded and executed by the browser.',
    whyItMatters: 'Dramatically reduces the risk of Cross-Site Scripting (XSS) and data injection vulnerabilities.',
    possibleFix: 'Configure a "Content-Security-Policy" header defining trusted domains for scripts, styles, and objects.',
    snippet: {
      nginx: "add_header Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;\" always;",
      apache: "Header set Content-Security-Policy \"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';\"",
      cloudflare: "Transform Rules -> Modify Response Header -> set Content-Security-Policy",
    },
  },
  {
    name: 'X-Frame-Options',
    meaning: 'Determines whether your page can be embedded inside an iframe, frame, or object.',
    whyItMatters: 'Prevents Clickjacking attacks where an attacker overlays an invisible iframe to hijack user clicks.',
    possibleFix: 'Set "X-Frame-Options: SAMEORIGIN" or "DENY", or use the modern CSP "frame-ancestors" directive.',
    snippet: {
      nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
      apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
      cloudflare: 'Transform Rules -> set X-Frame-Options "SAMEORIGIN"',
    },
  },
  {
    name: 'X-Content-Type-Options',
    meaning: 'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
    whyItMatters: 'Prevents drive-by download attacks where non-executable assets are misinterpreted as executable code.',
    possibleFix: 'Add "X-Content-Type-Options: nosniff" to your HTTP response headers.',
    snippet: {
      nginx: 'add_header X-Content-Type-Options "nosniff" always;',
      apache: 'Header always set X-Content-Type-Options "nosniff"',
      cloudflare: 'Transform Rules -> set X-Content-Type-Options "nosniff"',
    },
  },
  {
    name: 'Referrer-Policy',
    meaning: 'Controls how much referrer information (URL path and query strings) is sent when navigating away.',
    whyItMatters: 'Prevents leaking private user URLs, tokens, or confidential query parameters to third parties.',
    possibleFix: 'Set "Referrer-Policy: strict-origin-when-cross-origin" in your web server configuration.',
    snippet: {
      nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
      apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
      cloudflare: 'Transform Rules -> set Referrer-Policy "strict-origin-when-cross-origin"',
    },
  },
  {
    name: 'Permissions-Policy',
    meaning: 'Allows web developers to selectively enable or disable sensitive browser features and hardware APIs.',
    whyItMatters: 'Restricts unauthorized camera, microphone, or geolocation access by third-party scripts.',
    possibleFix: 'Set "Permissions-Policy: camera=(), microphone=(), geolocation=()" in HTTP response headers.',
    snippet: {
      nginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;',
      apache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
      cloudflare: 'Transform Rules -> set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
    },
  },
];

/**
 * Evaluates security headers from a raw response header map with Pass / Warning / Fail grading.
 */
export function analyzeSecurityHeaders(rawHeaders: Record<string, any>): SecurityHeadersReport {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    normalized[k.toLowerCase()] = String(v);
  }

  const items: SecurityHeaderItem[] = [];
  let presentCount = 0;
  let passCount = 0;
  let warningCount = 0;
  let failCount = 0;

  for (const def of SECURITY_HEADER_DEFINITIONS) {
    const headerKey = def.name.toLowerCase();
    const val = normalized[headerKey];

    if (val) {
      presentCount++;
      let evaluation: 'pass' | 'warning' | 'fail' = 'pass';

      // Granular evaluation logic
      if (def.name === 'Strict-Transport-Security') {
        const hasSubdomains = val.includes('includeSubDomains');
        const match = val.match(/max-age=(\d+)/);
        const maxAge = match ? parseInt(match[1], 10) : 0;
        if (maxAge < 10886400 || !hasSubdomains) {
          evaluation = 'warning';
        } else {
          evaluation = 'pass';
        }
      } else if (def.name === 'Content-Security-Policy') {
        if (val.includes("'unsafe-inline'") || val.includes("'unsafe-eval'") || val.includes('*')) {
          evaluation = 'warning';
        } else {
          evaluation = 'pass';
        }
      } else if (def.name === 'X-Frame-Options') {
        const upper = val.toUpperCase();
        if (upper.includes('DENY') || upper.includes('SAMEORIGIN')) {
          evaluation = 'pass';
        } else {
          evaluation = 'warning';
        }
      } else if (def.name === 'X-Content-Type-Options') {
        evaluation = val.toLowerCase().includes('nosniff') ? 'pass' : 'warning';
      } else if (def.name === 'Referrer-Policy') {
        if (val.toLowerCase().includes('unsafe-url')) {
          evaluation = 'warning';
        } else {
          evaluation = 'pass';
        }
      } else if (def.name === 'Permissions-Policy') {
        evaluation = 'pass';
      }

      if (evaluation === 'pass') passCount++;
      else warningCount++;

      items.push({
        name: def.name,
        value: val,
        status: 'present',
        evaluation,
        meaning: def.meaning,
        whyItMatters: def.whyItMatters,
        possibleFix: evaluation === 'pass' ? 'Configured properly according to security standards.' : def.possibleFix,
        snippet: def.snippet,
      });
    } else {
      failCount++;
      items.push({
        name: def.name,
        value: undefined,
        status: 'missing',
        evaluation: 'fail',
        meaning: def.meaning,
        whyItMatters: def.whyItMatters,
        possibleFix: def.possibleFix,
        snippet: def.snippet,
      });
    }
  }

  // Weight: Pass = 100%, Warning = 50%, Fail = 0%
  const score = Math.round(
    ((passCount * 1.0 + warningCount * 0.5) / SECURITY_HEADER_DEFINITIONS.length) * 100
  );

  return {
    headers: items,
    score,
    presentCount,
    passCount,
    warningCount,
    failCount,
    totalEvaluated: SECURITY_HEADER_DEFINITIONS.length,
  };
}
