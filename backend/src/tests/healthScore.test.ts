import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '../services/healthScore.js';
import { analyzeSecurityHeaders } from '../services/securityHeaders.js';

describe('Website Health Score Calculation Engine', () => {
  it('should compute high score for fully optimal website', () => {
    const probe = {
      url: 'https://example.com',
      finalUrl: 'https://example.com',
      statusCode: 200,
      statusMessage: 'OK',
      isOnline: true,
      responseTimeMs: 140,
      ttfbMs: 100,
      dnsTimeMs: 20,
      tcpTimeMs: 15,
      tlsTimeMs: 25,
      contentLength: 4500,
      contentType: 'text/html',
      contentEncoding: 'gzip',
      serverHeader: 'Cloudflare',
      cacheControl: 'public, max-age=3600',
      redirectCount: 0,
      redirectChain: [],
    };

    const ssl = {
      hasSsl: true,
      status: 'valid' as const,
      statusText: 'SSL Certificate Valid',
      issuer: 'Let\'s Encrypt Authority',
      subject: 'example.com',
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      daysRemaining: 180,
      protocol: 'TLSv1.3',
      cipherName: 'TLS_AES_256_GCM_SHA384',
      subjectAltNames: ['example.com'],
      httpToHttpsRedirect: true,
    };

    const securityHeaders = {
      headers: [],
      score: 100,
      presentCount: 6,
      totalEvaluated: 6,
    };

    const seo = {
      score: 95,
      titleLength: 35,
      metaDescriptionLength: 140,
      h1Count: 1,
      h1Texts: ['Welcome'],
      h2Count: 4,
      h3Count: 2,
      totalImages: 3,
      imagesMissingAlt: 0,
      hasOpenGraph: true,
      hasSitemap: true,
      hasRobotsTxt: true,
      issues: [],
    };

    const result = calculateHealthScore({
      probe,
      ssl,
      securityHeaders,
      seo,
      hasValidDns: true,
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(['A', 'A+']).toContain(result.grade);
    expect(result.breakdown.availability.score).toBe(30);
    expect(result.breakdown.security.score).toBeGreaterThanOrEqual(18);
  });

  it('should downgrade score when website is down (HTTP 500)', () => {
    const probe = {
      url: 'https://broken.example.com',
      finalUrl: 'https://broken.example.com',
      statusCode: 500,
      statusMessage: 'Internal Server Error',
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
      redirectCount: 0,
      redirectChain: [],
    };

    const ssl = {
      hasSsl: false,
      status: 'none' as const,
      statusText: 'No SSL',
      issuer: 'None',
      subject: 'None',
      validFrom: '',
      validTo: '',
      daysRemaining: 0,
      protocol: '',
      cipherName: '',
      subjectAltNames: [],
      httpToHttpsRedirect: false,
    };

    const securityHeaders = analyzeSecurityHeaders({});

    const result = calculateHealthScore({
      probe,
      ssl,
      securityHeaders,
      hasValidDns: false,
    });

    expect(result.breakdown.availability.score).toBe(0);
    expect(result.overallScore).toBeLessThan(40);
  });
});
