import React from 'react';
import { SEOReport } from '../types';
import { Search, CheckCircle2, AlertTriangle, AlertCircle, FileText, Image as ImageIcon, Share2 } from 'lucide-react';

interface SEOHealthViewProps {
  seo?: SEOReport;
}

export const SEOHealthView: React.FC<SEOHealthViewProps> = ({ seo }) => {
  if (!seo) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
        No SEO audit data available. Run website diagnosis to scan SEO indicators.
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <span className="card-title">
            <Search size={18} style={{ color: 'var(--status-online)' }} />
            <span>Technical SEO & Meta Diagnostics</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Search engine indexability, semantic structure, and social sharing tags
          </div>
        </div>

        <div className="badge badge-online" style={{ fontSize: '0.8rem' }}>
          SEO Score: {seo.score} / 100
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '12px' }}>
        {/* Core Metadata Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Title */}
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Page Title</span>
              <span>{seo.titleLength} chars</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: seo.title ? 'var(--text-primary)' : 'var(--status-down)', marginTop: '2px' }}>
              {seo.title || 'Missing <title> tag'}
            </div>
          </div>

          {/* Meta Description */}
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>Meta Description</span>
              <span>{seo.metaDescriptionLength} chars</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: seo.metaDescription ? 'var(--text-secondary)' : 'var(--status-down)', marginTop: '2px', lineHeight: 1.4 }}>
              {seo.metaDescription || 'Missing <meta name="description"> tag'}
            </div>
          </div>

          {/* Heading Structure */}
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Heading Hierarchy</div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.84rem' }}>
              <span>&lt;h1&gt;: <strong style={{ color: seo.h1Count === 1 ? 'var(--status-online)' : 'var(--status-degraded)' }}>{seo.h1Count}</strong></span>
              <span>&lt;h2&gt;: <strong>{seo.h2Count}</strong></span>
              <span>&lt;h3&gt;: <strong>{seo.h3Count}</strong></span>
            </div>
            {seo.h1Texts && seo.h1Texts.length > 0 && (
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Primary H1: "{seo.h1Texts[0]}"
              </div>
            )}
          </div>
        </div>

        {/* Indexability & Assets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Sitemap & Robots */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>XML Sitemap</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: seo.hasSitemap ? 'var(--status-online)' : 'var(--text-muted)', marginTop: '2px' }}>
                {seo.hasSitemap ? '✓ /sitemap.xml found' : 'Not detected'}
              </div>
            </div>
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Robots.txt</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: seo.hasRobotsTxt ? 'var(--status-online)' : 'var(--text-muted)', marginTop: '2px' }}>
                {seo.hasRobotsTxt ? '✓ /robots.txt found' : 'Not detected'}
              </div>
            </div>
          </div>

          {/* Image Alt Attributes */}
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ImageIcon size={13} />
                Image Accessibility
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                {seo.totalImages - seo.imagesMissingAlt} of {seo.totalImages} with Alt Text
              </span>
            </div>
            <div style={{ height: '5px', backgroundColor: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', marginTop: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: seo.totalImages > 0 ? `${((seo.totalImages - seo.imagesMissingAlt) / seo.totalImages) * 100}%` : '100%',
                  backgroundColor: seo.imagesMissingAlt === 0 ? 'var(--status-online)' : 'var(--status-degraded)',
                }}
              />
            </div>
          </div>

          {/* OpenGraph Social Card Preview */}
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Share2 size={13} />
              Open Graph Metadata
            </div>
            <div style={{ fontSize: '0.84rem' }}>
              {seo.hasOpenGraph ? (
                <span style={{ color: 'var(--status-online)', fontWeight: 600 }}>
                  ✓ Social tags active (og:title: "{seo.ogTitle || 'Set'}")
                </span>
              ) : (
                <span style={{ color: 'var(--status-degraded)' }}>
                  ⚠ No Open Graph tags found (previews will fallback to default browser scrape)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations list */}
      {seo.issues && seo.issues.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Actionable SEO Recommendations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {seo.issues.map((iss, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.8rem',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {iss.type === 'critical' ? (
                  <AlertCircle size={14} style={{ color: 'var(--status-down)', marginTop: '2px', flexShrink: 0 }} />
                ) : (
                  <AlertTriangle size={14} style={{ color: 'var(--status-degraded)', marginTop: '2px', flexShrink: 0 }} />
                )}
                <div>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{iss.message} </span>
                  <span style={{ color: 'var(--text-muted)' }}>— {iss.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
