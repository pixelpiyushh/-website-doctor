import React, { useState } from 'react';
import { SEOReport } from '../types';
import { Search, CheckCircle2, AlertTriangle, AlertCircle, FileText, Image as ImageIcon, Share2, Check, Copy, CheckCheck, Globe, Code } from 'lucide-react';
import { useLanguage } from '../i18n';

interface SEOHealthViewProps {
  seo?: SEOReport;
}

export const SEOHealthView: React.FC<SEOHealthViewProps> = ({ seo }) => {
  const { language } = useLanguage();
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!seo) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
        No SEO audit data available. Run website diagnosis to scan SEO indicators.
      </div>
    );
  }

  // Fallback checklist if backend hasn't populated it
  const checklist = seo.checklist && seo.checklist.length > 0 ? seo.checklist : [
    {
      key: 'title',
      name: 'Meta Title',
      status: !seo.title ? 'fail' : seo.titleLength < 20 || seo.titleLength > 70 ? 'warning' : 'pass',
      detail: seo.title ? `${seo.title} (${seo.titleLength} chars)` : 'Missing <title> tag',
      recommendation: !seo.title ? 'Add a unique <title> tag between 30 and 60 characters.' : undefined,
    },
    {
      key: 'metaDescription',
      name: 'Meta Description',
      status: !seo.metaDescription ? 'fail' : seo.metaDescriptionLength < 70 || seo.metaDescriptionLength > 170 ? 'warning' : 'pass',
      detail: seo.metaDescription ? `${seo.metaDescription.slice(0, 60)}... (${seo.metaDescriptionLength} chars)` : 'Missing <meta name="description"> tag',
      recommendation: !seo.metaDescription ? 'Add a concise meta description between 120 and 160 characters.' : undefined,
    },
    {
      key: 'headings',
      name: 'Heading Hierarchy (H1/H2/H3)',
      status: seo.h1Count === 1 ? 'pass' : seo.h1Count === 0 ? 'fail' : 'warning',
      detail: `H1: ${seo.h1Count}, H2: ${seo.h2Count}, H3: ${seo.h3Count}`,
      recommendation: seo.h1Count === 0 ? 'Add exactly one primary <h1> tag.' : seo.h1Count > 1 ? 'Use only one primary <h1>.' : undefined,
    },
    {
      key: 'sitemap',
      name: 'XML Sitemap (/sitemap.xml)',
      status: seo.hasSitemap ? 'pass' : 'fail',
      detail: seo.hasSitemap ? '✓ /sitemap.xml detected' : 'No /sitemap.xml found',
      recommendation: !seo.hasSitemap ? 'Generate sitemap.xml and submit to search engines.' : undefined,
    },
    {
      key: 'robotsTxt',
      name: 'Robots.txt (/robots.txt)',
      status: seo.hasRobotsTxt ? 'pass' : 'fail',
      detail: seo.hasRobotsTxt ? '✓ /robots.txt detected' : 'No /robots.txt found',
      recommendation: !seo.hasRobotsTxt ? 'Create a robots.txt file in root directory.' : undefined,
    },
    {
      key: 'imageAlt',
      name: 'Image Alt Text',
      status: seo.imagesMissingAlt === 0 ? 'pass' : seo.imagesMissingAlt > 3 ? 'fail' : 'warning',
      detail: `${seo.totalImages - seo.imagesMissingAlt} of ${seo.totalImages} images have alt attributes`,
      recommendation: seo.imagesMissingAlt > 0 ? `Add alt="" text to ${seo.imagesMissingAlt} images.` : undefined,
    },
    {
      key: 'viewport',
      name: 'Mobile Viewport',
      status: seo.viewport ? 'pass' : 'fail',
      detail: seo.viewport ? 'Mobile viewport tag configured' : 'Missing mobile viewport tag',
      recommendation: !seo.viewport ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.' : undefined,
    },
    {
      key: 'openGraph',
      name: 'Open Graph Social Previews',
      status: seo.hasOpenGraph ? 'pass' : 'warning',
      detail: seo.hasOpenGraph ? 'og:title / og:image configured' : 'Missing Open Graph tags',
      recommendation: !seo.hasOpenGraph ? 'Add og:title, og:description, and og:image tags.' : undefined,
    },
  ];

  const passCount = checklist.filter((c) => c.status === 'pass').length;
  const scaledPoints = Math.round((seo.score / 100) * 15);

  const sampleSnippet = `<!-- Recommended Essential SEO Tags -->\n<title>${seo.title || 'Your Website Headline - Brand'}</title>\n<meta name="description" content="${seo.metaDescription || 'Concise description of your website services between 120-160 characters for high Google search CTR.'}">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<meta property="og:title" content="${seo.title || 'Your Website Title'}">\n<meta property="og:description" content="${seo.metaDescription || 'Website Description'}">\n<meta property="og:image" content="https://yourwebsite.com/og-banner.png">`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="card-title">
            <Search size={18} style={{ color: '#16a34a' }} />
            <span>{language === 'hinglish' ? 'Technical SEO & Search Engine Checklist' : 'Technical SEO & Search Engine Audit'}</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'hinglish'
              ? 'Google crawler indexability, meta tags, sitemap, aur image accessibility'
              : 'Google crawler indexability, meta tags, sitemap, heading hierarchy, and image accessibility'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            className="badge"
            style={{
              backgroundColor: scaledPoints >= 12 ? 'rgba(22, 163, 74, 0.15)' : 'rgba(192, 132, 252, 0.15)',
              color: scaledPoints >= 12 ? '#16a34a' : '#c084fc',
              border: `1px solid ${scaledPoints >= 12 ? 'rgba(22, 163, 74, 0.35)' : 'rgba(192, 132, 252, 0.35)'}`,
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            Health Score Impact: {scaledPoints} / 15 pts ({seo.score}%)
          </div>

          <div className="badge badge-info" style={{ fontSize: '0.78rem' }}>
            {passCount} / {checklist.length} Checks Passed
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '10px',
          marginTop: '16px',
        }}
      >
        {checklist.map((item) => {
          const isPass = item.status === 'pass';
          const isWarn = item.status === 'warning';
          return (
            <div
              key={item.key}
              style={{
                padding: '12px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${isPass ? 'rgba(22, 163, 74, 0.25)' : isWarn ? 'rgba(234, 179, 8, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: isPass ? 'rgba(22, 163, 74, 0.15)' : isWarn ? 'rgba(234, 179, 8, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: isPass ? '#16a34a' : isWarn ? '#eab308' : 'var(--status-down)',
                    border: `1px solid ${isPass ? 'rgba(22, 163, 74, 0.35)' : isWarn ? 'rgba(234, 179, 8, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                  }}
                >
                  {isPass ? 'PASS' : isWarn ? 'WARNING' : 'FAIL'}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.detail}
              </div>

              {item.recommendation && (
                <div style={{ fontSize: '0.74rem', color: '#38bdf8', borderTop: '1px dashed var(--border-subtle)', paddingTop: '6px', marginTop: '2px' }}>
                  💡 {item.recommendation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copyable Missing Meta Snippet */}
      {scaledPoints < 14 && (
        <div
          style={{
            marginTop: '18px',
            padding: '14px 16px',
            backgroundColor: 'rgba(192, 132, 252, 0.05)',
            border: '1px solid rgba(192, 132, 252, 0.25)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code size={15} />
              <span>{language === 'hinglish' ? 'Score Ko 15/15 Karne Ke Liye Ye Tags Add Karein:' : 'Ready-to-Paste HTML Meta Tags (Boost to 15/15):'}</span>
            </span>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopySnippet}
              style={{ padding: '3px 10px', fontSize: '0.74rem' }}
            >
              {copiedSnippet ? <CheckCheck size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
              <span>{copiedSnippet ? (language === 'hinglish' ? 'Copy Ho Gya!' : 'Copied!') : (language === 'hinglish' ? 'HTML Copy Karo' : 'Copy HTML')}</span>
            </button>
          </div>

          <pre
            style={{
              padding: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
              whiteSpace: 'pre',
            }}
          >
            {sampleSnippet}
          </pre>
        </div>
      )}
    </div>
  );
};
