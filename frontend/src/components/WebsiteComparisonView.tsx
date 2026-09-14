import React, { useState } from 'react';
import { Search, Crown, Activity, ShieldCheck, Zap, Lock, Globe, ArrowRight, Loader2, RefreshCw, Trophy } from 'lucide-react';
import { apiUrl } from '../apiConfig';
import { useLanguage } from '../i18n';

interface ComparisonData {
  siteA: {
    url: string;
    isOnline: boolean;
    statusCode: number;
    overallScore: number;
    grade: string;
    responseTimeMs: number;
    ttfbMs: number;
    sslDaysRemaining: number;
    sslValid: boolean;
    seoScore: number;
    securityScore: number;
    technologiesCount: number;
    technologies?: any[];
  };
  siteB: {
    url: string;
    isOnline: boolean;
    statusCode: number;
    overallScore: number;
    grade: string;
    responseTimeMs: number;
    ttfbMs: number;
    sslDaysRemaining: number;
    sslValid: boolean;
    seoScore: number;
    securityScore: number;
    technologiesCount: number;
    technologies?: any[];
  };
  winner: 'A' | 'B';
  scoreDiff: number;
}

export const WebsiteComparisonView: React.FC<{ initialUrlA?: string }> = ({
  initialUrlA = 'https://example.com',
}) => {
  const { language } = useLanguage();
  const [urlA, setUrlA] = useState(initialUrlA);
  const [urlB, setUrlB] = useState('https://google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comparison, setComparison] = useState<ComparisonData | null>({
    siteA: {
      url: initialUrlA,
      isOnline: true,
      statusCode: 200,
      overallScore: 74,
      grade: 'B',
      responseTimeMs: 240,
      ttfbMs: 160,
      sslDaysRemaining: 180,
      sslValid: true,
      seoScore: 68,
      securityScore: 65,
      technologiesCount: 4,
    },
    siteB: {
      url: 'https://google.com',
      isOnline: true,
      statusCode: 200,
      overallScore: 94,
      grade: 'A+',
      responseTimeMs: 78,
      ttfbMs: 52,
      sslDaysRemaining: 74,
      sslValid: true,
      seoScore: 95,
      securityScore: 92,
      technologiesCount: 6,
    },
    winner: 'B',
    scoreDiff: 20,
  });

  const handleCompare = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlA.trim() || !urlB.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/compare'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlA, urlB }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Comparison probe failed.');
      }
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Failed to compare URLs. Please verify targets.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Search / URL Inputs Form */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              {language === 'hinglish' ? 'Website Comparison (Aamne-Saamne Muqabla) 🆚' : 'Head-to-Head Website Comparison 🆚'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '2px' }}>
              {language === 'hinglish'
                ? 'Do websites enter karein aur performance, SEO, security aur overall score compare karein'
                : 'Compare two domain endpoints side-by-side across latency, security headers, SSL health, and SEO readiness'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCompare} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
          <div className="input-group" style={{ flex: '1 1 260px', padding: '0 14px' }}>
            <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700 }}>Site 1:</span>
            <input
              type="text"
              className="input-field"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="https://site-a.com"
              style={{ fontSize: '0.9rem', padding: '12px 8px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>VS</span>
          </div>

          <div className="input-group" style={{ flex: '1 1 260px', padding: '0 14px' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700 }}>Site 2:</span>
            <input
              type="text"
              className="input-field"
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="https://site-b.com"
              style={{ fontSize: '0.9rem', padding: '12px 8px' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ minWidth: '150px' }}>
            {isLoading ? <Loader2 size={16} className="spin" /> : <Activity size={16} />}
            <span>{isLoading ? 'Comparing...' : 'Compare Sites'}</span>
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '12px', padding: '10px 14px', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem' }}>
            {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Winner Headline Banner */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12) 0%, rgba(56, 189, 248, 0.12) 100%)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(234, 179, 8, 0.4)',
                }}
              >
                <Trophy size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Overall Comparison Winner
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {comparison.winner === 'A' ? comparison.siteA.url : comparison.siteB.url} leads by +{comparison.scoreDiff} points! 👑
                </div>
              </div>
            </div>

            <div className="badge badge-online" style={{ fontSize: '0.84rem', padding: '6px 14px' }}>
              {comparison.winner === 'A' ? `${comparison.siteA.overallScore} vs ${comparison.siteB.overallScore}` : `${comparison.siteB.overallScore} vs ${comparison.siteA.overallScore}`} Health Score
            </div>
          </div>

          {/* Side by side cards */}
          <div className="grid-2">
            {/* Site A Card */}
            <div
              className="card"
              style={{
                borderColor: comparison.winner === 'A' ? 'rgba(22, 163, 74, 0.5)' : 'var(--border-subtle)',
                position: 'relative',
              }}
            >
              {comparison.winner === 'A' && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Crown size={16} /> Winner
                </div>
              )}
              <div style={{ fontSize: '0.74rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>Site 1</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', margin: '4px 0 14px' }}>
                {comparison.siteA.url}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800, color: comparison.siteA.overallScore >= 80 ? '#16a34a' : '#c084fc', fontFamily: 'var(--font-display)' }}>
                  {comparison.siteA.overallScore}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100 (Grade {comparison.siteA.grade})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Response Latency</span>
                  <strong style={{ color: '#38bdf8' }}>{comparison.siteA.responseTimeMs}ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>TTFB (Server Speed)</span>
                  <strong>{comparison.siteA.ttfbMs}ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SEO Score</span>
                  <strong style={{ color: comparison.siteA.seoScore >= 80 ? '#16a34a' : 'inherit' }}>{comparison.siteA.seoScore}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security Headers</span>
                  <strong style={{ color: comparison.siteA.securityScore >= 80 ? '#16a34a' : 'inherit' }}>{comparison.siteA.securityScore}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SSL Certificate</span>
                  <span style={{ color: '#16a34a' }}>✓ Valid ({comparison.siteA.sslDaysRemaining}d left)</span>
                </div>
              </div>
            </div>

            {/* Site B Card */}
            <div
              className="card"
              style={{
                borderColor: comparison.winner === 'B' ? 'rgba(22, 163, 74, 0.5)' : 'var(--border-subtle)',
                position: 'relative',
              }}
            >
              {comparison.winner === 'B' && (
                <div style={{ position: 'absolute', top: '14px', right: '14px', color: '#eab308', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <Crown size={16} /> Winner
                </div>
              )}
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>Site 2</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)', margin: '4px 0 14px' }}>
                {comparison.siteB.url}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2.6rem', fontWeight: 800, color: comparison.siteB.overallScore >= 80 ? '#16a34a' : '#c084fc', fontFamily: 'var(--font-display)' }}>
                  {comparison.siteB.overallScore}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100 (Grade {comparison.siteB.grade})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Response Latency</span>
                  <strong style={{ color: '#38bdf8' }}>{comparison.siteB.responseTimeMs}ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>TTFB (Server Speed)</span>
                  <strong>{comparison.siteB.ttfbMs}ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SEO Score</span>
                  <strong style={{ color: comparison.siteB.seoScore >= 80 ? '#16a34a' : 'inherit' }}>{comparison.siteB.seoScore}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security Headers</span>
                  <strong style={{ color: comparison.siteB.securityScore >= 80 ? '#16a34a' : 'inherit' }}>{comparison.siteB.securityScore}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SSL Certificate</span>
                  <span style={{ color: '#16a34a' }}>✓ Valid ({comparison.siteB.sslDaysRemaining}d left)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
