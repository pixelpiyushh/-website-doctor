import React, { useState } from 'react';
import { Link2, CheckCircle, XCircle, ArrowUpRight, Search, RefreshCw } from 'lucide-react';
import { apiUrl } from '../apiConfig';

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

interface BrokenLinksViewProps {
  initialUrl?: string;
  onScanUrl?: (url: string) => Promise<void>;
  isScanning?: boolean;
}

export const BrokenLinksView: React.FC<BrokenLinksViewProps> = ({
  initialUrl = 'https://example.com',
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [filter, setFilter] = useState<'all' | 'broken' | 'working' | 'redirected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<{
    totalScanned: number;
    workingCount: number;
    brokenCount: number;
    redirectedCount: number;
    links: ScannedLink[];
  } | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/scans/links'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, maxLinks: 50 }),
      });
      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else {
        alert(data.error || 'Failed to scan links');
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLinks = (report?.links || []).filter((link) => {
    if (filter !== 'all' && link.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        link.url.toLowerCase().includes(query) ||
        link.anchorText.toLowerCase().includes(query) ||
        String(link.statusCode).includes(query)
      );
    }
    return true;
  });

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="card-title">
            <Link2 size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>Broken Link Crawler & Auditor</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Audits anchors for dead links (404, 500, timeouts) with SSRF safety
          </div>
        </div>

        {/* Scan Input */}
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '8px', flex: '1 1 320px', maxWidth: '440px' }}>
          <input
            type="text"
            className="input-field"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              flex: 1,
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
            {isLoading ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
            <span>{isLoading ? 'Crawling...' : 'Scan Links'}</span>
          </button>
        </form>
      </div>

      {report && (
        <div style={{ marginTop: '16px' }}>
          {/* Summary Chips */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ padding: '8px 14px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Scanned</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{report.totalScanned}</div>
            </div>
            <div style={{ padding: '8px 14px', backgroundColor: 'var(--status-online-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Working Links</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-online)' }}>{report.workingCount}</div>
            </div>
            <div style={{ padding: '8px 14px', backgroundColor: 'var(--status-down-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Broken Links</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-down)' }}>{report.brokenCount}</div>
            </div>
            <div style={{ padding: '8px 14px', backgroundColor: 'var(--status-degraded-bg)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Redirected</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--status-degraded)' }}>{report.redirectedCount}</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'broken', 'working', 'redirected'] as const).map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '4px 10px' }}
                  onClick={() => setFilter(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search filtered links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                width: '200px',
              }}
            />
          </div>

          {/* Scanned Links Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Target URL</th>
                  <th>Anchor Text</th>
                  <th>Type</th>
                  <th>Latency</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No links match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link, idx) => (
                    <tr key={idx}>
                      <td>
                        <span
                          className={`badge ${
                            link.status === 'working'
                              ? 'badge-online'
                              : link.status === 'redirected'
                              ? 'badge-degraded'
                              : 'badge-down'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {link.statusCode || (link.error ? 'ERR' : 'DOWN')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</span>
                          <ArrowUpRight size={12} color="var(--text-muted)" />
                        </a>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        "{link.anchorText || 'N/A'}"
                      </td>
                      <td>
                        <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          {link.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {link.responseTimeMs}ms
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!report && !isLoading && (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
          Enter a URL above and click "Scan Links" to initiate an automated bounded crawl.
        </div>
      )}
    </div>
  );
};
