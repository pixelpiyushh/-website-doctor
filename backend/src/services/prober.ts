import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';
import { validateUrlForSSRF } from './ssrfGuard.js';
import { CONFIG } from '../config.js';

export interface ProbeOptions {
  method?: string;
  timeoutMs?: number;
  expectedStatusCode?: number;
  keywordMatch?: string;
}

export interface ProbeResult {
  url: string;
  finalUrl: string;
  statusCode: number;
  statusMessage: string;
  isOnline: boolean;
  responseTimeMs: number;
  ttfbMs: number;
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number;
  contentLength: number;
  contentType: string;
  contentEncoding: string;
  serverHeader: string;
  cacheControl: string;
  redirectCount: number;
  redirectChain: string[];
  keywordMatched?: boolean;
  rawBodyPreview?: string;
  htmlBody?: string;
  error?: string;
}

/**
 * Executes a network probe against a URL with high-precision timing and SSRF safety.
 */
export async function executeProbe(
  targetUrl: string,
  options: ProbeOptions = {}
): Promise<ProbeResult> {
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = options.timeoutMs || CONFIG.defaultCheckTimeoutMs;
  const redirectChain: string[] = [];

  let currentUrl = targetUrl;
  let redirects = 0;

  while (redirects <= CONFIG.maxRedirects) {
    const ssrfCheck = await validateUrlForSSRF(currentUrl);
    if (!ssrfCheck.isValid || !ssrfCheck.normalizedUrl) {
      return {
        url: targetUrl,
        finalUrl: currentUrl,
        statusCode: 0,
        statusMessage: 'SSRF Check Failed',
        isOnline: false,
        responseTimeMs: 0,
        ttfbMs: 0,
        dnsTimeMs: 0,
        tcpTimeMs: 0,
        tlsTimeMs: 0,
        contentLength: 0,
        contentType: '',
        contentEncoding: '',
        serverHeader: '',
        cacheControl: '',
        redirectCount: redirects,
        redirectChain,
        error: ssrfCheck.error || 'Blocked by SSRF Guard',
      };
    }

    const parsedUrl = new URL(ssrfCheck.normalizedUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const timings = {
      start: process.hrtime.bigint(),
      dns: 0n,
      tcp: 0n,
      tls: 0n,
      firstByte: 0n,
      end: 0n,
    };

    try {
      const result = await new Promise<ProbeResult>((resolve, reject) => {
        const req = client.request(
          parsedUrl,
          {
            method,
            timeout: timeoutMs,
            headers: {
              'User-Agent': 'WebsiteDoctor/1.0 (+https://websitedoctor.local/bot)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'close',
            },
          },
          (res) => {
            timings.firstByte = process.hrtime.bigint();

            const statusCode = res.statusCode || 0;
            const statusMessage = res.statusMessage || '';
            const location = res.headers.location;

            // Handle HTTP redirects (301, 302, 303, 307, 308)
            if (
              [301, 302, 303, 307, 308].includes(statusCode) &&
              location &&
              redirects < CONFIG.maxRedirects
            ) {
              res.resume(); // consume stream to free sockets
              redirectChain.push(currentUrl);
              const nextUrl = new URL(location, currentUrl).toString();
              currentUrl = nextUrl;
              redirects++;
              resolve({
                url: targetUrl,
                finalUrl: currentUrl,
                statusCode,
                statusMessage,
                isOnline: true,
                responseTimeMs: 0,
                ttfbMs: 0,
                dnsTimeMs: 0,
                tcpTimeMs: 0,
                tlsTimeMs: 0,
                contentLength: 0,
                contentType: '',
                contentEncoding: '',
                serverHeader: '',
                cacheControl: '',
                redirectCount: redirects,
                redirectChain,
              });
              return;
            }

            const chunks: Buffer[] = [];
            let totalBytes = 0;

            res.on('data', (chunk: Buffer) => {
              totalBytes += chunk.length;
              if (totalBytes <= CONFIG.maxContentLengthBytes) {
                chunks.push(chunk);
              }
            });

            res.on('end', () => {
              timings.end = process.hrtime.bigint();

              const fullBuffer = Buffer.concat(chunks);
              const bodyString = fullBuffer.toString('utf-8', 0, Math.min(fullBuffer.length, 500000));

              const responseTimeMs = Number(timings.end - timings.start) / 1_000_000;
              const ttfbMs = timings.firstByte ? Number(timings.firstByte - timings.start) / 1_000_000 : responseTimeMs;
              const dnsTimeMs = timings.dns ? Number(timings.dns - timings.start) / 1_000_000 : 0;
              const tcpTimeMs = timings.tcp ? Number(timings.tcp - (timings.dns || timings.start)) / 1_000_000 : 0;
              const tlsTimeMs = timings.tls ? Number(timings.tls - (timings.tcp || timings.start)) / 1_000_000 : 0;

              const expectedCode = options.expectedStatusCode || 200;
              const isStatusValid = statusCode >= 200 && statusCode < 400;
              const keywordMatched = options.keywordMatch ? bodyString.includes(options.keywordMatch) : undefined;

              const isOnline = isStatusValid && (keywordMatched === undefined || keywordMatched === true);

              resolve({
                url: targetUrl,
                finalUrl: currentUrl,
                statusCode,
                statusMessage,
                isOnline,
                responseTimeMs: Math.round(responseTimeMs),
                ttfbMs: Math.round(ttfbMs),
                dnsTimeMs: Math.max(0, Math.round(dnsTimeMs)),
                tcpTimeMs: Math.max(0, Math.round(tcpTimeMs)),
                tlsTimeMs: Math.max(0, Math.round(tlsTimeMs)),
                contentLength: totalBytes,
                contentType: (res.headers['content-type'] as string) || '',
                contentEncoding: (res.headers['content-encoding'] as string) || 'identity',
                serverHeader: (res.headers['server'] as string) || 'Hidden/Undisclosed',
                cacheControl: (res.headers['cache-control'] as string) || 'None',
                redirectCount: redirects,
                redirectChain,
                keywordMatched,
                rawBodyPreview: bodyString.slice(0, 1000),
                htmlBody: bodyString,
              });
            });

            res.on('error', (err) => {
              reject(err);
            });
          }
        );

        req.on('socket', (socket) => {
          socket.on('lookup', () => {
            timings.dns = process.hrtime.bigint();
          });
          socket.on('connect', () => {
            timings.tcp = process.hrtime.bigint();
          });
          socket.on('secureConnect', () => {
            timings.tls = process.hrtime.bigint();
          });
        });

        req.on('timeout', () => {
          req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.end();
      });

      // If we followed a redirect, loop again to fetch final page
      if (
        result.statusCode >= 300 &&
        result.statusCode < 400 &&
        result.finalUrl !== currentUrl
      ) {
        continue;
      }

      return result;
    } catch (err: any) {
      return {
        url: targetUrl,
        finalUrl: currentUrl,
        statusCode: 0,
        statusMessage: 'Connection Error',
        isOnline: false,
        responseTimeMs: 0,
        ttfbMs: 0,
        dnsTimeMs: 0,
        tcpTimeMs: 0,
        tlsTimeMs: 0,
        contentLength: 0,
        contentType: '',
        contentEncoding: '',
        serverHeader: '',
        cacheControl: '',
        redirectCount: redirects,
        redirectChain,
        error: err.message || 'Failed to connect to host',
      };
    }
  }

  return {
    url: targetUrl,
    finalUrl: currentUrl,
    statusCode: 0,
    statusMessage: 'Too Many Redirects',
    isOnline: false,
    responseTimeMs: 0,
    ttfbMs: 0,
    dnsTimeMs: 0,
    tcpTimeMs: 0,
    tlsTimeMs: 0,
    contentLength: 0,
    contentType: '',
    contentEncoding: '',
    serverHeader: '',
    cacheControl: '',
    redirectCount: redirects,
    redirectChain,
    error: `Exceeded maximum redirect limit of ${CONFIG.maxRedirects}`,
  };
}
