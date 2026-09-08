import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface SecurityHeaderItem {
  name: string;
  value?: string;
  status: 'present' | 'missing' | 'not_applicable';
  meaning: string;
  whyItMatters: string;
  possibleFix: string;
}

export interface SecurityHeadersReport {
  headers: SecurityHeaderItem[];
  score: number; // 0 to 100
  presentCount: number;
  totalEvaluated: number;
}

const SECURITY_HEADER_DEFINITIONS = [
  {
    name: 'Strict-Transport-Security',
    meaning: 'Ensures browsers exclusively connect via secure HTTPS, preventing SSL stripping attacks.',
    whyItMatters: 'Protects user communication from downgrade attacks and eavesdropping across untrusted networks.',
    possibleFix: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains" to your web server response headers.',
  },
  {
    name: 'Content-Security-Policy',
    meaning: 'Restricts which scripts, styles, images, and resources can be loaded and executed by the browser.',
    whyItMatters: 'Dramatically reduces the risk of Cross-Site Scripting (XSS) and data injection vulnerabilities.',
    possibleFix: 'Configure a "Content-Security-Policy" header defining trusted sources for scripts, styles, and media.',
  },
  {
    name: 'X-Frame-Options',
    meaning: 'Determines whether your page can be embedded inside an iframe, frame, or object.',
    whyItMatters: 'Prevents Clickjacking attacks where an attacker overlays a malicious UI over your authentic web page.',
    possibleFix: 'Set "X-Frame-Options: SAMEORIGIN" or "DENY", or use the modern CSP "frame-ancestors" directive.',
  },
  {
    name: 'X-Content-Type-Options',
    meaning: 'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
    whyItMatters: 'Prevents drive-by download attacks where non-executable files (like images or text) are misinterpreted as executable code.',
    possibleFix: 'Add "X-Content-Type-Options: nosniff" to your HTTP response headers.',
  },
  {
    name: 'Referrer-Policy',
    meaning: 'Controls how much referrer information (URL path and query strings) is sent when a user navigates away.',
    whyItMatters: 'Prevents leaking private user URLs, tokens, or confidential query parameters to third-party destinations.',
    possibleFix: 'Set "Referrer-Policy: strict-origin-when-cross-origin" in your web server configuration.',
  },
  {
    name: 'Permissions-Policy',
    meaning: 'Allows web developers to selectively enable, disable, and modify browser features and APIs (camera, microphone, geolocation).',
    whyItMatters: 'Restricts unauthorized access to sensitive hardware or browser APIs by third-party scripts or embedded embeds.',
    possibleFix: 'Set "Permissions-Policy: camera=(), microphone=(), geolocation=()" in your HTTP response headers.',
  },
];

/**
 * Evaluates security headers from a raw response header map or makes a quick HEAD request.
 */
export function analyzeSecurityHeaders(rawHeaders: Record<string, any>): SecurityHeadersReport {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawHeaders)) {
    normalized[k.toLowerCase()] = String(v);
  }

  const items: SecurityHeaderItem[] = [];
  let presentCount = 0;

  for (const def of SECURITY_HEADER_DEFINITIONS) {
    const headerKey = def.name.toLowerCase();
    const val = normalized[headerKey];

    if (val) {
      presentCount++;
      items.push({
        name: def.name,
        value: val,
        status: 'present',
        meaning: def.meaning,
        whyItMatters: def.whyItMatters,
        possibleFix: 'Configured properly.',
      });
    } else {
      items.push({
        name: def.name,
        value: undefined,
        status: 'missing',
        meaning: def.meaning,
        whyItMatters: def.whyItMatters,
        possibleFix: def.possibleFix,
      });
    }
  }

  const score = Math.round((presentCount / SECURITY_HEADER_DEFINITIONS.length) * 100);

  return {
    headers: items,
    score,
    presentCount,
    totalEvaluated: SECURITY_HEADER_DEFINITIONS.length,
  };
}
