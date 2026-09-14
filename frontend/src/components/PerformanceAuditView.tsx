import React from 'react';
import { Zap, Clock, Image as ImageIcon, Database, Layers, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';

interface PerformanceAuditProps {
  responseTimeMs?: number;
  ttfbMs?: number;
  contentEncoding?: string;
  hasCacheControl?: boolean;
  cacheControlHeader?: string;
  totalImages?: number;
  unoptimizedImagesCount?: number;
  pageSizeKb?: number;
}

export const PerformanceAuditView: React.FC<PerformanceAuditProps> = ({
  responseTimeMs = 240,
  ttfbMs = 160,
  contentEncoding = 'gzip',
  hasCacheControl = true,
  cacheControlHeader,
  totalImages = 4,
  unoptimizedImagesCount = 1,
  pageSizeKb = 340,
}) => {
  const { language } = useLanguage();

  const isBrotliOrGzip = contentEncoding && ['gzip', 'br', 'deflate'].includes(contentEncoding.toLowerCase());
  const ttfbRating: 'pass' | 'warning' | 'fail' = ttfbMs < 200 ? 'pass' : ttfbMs < 500 ? 'warning' : 'fail';
  const compressionRating: 'pass' | 'fail' = isBrotliOrGzip ? 'pass' : 'fail';
  const cachingRating: 'pass' | 'warning' | 'fail' = hasCacheControl ? 'pass' : 'warning';
  const slowResourcesRating: 'pass' | 'warning' | 'fail' = responseTimeMs < 350 ? 'pass' : responseTimeMs < 800 ? 'warning' : 'fail';
  const imagesRating: 'pass' | 'warning' | 'fail' = unoptimizedImagesCount === 0 ? 'pass' : 'warning';

  const recommendations = [
    {
      id: 'slow_resources',
      title: language === 'hinglish' ? 'Slow Resources (Dheeme Scripts/Styles)' : 'Slow & Render-Blocking Resources',
      icon: Clock,
      status: slowResourcesRating,
      metric: `${responseTimeMs}ms total latency`,
      recommendation:
        slowResourcesRating === 'pass'
          ? (language === 'hinglish' ? 'Saare assets fast aur optimized render ho rhe hain.' : 'Resources are delivered with low network latency.')
          : (language === 'hinglish' ? 'Non-critical JavaScript ko defer karein aur CSS ko minify karein.' : 'Defer non-critical third-party scripts and minify bundle sizes to prevent render-blocking.'),
    },
    {
      id: 'large_images',
      title: language === 'hinglish' ? 'Large Images (Badi Images Ka Size)' : 'Large & Unoptimized Images',
      icon: ImageIcon,
      status: imagesRating,
      metric: `${totalImages} total images detected (~${pageSizeKb}KB)`,
      recommendation:
        imagesRating === 'pass'
          ? (language === 'hinglish' ? 'Images WebP format me properly optimized hain.' : 'Images use modern efficient formats.')
          : (language === 'hinglish' ? 'Images ko WebP/AVIF format me convert karein aur width/height tags declare karein.' : 'Convert legacy PNG/JPEG images to WebP or AVIF and specify explicit width/height attributes.'),
    },
    {
      id: 'ttfb',
      title: language === 'hinglish' ? 'TTFB (Time To First Byte - Server Speed)' : 'Time to First Byte (TTFB)',
      icon: Database,
      status: ttfbRating,
      metric: `${ttfbMs}ms TTFB (${ttfbRating === 'pass' ? 'Excellent' : 'Needs Optimization'})`,
      recommendation:
        ttfbRating === 'pass'
          ? (language === 'hinglish' ? 'Server turant response bhej rha hai (<200ms).' : 'Server response is fast and within Google Core Web Vitals threshold.')
          : (language === 'hinglish' ? 'Server database queries ko optimize karein aur CDN edge caching chalu karein.' : 'Optimize backend database queries, implement Redis/in-memory caching, and route through an Edge CDN.'),
    },
    {
      id: 'caching',
      title: language === 'hinglish' ? 'Browser Caching (Dobara Load Hone Ki Speed)' : 'Browser Caching & Expiration',
      icon: Layers,
      status: cachingRating,
      metric: cacheControlHeader ? `Cache-Control: ${cacheControlHeader.slice(0, 35)}...` : 'Cache-Control header absent',
      recommendation:
        cachingRating === 'pass'
          ? (language === 'hinglish' ? 'Browser cache rules configured hain.' : 'Static assets leverage effective browser caching.')
          : (language === 'hinglish' ? 'Static files ke liye "Cache-Control: public, max-age=31536000" header add karein.' : 'Add "Cache-Control: public, max-age=31536000, immutable" for static images, CSS, and JS assets.'),
    },
    {
      id: 'compression',
      title: language === 'hinglish' ? 'Compression (Brotli / Gzip)' : 'HTTP Compression (Brotli / Gzip)',
      icon: Zap,
      status: compressionRating,
      metric: isBrotliOrGzip ? `Active: ${contentEncoding.toUpperCase()}` : 'No HTTP compression detected',
      recommendation:
        compressionRating === 'pass'
          ? (language === 'hinglish' ? 'Brotli/Gzip compression data transfer ko 70% kam kar rha hai.' : 'Content compression is active, reducing wire payload by up to 70%.')
          : (language === 'hinglish' ? 'Web server par Gzip ya Brotli compression enable karein.' : 'Enable Brotli (br) or Gzip compression in Nginx, Apache, or your CDN configuration.'),
    },
  ];

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="card-title">
            <Zap size={18} style={{ color: '#38bdf8' }} />
            <span>{language === 'hinglish' ? 'Performance Recommendations (Raftaar Ki Salah)' : 'Performance & Speed Recommendations'}</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'hinglish'
              ? 'Slow resources, large images, TTFB, caching, aur compression ka deep clinical audit'
              : 'Granular technical speed audit targeting Core Web Vitals and load performance'}
          </div>
        </div>

        <div className="badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.78rem', fontWeight: 700 }}>
          {language === 'hinglish' ? '5 Core Speed Pillars' : '5 Core Performance Pillars'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          const isPass = rec.status === 'pass';
          const isWarn = rec.status === 'warning';
          return (
            <div
              key={rec.id}
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isPass ? 'rgba(22, 163, 74, 0.25)' : isWarn ? 'rgba(234, 179, 8, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 320px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isPass ? 'rgba(22, 163, 74, 0.15)' : isWarn ? 'rgba(234, 179, 8, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: isPass ? '#16a34a' : isWarn ? '#eab308' : 'var(--status-down)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{rec.title}</strong>
                    <span
                      style={{
                        padding: '1px 7px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: isPass ? 'rgba(22, 163, 74, 0.15)' : isWarn ? 'rgba(234, 179, 8, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: isPass ? '#16a34a' : isWarn ? '#eab308' : 'var(--status-down)',
                      }}
                    >
                      {isPass ? 'PASS' : isWarn ? 'OPTIMIZE' : 'CRITICAL'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {rec.metric}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                    {rec.recommendation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
