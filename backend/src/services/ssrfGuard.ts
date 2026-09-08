import dns from 'node:dns/promises';
import net from 'node:net';

export interface SSRFValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  hostname?: string;
  error?: string;
}

/**
 * Checks whether an IPv4 address is in a private, reserved, loopback, or link-local range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // invalid format treated as unsafe
  }

  const [a, b, c, d] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 10.0.0.0/8 (Private class A)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 169.254.0.0/16 (Link-local, AWS / GCP / Azure metadata service 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Private class B: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private class C)
  if (a === 192 && b === 168) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reserved)
  if (a >= 240) return true;

  // 255.255.255.255 (Broadcast)
  if (a === 255 && b === 255 && c === 255 && d === 255) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is private, loopback, or link-local.
 */
function isPrivateIPv6(ip: string): boolean {
  const cleanIp = ip.toLowerCase();

  // Loopback ::1
  if (cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') return true;

  // Unspecified ::
  if (cleanIp === '::' || cleanIp === '0:0:0:0:0:0:0:0') return true;

  // Unique Local Address fc00::/7 (fc00... or fd00...)
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) return true;

  // Link-local unicast fe80::/10 (fe8, fe9, fea, feb...)
  if (/^fe[89ab]/i.test(cleanIp)) return true;

  // Multicast ff00::/8
  if (cleanIp.startsWith('ff')) return true;

  // IPv4-mapped IPv6 ::ffff:192.0.2.128
  if (cleanIp.includes('::ffff:')) {
    const v4Part = cleanIp.split('::ffff:')[1];
    if (net.isIPv4(v4Part)) {
      return isPrivateIPv4(v4Part);
    }
  }

  return false;
}

/**
 * Normalize and strictly validate URL against SSRF vulnerabilities.
 */
export async function validateUrlForSSRF(rawUrl: string): Promise<SSRFValidationResult> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  let trimmed = rawUrl.trim();

  // If a protocol is explicitly provided, verify it is http or https
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//i.test(trimmed)) {
    if (!/^https?:\/\//i.test(trimmed)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
    }
  } else {
    // Protocol omitted, auto-prepend https://
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    return { isValid: false, error: 'Invalid URL format.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard reserved local names
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.test') ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  ) {
    return {
      isValid: false,
      error: 'Access to localhost and internal hostnames is restricted for security (SSRF Protection).',
    };
  }

  // Check if hostname is direct IP literal
  if (net.isIPv4(hostname)) {
    if (isPrivateIPv4(hostname)) {
      return {
        isValid: false,
        error: `IP address ${hostname} belongs to a private/reserved network range and cannot be monitored.`,
      };
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateIPv6(hostname)) {
      return {
        isValid: false,
        error: `IPv6 address ${hostname} is private or loopback and cannot be monitored.`,
      };
    }
  } else {
    // Resolve hostname DNS to check IP addresses
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        return { isValid: false, error: `Could not resolve DNS records for host: ${hostname}` };
      }

      for (const record of records) {
        if (record.family === 4 && isPrivateIPv4(record.address)) {
          return {
            isValid: false,
            error: `Domain ${hostname} resolves to private IP (${record.address}). Request blocked by SSRF guard.`,
          };
        }
        if (record.family === 6 && isPrivateIPv6(record.address)) {
          return {
            isValid: false,
            error: `Domain ${hostname} resolves to private IPv6 (${record.address}). Request blocked by SSRF guard.`,
          };
        }
      }
    } catch (dnsErr: any) {
      return {
        isValid: false,
        error: `DNS lookup failed for ${hostname}: ${dnsErr.message || 'Host not found'}.`,
      };
    }
  }

  // Normalized clean URL (remove hash, ensure trailing slash if empty pathname)
  parsed.hash = '';
  const normalizedUrl = parsed.toString();

  return {
    isValid: true,
    normalizedUrl,
    hostname,
  };
}
