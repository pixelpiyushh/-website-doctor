import React, { useState } from 'react';
import { FixGuideItem } from '../types';
import { X, Wrench, Copy, Check, CheckCircle2, AlertTriangle, AlertOctagon, Terminal, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n';

interface FixItGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide?: FixGuideItem | null;
}

export const FixItGuideModal: React.FC<FixItGuideModalProps> = ({
  isOpen,
  onClose,
  guide,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !guide) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityColor =
    guide.priority === 'critical' ? '#f43f5e' : guide.priority === 'important' ? '#eab308' : '#16a34a';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '640px', maxHeight: '88vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(192, 132, 252, 0.15)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wrench size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="badge"
                  style={{
                    backgroundColor: `${priorityColor}15`,
                    color: priorityColor,
                    border: `1px solid ${priorityColor}40`,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  {guide.priority === 'critical' ? '🔴 Critical' : guide.priority === 'important' ? '🟠 Important' : '🟢 Good'}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  {guide.category}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '4px' }}>
                {guide.title}
              </h3>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px' }}>
          {/* Why It Matters */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              {language === 'hinglish' ? 'Ye Problem Kyun Important Hai?' : 'Why This Matters & Root Cause'}
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {guide.problemExplanation}
            </div>
          </div>

          {/* Step by step fix instructions */}
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {language === 'hinglish' ? '🛠️ Kaise Theek Karein (Step-by-Step Fix):' : '🛠️ Step-by-Step Implementation Guide:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {guide.stepByStep.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '0.84rem',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <span style={{ color: '#c084fc', fontWeight: 700 }}>{idx + 1}.</span>
                  <span style={{ lineHeight: 1.45 }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Snippet if applicable */}
          {guide.codeSnippet && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {guide.codeSnippet.title}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopy(guide.codeSnippet!.code)}
                  style={{ fontSize: '0.74rem', padding: '2px 8px', gap: '4px' }}
                >
                  {copied ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  padding: '12px 16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#38bdf8',
                  overflowX: 'auto',
                  lineHeight: 1.5,
                }}
              >
                {guide.codeSnippet.code}
              </pre>
            </div>
          )}

          {/* Verification Tip */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(22, 163, 74, 0.08)',
              border: '1px solid rgba(22, 163, 74, 0.3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#dcfce7', lineHeight: 1.45 }}>
              <strong>Verification Tip:</strong> {guide.verificationTip}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary btn-sm" onClick={onClose} style={{ minWidth: '100px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
