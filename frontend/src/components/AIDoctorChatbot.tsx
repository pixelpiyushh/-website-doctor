import React, { useState, useRef, useEffect } from 'react';
import { DiagnosticAnalysisResult, ChatMessage } from '../types';
import { Bot, Send, User, Sparkles, Loader2, ArrowRight, RefreshCw, HelpCircle } from 'lucide-react';
import { apiUrl } from '../apiConfig';
import { useLanguage } from '../i18n';

interface AIDoctorChatbotProps {
  siteResult?: DiagnosticAnalysisResult | null;
  targetUrl?: string;
  onNavigateTab?: (tab: string) => void;
}

export const AIDoctorChatbot: React.FC<AIDoctorChatbotProps> = ({
  siteResult,
  targetUrl = 'https://example.com',
  onNavigateTab,
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'doctor',
      text:
        language === 'hinglish'
          ? `Namaste! Main hoon aapka AI Website Doctor. 🩺\n\nMujhse aap apni website (${siteResult?.url || targetUrl}) ke health score, speed, SEO, ya security ke baare mein koi bhi sawaal pooch sakte hain.`
          : `Hello! I am your AI Website Doctor. 🩺\n\nAsk me anything about your website's (${siteResult?.url || targetUrl}) health score, latency bottlenecks, SEO checklist, or security configuration.`,
      timestamp: new Date().toLocaleTimeString(),
      suggestedPrompts: [
        language === 'hinglish' ? 'Meri website slow kyun hai?' : 'Why is my website slow?',
        language === 'hinglish' ? 'SEO score kaise badhaye?' : 'How to improve SEO score?',
        language === 'hinglish' ? 'Score 90+ kaise le jayein?' : 'How to reach 90+ score?',
        language === 'hinglish' ? 'Security headers kaise config karein?' : 'How to fix security headers?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          siteContext: siteResult || {
            url: targetUrl,
            healthScore: { overallScore: 74 },
            probe: { responseTimeMs: 240, ttfbMs: 160 },
            ssl: { daysRemaining: 180 },
          },
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const docMsg: ChatMessage = {
          id: `doc_${Date.now()}`,
          sender: 'doctor',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString(),
          suggestedPrompts: data.suggestedPrompts,
          actionType: data.actionType,
        };
        setMessages((prev) => [...prev, docMsg]);
      } else {
        throw new Error('Doctor server response delayed');
      }
    } catch {
      // Offline fallback heuristic response
      const fallbackReply =
        language === 'hinglish'
          ? `🩺 **AI Doctor Prescribed Note for ${siteResult?.url || targetUrl}:**\n\nAapki website ka overall health score **${siteResult?.healthScore?.overallScore || 74}/100** hai. Speed aur SEO ko boost karne ke liye static assets par caching aur meta tags update karein.`
          : `🩺 **AI Doctor Clinical Note for ${siteResult?.url || targetUrl}:**\n\nCurrent health score is evaluated at **${siteResult?.healthScore?.overallScore || 74}/100**. For optimal Core Web Vitals, defer non-critical JavaScript and declare viewport tags.`;

      const docMsg: ChatMessage = {
        id: `doc_${Date.now()}`,
        sender: 'doctor',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, docMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '560px',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(192, 132, 252, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Chat Top Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c084fc 0%, #38bdf8 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              AI Doctor Assistant 🤖
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Context: <strong style={{ color: '#38bdf8' }}>{siteResult?.url || targetUrl}</strong> ({siteResult?.healthScore?.overallScore || 74}/100)
            </div>
          </div>
        </div>

        <div className="badge badge-online" style={{ fontSize: '0.72rem' }}>
          <span className="pulse-dot" style={{ backgroundColor: '#16a34a' }} />
          Online
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((m) => {
          const isDoc = m.sender === 'doctor';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                flexDirection: isDoc ? 'row' : 'row-reverse',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isDoc ? 'rgba(192, 132, 252, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: isDoc ? '#c084fc' : '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {isDoc ? <Bot size={15} /> : <User size={15} />}
              </div>

              <div style={{ maxWidth: '82%' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    borderTopLeftRadius: isDoc ? '2px' : 'var(--radius-lg)',
                    borderTopRightRadius: isDoc ? 'var(--radius-lg)' : '2px',
                    backgroundColor: isDoc ? 'rgba(255, 255, 255, 0.03)' : 'rgba(192, 132, 252, 0.15)',
                    border: `1px solid ${isDoc ? 'var(--border-subtle)' : 'rgba(192, 132, 252, 0.35)'}`,
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>

                {/* Optional Jump Action Button */}
                {isDoc && m.actionType && onNavigateTab && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', fontSize: '0.74rem', padding: '3px 10px' }}
                    onClick={() => {
                      if (m.actionType === 'view_perf') onNavigateTab('perf');
                      else if (m.actionType === 'view_seo') onNavigateTab('seo');
                      else if (m.actionType === 'view_security') onNavigateTab('headers');
                      else if (m.actionType === 'view_ssl') onNavigateTab('ssl');
                    }}
                  >
                    <span>View In-Depth Audit Details →</span>
                  </button>
                )}

                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    textAlign: isDoc ? 'left' : 'right',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Loader2 size={16} className="spin" style={{ color: '#c084fc' }} />
            <span>AI Doctor is analyzing report data...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      {messages[messages.length - 1]?.suggestedPrompts && (
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}
        >
          {messages[messages.length - 1].suggestedPrompts?.map((chip, idx) => (
            <button
              key={idx}
              className="btn btn-ghost btn-sm"
              onClick={() => handleSendMessage(chip)}
              style={{
                fontSize: '0.74rem',
                whiteSpace: 'nowrap',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                color: '#c084fc',
              }}
            >
              <Sparkles size={11} />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          gap: '8px',
        }}
      >
        <input
          type="text"
          className="input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'hinglish'
              ? 'Poochiye: "Meri website slow kyun hai?", "SEO kaise badhaye?"...'
              : 'Ask: "Why is my website slow?", "How to improve SEO?"...'
          }
          style={{
            flex: 1,
            padding: '10px 14px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
          }}
        />

        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!input.trim() || isTyping}
          style={{ minWidth: '44px', padding: '0 14px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
