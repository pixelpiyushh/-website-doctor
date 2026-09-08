import * as cheerio from 'cheerio';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { CONFIG } from '../config.js';

export interface ScannedLink {
  url: string;
  statusCode: number;
  status: 'working' | 'broken' | 'redirected' | 'blocked';
  type: 'internal' | 'external';
  sourcePage: string;
  anchorText: string;
  responseTimeMs: number;
  error?: string;
}

export interface BrokenLinksReport {
  scannedAt: string;
  totalScanned: number;
  workingCount: number;
  brokenCount: number;
  redirectedCount: number;
  blockedCount: number;
  crawlLimitReached: boolean;
  links: ScannedLink[];
}

/**
 * Checks a single link using HEAD or GET request, validating against SSRF.
 */
async function probeLink(
  targetUrl: string,
  sourcePage: string,
  anchorText: string,
  baseHostname: string
): Promise<ScannedLink> {
  const isExternal = !targetUrl.includes(baseHostname);
  const type: 'internal' | 'external' = isExternal ? 'external' : 'internal';

  // SSRF guard
  const ssrf = await validateUrlForSSRF(targetUrl);
  if (!ssrf.isValid) {
    return {
      url: targetUrl,
      statusCode: 0,
      status: 'blocked',
      type,
      sourcePage,
      anchorText,
      responseTimeMs: 0,
      error: ssrf.error || 'Blocked by security guard',
    };
  }

  const client = targetUrl.startsWith('https') ? https : http;
  const start = Date.now();

  return new Promise<ScannedLink>((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const req = client.request(
        parsed,
        {
          method: 'HEAD',
          timeout: 5000,
          headers: {
            'User-Agent': 'WebsiteDoctor-LinkChecker/1.0',
          },
        },
        (res) => {
          const statusCode = res.statusCode || 0;
          const duration = Date.now() - start;

          let status: 'working' | 'broken' | 'redirected' = 'working';
          if (statusCode >= 400 || statusCode === 0) {
            status = 'broken';
          } else if (statusCode >= 300 && statusCode < 400) {
            status = 'redirected';
          }

          resolve({
            url: targetUrl,
            statusCode,
            status,
            type,
            sourcePage,
            anchorText,
            responseTimeMs: duration,
          });
        }
      );

      req.on('error', (err) => {
        resolve({
          url: targetUrl,
          statusCode: 0,
          status: 'broken',
          type,
          sourcePage,
          anchorText,
          responseTimeMs: Date.now() - start,
          error: err.message || 'Connection failed',
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url: targetUrl,
          statusCode: 408,
          status: 'broken',
          type,
          sourcePage,
          anchorText,
          responseTimeMs: Date.now() - start,
          error: 'Probe timed out after 5000ms',
        });
      });

      req.end();
    } catch (err: any) {
      resolve({
        url: targetUrl,
        statusCode: 0,
        status: 'broken',
        type,
        sourcePage,
        anchorText,
        responseTimeMs: Date.now() - start,
        error: err.message || 'Malformed link URL',
      });
    }
  });
}

/**
 * Parses all anchor links from HTML and probes up to a maximum limit with concurrency control.
 */
export async function scanBrokenLinks(
  html: string,
  pageUrl: string,
  maxLinks: number = CONFIG.crawlerMaxLinks
): Promise<BrokenLinksReport> {
  const $ = cheerio.load(html);
  const baseParsed = new URL(pageUrl);
  const baseHostname = baseParsed.hostname;

  const candidateLinks: { url: string; anchor: string }[] = [];
  const seenUrls = new Set<string>();

  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href')?.trim();
    if (!rawHref) return;

    // Ignore javascript:, mailto:, tel:, #anchors
    if (
      rawHref.startsWith('javascript:') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('#')
    ) {
      return;
    }

    try {
      const resolved = new URL(rawHref, pageUrl).toString();
      if (!seenUrls.has(resolved) && candidateLinks.length < maxLinks) {
        seenUrls.add(resolved);
        const text = $(el).text().trim().replace(/\s+/g, ' ').slice(0, 40) || '[No text]';
        candidateLinks.push({ url: resolved, anchor: text });
      }
    } catch {
      // Invalid URL syntax ignored
    }
  });

  // Concurrency bounded probe (5 workers)
  const results: ScannedLink[] = [];
  const concurrency = 5;
  for (let i = 0; i < candidateLinks.length; i += concurrency) {
    const slice = candidateLinks.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      slice.map((item) => probeLink(item.url, pageUrl, item.anchor, baseHostname))
    );
    results.push(...batchResults);
  }

  const workingCount = results.filter((r) => r.status === 'working').length;
  const brokenCount = results.filter((r) => r.status === 'broken').length;
  const redirectedCount = results.filter((r) => r.status === 'redirected').length;
  const blockedCount = results.filter((r) => r.status === 'blocked').length;

  return {
    scannedAt: new Date().toISOString(),
    totalScanned: results.length,
    workingCount,
    brokenCount,
    redirectedCount,
    blockedCount,
    crawlLimitReached: candidateLinks.length >= maxLinks,
    links: results,
  };
}
