import React from 'react';
import { DetectedTechnology } from '../types';
import { Cpu, Globe, Server, Layers, BarChart2, Code, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n';

interface TechnologyDetectorProps {
  technologies?: DetectedTechnology[];
  targetUrl?: string;
}

export const TechnologyDetectorView: React.FC<TechnologyDetectorProps> = ({
  technologies,
  targetUrl = 'https://example.com',
}) => {
  const { language } = useLanguage();

  const defaultTech: DetectedTechnology[] = [
    {
      name: 'Next.js',
      category: 'Framework',
      confidence: 100,
      description: 'The React Framework for the Web with Server-Side Rendering and Hybrid Static Generation.',
      websiteUrl: 'https://nextjs.org',
    },
    {
      name: 'React',
      category: 'Framework',
      confidence: 100,
      description: 'Declarative component-based JavaScript UI library.',
      websiteUrl: 'https://react.dev',
    },
    {
      name: 'Vercel Edge Network',
      category: 'CDN / Hosting',
      confidence: 100,
      description: 'Global Edge Network with serverless functions and asset edge distribution.',
      websiteUrl: 'https://vercel.com',
    },
    {
      name: 'Nginx',
      category: 'Web Server',
      confidence: 90,
      description: 'High-performance HTTP web server and reverse proxy.',
      websiteUrl: 'https://nginx.org',
    },
    {
      name: 'Tailwind CSS',
      category: 'Framework',
      confidence: 85,
      description: 'Utility-first modern CSS framework.',
      websiteUrl: 'https://tailwindcss.com',
    },
  ];

  const items = technologies && technologies.length > 0 ? technologies : defaultTech;

  // Group by category
  const categories = Array.from(new Set(items.map((t) => t.category)));

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Framework':
        return Code;
      case 'CMS':
        return Layers;
      case 'Web Server':
        return Server;
      case 'CDN / Hosting':
        return Globe;
      case 'Analytics':
        return BarChart2;
      default:
        return Cpu;
    }
  };

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="card-title">
            <Cpu size={18} style={{ color: '#c084fc' }} />
            <span>{language === 'hinglish' ? 'Website Technology Detector (Stack Jaanch)' : 'Detected Technology Stack'}</span>
          </span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {language === 'hinglish'
              ? `Underlying frameworks, CMS, servers, aur CDNs detected for ${targetUrl}`
              : `Discovered software stack, libraries, and hosting infrastructure running ${targetUrl}`}
          </div>
        </div>

        <div className="badge badge-info" style={{ fontSize: '0.78rem' }}>
          <Sparkles size={12} />
          <span>{items.length} Technologies Identified</span>
        </div>
      </div>

      {/* Grid of Technologies grouped by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
        {categories.map((cat) => {
          const CatIcon = getCategoryIcon(cat);
          const catItems = items.filter((t) => t.category === cat);

          return (
            <div key={cat}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                <CatIcon size={14} style={{ color: '#38bdf8' }} />
                <span>{cat}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {catItems.map((tech) => (
                  <div
                    key={tech.name}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px',
                      transition: 'all 200ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{tech.name}</span>
                          {tech.version && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              v{tech.version}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600, marginTop: '2px' }}>
                          {tech.category}
                        </div>
                      </div>

                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'rgba(22, 163, 74, 0.12)',
                          color: '#16a34a',
                          border: '1px solid rgba(22, 163, 74, 0.3)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                        }}
                      >
                        {tech.confidence}% Match
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {tech.description}
                    </p>

                    {tech.websiteUrl && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <a
                          href={tech.websiteUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{
                            fontSize: '0.72rem',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <span>Documentation</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
