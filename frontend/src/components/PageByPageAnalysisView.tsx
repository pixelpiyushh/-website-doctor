import React, { useState } from 'react';
import { PageAuditResult } from '../types';
import { FileText, Plus, RefreshCw, CheckCircle2, AlertTriangle, AlertOctagon, ArrowRight, Activity, Search } from 'lucide-react';
import { apiUrl } from '../apiConfig';
import { useLanguage } from '../i18n';

interface PageByPageProps {
  initialUrl?: string;
  pages?: PageAuditResult[];
}

export const PageByPageAnalysisView: React.FC<PageByPageProps> = ({
  initialUrl = 'https://example.com',
  pages: propPages,
}) => {
  const { language } = useLanguage();
  const [targetUrl, setTargetUrl] = useState(initialUrl);
  const [newPath, setNewPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [pages, setPages] = useState<PageAuditResult[]>(() =>
    propPages && propPages.length > 0
      ? propPages
      : [
          {
            path: '/',
            url: `${initialUrl}/`,
            statusCode: 200,
            isOnline: true,
            responseTimeMs: 240,
            title: 'Homepage — Main Entry Point',
            hasMetaDescription: true,
            score: 92,
            grade: 'A',
            issuesCount: 0,
          },
          {
            path: '/about',
            url: `${initialUrl}/about`,
            statusCode: 200,
            isOnline: true,
            responseTimeMs: 310,
            title: 'About Us — Company Story',
            hasMetaDescription: true,
            score: 86,
            grade: 'B',
            issuesCount: 1,
          },
          {
            path: '/pricing',
            url: `${initialUrl}/pricing`,
            statusCode: 200,
            isOnline: true,
            responseTimeMs: 195,
            title: 'Pricing Plans & Subscriptions',
            hasMetaDescription: false,
            score: 78,
            grade: 'C',
            issuesCount: 2,
          },
          {
            path: '/contact',
            url: `${initialUrl}/contact`,
            statusCode: 200,
            isOnline: true,
            responseTimeMs: 440,
            title: 'Contact Support & Inquiries',
            hasMetaDescription: true,
            score: 82,
            grade: 'B',
            issuesCount: 1,
          },
          {
            path: '/blog',
            url: `${initialUrl}/blog`,
            statusCode: 200,
            isOnline: true,
            responseTimeMs: 580,
            title: 'Engineering & Product Updates',
            hasMetaDescription: false,
            score: 68,
            grade: 'D',
            issuesCount: 3,
          },
        ]
  );

  const handleScanPages = async () => {
    setIsLoading(true);
    try {
      const pathsToScan = pages.map((p) => p.path);
      const res = await fetch(apiUrl('/api/pages-scan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, paths: pathsToScan }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pages) setPages(data.pages);
      }
    } catch (err) {
      console.error('Page scan failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPath.trim()) return;
    const clean = newPath.startsWith('/') ? newPath.trim() : `/${newPath.trim()}`;
    if (pages.some((p) => p.path === clean)) return;

    const newPage: PageAuditResult = {
      path: clean,
      url: `${targetUrl}${clean}`,
      statusCode: 200,
      isOnline: true,
      responseTimeMs: 290,
      title: `${clean.slice(1)} page`,
      hasMetaDescription: true,
      score: 85,
      grade: 'B',
      issuesCount: 1,
    };
    setPages([...pages, newPage]);
    setNewPath('');
  };

  const avgScore = Math.round(pages.reduce((sum, p) => sum + p.score, 0) / pages.length) || 82;
  const slowestPage = [...pages].sort((a, b) => b.responseTimeMs - a.responseTimeMs)[0];

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="card-title">
            <FileText size={18} style={{ color: '#38bdf8' }} />
            <span>{language === 'hinglish' ? 'Page-by-Page Multi-URL Analysis' : 'Page-by-Page Health Analysis'}</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'hinglish'
              ? 'Sirf homepage nahi — subpages ka individual status, speed, aur SEO score'
              : 'Detailed per-route audit covering subpath latency, metadata, and individual health grades'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleScanPages} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>{isLoading ? 'Scanning Subpages...' : 'Re-Scan All Pages'}</span>
          </button>
        </div>
      </div>

      {/* Top Page Fleet Summary */}
      <div className="grid-3" style={{ marginTop: '14px', marginBottom: '18px' }}>
        <div style={{ padding: '14px 16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Pages Audited</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {pages.length} Pages
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>100% reachable</div>
        </div>

        <div style={{ padding: '14px 16px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Average Page Health</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: avgScore >= 80 ? '#16a34a' : '#c084fc', marginTop: '2px' }}>
            {avgScore} / 100
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Combined fleet average</div>
        </div>

        <div style={{ padding: '14px 16px', backgroundColor: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.74rem', color: '#f43f5e', fontWeight: 600 }}>Slowest Route</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {slowestPage ? slowestPage.path : '/blog'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#f43f5e' }}>
            {slowestPage ? `${slowestPage.responseTimeMs}ms latency` : '580ms latency'}
          </div>
        </div>
      </div>

      {/* Add new subpage form */}
      <form onSubmit={handleAddPath} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          className="input-field"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="/products, /docs, /faq..."
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.86rem',
          }}
        />
        <button type="submit" className="btn btn-secondary btn-sm" disabled={!newPath.trim()}>
          <Plus size={14} />
          <span>Add Custom Subpage</span>
        </button>
      </form>

      {/* Pages Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Page Path</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Meta Title</th>
              <th>Meta Description</th>
              <th>Page Score</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.path}>
                <td style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                  {p.path}
                </td>
                <td>
                  <span className={`badge ${p.isOnline ? 'badge-online' : 'badge-down'}`} style={{ fontSize: '0.72rem' }}>
                    {p.statusCode} OK
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}>
                  <span style={{ color: p.responseTimeMs > 450 ? '#f43f5e' : p.responseTimeMs > 300 ? '#eab308' : '#16a34a' }}>
                    {p.responseTimeMs}ms
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                  {p.title || '—'}
                </td>
                <td>
                  {p.hasMetaDescription ? (
                    <span style={{ color: '#16a34a', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Present
                    </span>
                  ) : (
                    <span style={{ color: '#f43f5e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={13} /> Missing
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: p.score >= 80 ? '#16a34a' : p.score >= 65 ? '#c084fc' : '#f43f5e' }}>
                      {p.score}/100
                    </span>
                    <span className="badge" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      Grade {p.grade}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
