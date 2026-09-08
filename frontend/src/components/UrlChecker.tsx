import React, { useState } from 'react';
import { DiagnosticAnalysisResult, Monitor } from '../types';
import { Search, Activity, Check, Loader2, AlertCircle, Plus, ArrowRight, ShieldCheck, Zap, Lock, RefreshCw } from 'lucide-react';
import { HealthScoreRing } from './HealthScoreRing';
import { SSLInspectorView } from './SSLInspectorView';
import { SecurityHeadersView } from './SecurityHeadersView';
import { SEOHealthView } from './SEOHealthView';
import { AIDoctorView } from './AIDoctorView';
import { apiUrl } from '../apiConfig';

interface UrlCheckerProps {
  initialUrl?: string;
  onAnalysisComplete?: (result: DiagnosticAnalysisResult) => void;
  onCreateMonitorFromAnalysis?: (url: string) => void;
}

export const UrlChecker: React.FC<UrlCheckerProps> = ({
  initialUrl = '',
  onAnalysisComplete,
  onCreateMonitorFromAnalysis,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ssl' | 'headers' | 'seo' | 'ai'>('overview');

  const stages = [
    'Connecting to server...',
    'Checking HTTP status & headers...',
    'Inspecting SSL/TLS certificate...',
    'Measuring network latency & TTFB...',
    'Auditing security response headers...',
    'Scanning page HTML & SEO tags...',
    'Generating AI Doctor diagnosis...',
  ];

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url || !url.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setCurrentStage(0);

    // Realistic progress stepping synced with network probe execution
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const res = await fetch(apiUrl('/api/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      clearInterval(interval);
      setCurrentStage(stages.length);

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Diagnosis failed. Please check the URL and try again.');
      }

      setResult(data);
      if (onAnalysisComplete) onAnalysisComplete(data);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'Network error encountered.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search / URL Analyzer Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-info" style={{ marginBottom: '12px' }}>
            Instant Deep Clinical Scan
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Diagnose Any Website in Seconds
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '24px' }}>
            Enter any public URL to execute live availability, SSL inspection, security header audits, and AI diagnosis.
          </p>

          {/* Form Input */}
          <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <div className="input-group" style={{ flex: 1, padding: '0 16px' }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                className="input-field"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ fontSize: '0.95rem', padding: '14px 10px' }}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || !url.trim()}
              style={{ minWidth: '140px' }}
            >
              {isLoading ? <Loader2 size={18} className="spin" /> : <Activity size={18} />}
              <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
            </button>
          </form>

          {/* Error Message Box */}
          {errorMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: 'var(--status-down-bg)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-down)',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Realistic Progress Stages */}
          {isLoading && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Analyzing {url}...
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stages.map((st, idx) => {
                  const isDone = currentStage > idx;
                  const isCurrent = currentStage === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.82rem',
                        color: isDone ? 'var(--status-online)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}
                    >
                      {isDone ? (
                        <Check size={14} strokeWidth={3} />
                      ) : isCurrent ? (
                        <Loader2 size={14} className="spin" style={{ color: 'var(--accent-primary)' }} />
                      ) : (
                        <span style={{ width: '14px', height: '14px', display: 'inline-block' }} />
                      )}
                      <span>{st}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Result Banner */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  className={`badge ${result.probe.isOnline ? 'badge-online' : 'badge-down'}`}
                  style={{ fontSize: '0.82rem' }}
                >
                  <span className="pulse-dot" />
                  {result.probe.isOnline ? 'ONLINE' : 'DOWN'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {result.url}
                </h3>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Server: {result.probe.serverHeader} • Analyzed at {new Date(result.analyzedAt).toLocaleTimeString()}
              </div>
            </div>

            {onCreateMonitorFromAnalysis && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onCreateMonitorFromAnalysis(result.url)}
              >
                <Plus size={14} />
                <span>Add to 24/7 Monitors</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid-4">
            <div className="stat-card">
              <div className="stat-card-title">HTTP Status</div>
              <div className="stat-card-value" style={{ color: result.probe.isOnline ? 'var(--status-online)' : 'var(--status-down)' }}>
                {result.probe.statusCode}
                <span className="stat-card-unit">{result.probe.statusMessage}</span>
              </div>
              <div className="stat-card-footer">
                Redirects: {result.probe.redirectCount}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Response Time</div>
              <div className="stat-card-value">
                {result.probe.responseTimeMs}
                <span className="stat-card-unit">ms</span>
              </div>
              <div className="stat-card-footer">
                TTFB: {result.probe.ttfbMs}ms • DNS: {result.probe.dnsTimeMs}ms
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">SSL Status</div>
              <div className="stat-card-value" style={{ fontSize: '1.4rem', color: result.ssl.status === 'valid' ? 'var(--status-online)' : 'var(--status-degraded)' }}>
                {result.ssl.status === 'valid' ? 'Valid' : result.ssl.statusText}
              </div>
              <div className="stat-card-footer">
                {result.ssl.daysRemaining} days left • {result.ssl.issuer}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-title">Health Score</div>
              <div className="stat-card-value" style={{ color: 'var(--accent-primary)' }}>
                {result.healthScore.overallScore}
                <span className="stat-card-unit">/ 100</span>
              </div>
              <div className="stat-card-footer">
                Grade {result.healthScore.grade}
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
            <button
              className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overall Diagnosis
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ai' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('ai')}
            >
              AI Doctor
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ssl' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('ssl')}
            >
              SSL / TLS
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'headers' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('headers')}
            >
              Security Headers
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'seo' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveTab('seo')}
            >
              SEO Health
            </button>
          </div>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid-2">
                <HealthScoreRing scoreData={result.healthScore} />
                <SSLInspectorView ssl={result.ssl} />
              </div>
              <AIDoctorView diagnosis={result.aiDiagnosis} targetUrl={result.url} />
            </div>
          )}

          {activeTab === 'ai' && (
            <AIDoctorView
              diagnosis={result.aiDiagnosis}
              targetUrl={result.url}
              onRefreshDiagnosis={handleAnalyze}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'ssl' && <SSLInspectorView ssl={result.ssl} />}
          {activeTab === 'headers' && <SecurityHeadersView report={result.securityHeaders} />}
          {activeTab === 'seo' && <SEOHealthView seo={result.seo} />}
        </div>
      )}
    </div>
  );
};
