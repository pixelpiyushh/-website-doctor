import dns from 'node:dns/promises';
import { URL } from 'node:url';

export interface DNSRecordSet {
  domain: string;
  a: string[];
  aaaa: string[];
  mx: { exchange: string; priority: number }[];
  txt: string[];
  ns: string[];
  cname: string[];
  resolvedAt: string;
}

/**
 * Resolves standard DNS records for a given target URL or hostname.
 */
export async function inspectDNS(targetUrl: string): Promise<DNSRecordSet> {
  let domain = targetUrl;
  try {
    const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    domain = parsed.hostname;
  } catch {
    // keep as is
  }

  const result: DNSRecordSet = {
    domain,
    a: [],
    aaaa: [],
    mx: [],
    txt: [],
    ns: [],
    cname: [],
    resolvedAt: new Date().toISOString(),
  };

  // Safe resolver helper
  const safeResolve = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const [a, aaaa, mx, txt, ns, cname] = await Promise.all([
    safeResolve(() => dns.resolve4(domain), []),
    safeResolve(() => dns.resolve6(domain), []),
    safeResolve(() => dns.resolveMx(domain), []),
    safeResolve(() => dns.resolveTxt(domain).then((rows) => rows.map((r) => r.join(' '))), []),
    safeResolve(() => dns.resolveNs(domain), []),
    safeResolve(() => dns.resolveCname(domain), []),
  ]);

  result.a = a;
  result.aaaa = aaaa;
  result.mx = mx;
  result.txt = txt.slice(0, 10);
  result.ns = ns;
  result.cname = cname;

  return result;
}
