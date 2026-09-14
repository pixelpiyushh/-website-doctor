export interface DetectedTechnology {
  name: string;
  category: 'CMS' | 'Framework' | 'Web Server' | 'CDN / Hosting' | 'Analytics' | 'Programming Language' | 'Database' | 'Security';
  icon?: string;
  confidence: number;
  version?: string;
  description: string;
  websiteUrl?: string;
}

/**
 * Analyzes HTML markup, scripts, and HTTP response headers to detect underlying technologies.
 */
export function detectTechnologies(
  html: string = '',
  headers: Record<string, any> = {},
  targetUrl: string = ''
): DetectedTechnology[] {
  const detected: DetectedTechnology[] = [];
  const lowerHtml = html.toLowerCase();
  const headerKeys = Object.keys(headers).reduce((acc, k) => {
    acc[k.toLowerCase()] = String(headers[k] || '').toLowerCase();
    return acc;
  }, {} as Record<string, string>);

  const serverHeader = headerKeys['server'] || '';
  const xPoweredBy = headerKeys['x-powered-by'] || '';
  const viaHeader = headerKeys['via'] || '';

  // 1. Frameworks & Libraries
  if (lowerHtml.includes('__next_data__') || lowerHtml.includes('/_next/static') || xPoweredBy.includes('next.js')) {
    detected.push({
      name: 'Next.js',
      category: 'Framework',
      confidence: 100,
      description: 'The React Framework for the Web with Server-Side Rendering and Hybrid Static Generation.',
      websiteUrl: 'https://nextjs.org',
    });
    if (!detected.some((d) => d.name === 'React')) {
      detected.push({
        name: 'React',
        category: 'Framework',
        confidence: 100,
        description: 'Component-based JavaScript library for building dynamic user interfaces.',
        websiteUrl: 'https://react.dev',
      });
    }
  } else if (
    lowerHtml.includes('react') ||
    lowerHtml.includes('data-reactroot') ||
    lowerHtml.includes('_reactlistening') ||
    lowerHtml.includes('react-dom')
  ) {
    detected.push({
      name: 'React',
      category: 'Framework',
      confidence: 90,
      description: 'Declarative component-based JavaScript UI library.',
      websiteUrl: 'https://react.dev',
    });
  }

  if (lowerHtml.includes('vue') || lowerHtml.includes('data-v-') || lowerHtml.includes('__vue_app__')) {
    detected.push({
      name: 'Vue.js',
      category: 'Framework',
      confidence: 95,
      description: 'Progressive JavaScript framework for building web interfaces.',
      websiteUrl: 'https://vuejs.org',
    });
  }

  if (lowerHtml.includes('ng-version') || lowerHtml.includes('<app-root>') || lowerHtml.includes('ng-binding')) {
    detected.push({
      name: 'Angular',
      category: 'Framework',
      confidence: 95,
      description: 'Enterprise web application framework developed by Google.',
      websiteUrl: 'https://angular.dev',
    });
  }

  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    detected.push({
      name: 'jQuery',
      category: 'Framework',
      confidence: 85,
      description: 'Fast, small, and feature-rich legacy JavaScript library.',
      websiteUrl: 'https://jquery.com',
    });
  }

  if (lowerHtml.includes('tailwind') || lowerHtml.includes('tailwindcss') || lowerHtml.includes('class="flex ') || lowerHtml.includes('class="grid ')) {
    detected.push({
      name: 'Tailwind CSS',
      category: 'Framework',
      confidence: 80,
      description: 'Utility-first CSS framework for rapid UI styling.',
      websiteUrl: 'https://tailwindcss.com',
    });
  }

  if (lowerHtml.includes('bootstrap') || lowerHtml.includes('bootstrap.min.css')) {
    detected.push({
      name: 'Bootstrap',
      category: 'Framework',
      confidence: 90,
      description: 'Responsive frontend component framework for mobile-first web pages.',
      websiteUrl: 'https://getbootstrap.com',
    });
  }

  // 2. CMS (Content Management Systems)
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes') || lowerHtml.includes('name="generator" content="wordpress')) {
    detected.push({
      name: 'WordPress',
      category: 'CMS',
      confidence: 100,
      description: 'Open-source Content Management System powering over 40% of the web.',
      websiteUrl: 'https://wordpress.org',
    });
    if (!detected.some((d) => d.name === 'PHP')) {
      detected.push({
        name: 'PHP',
        category: 'Programming Language',
        confidence: 95,
        description: 'Server-side scripting language driving WordPress dynamic execution.',
        websiteUrl: 'https://php.net',
      });
    }
  }

  if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify.theme')) {
    detected.push({
      name: 'Shopify',
      category: 'CMS',
      confidence: 100,
      description: 'All-in-one cloud commerce platform for online retail.',
      websiteUrl: 'https://shopify.com',
    });
  }

  if (lowerHtml.includes('wix.com') || lowerHtml.includes('static.wixstatic.com')) {
    detected.push({
      name: 'Wix',
      category: 'CMS',
      confidence: 100,
      description: 'Cloud-based website builder platform.',
      websiteUrl: 'https://wix.com',
    });
  }

  if (lowerHtml.includes('webflow.com') || lowerHtml.includes('data-wf-page')) {
    detected.push({
      name: 'Webflow',
      category: 'CMS',
      confidence: 100,
      description: 'Visual web development platform for responsive websites.',
      websiteUrl: 'https://webflow.com',
    });
  }

  // 3. Web Servers & Infrastructure
  if (serverHeader.includes('nginx')) {
    detected.push({
      name: 'Nginx',
      category: 'Web Server',
      confidence: 100,
      description: 'High-performance HTTP server, reverse proxy, and load balancer.',
      websiteUrl: 'https://nginx.org',
    });
  } else if (serverHeader.includes('apache')) {
    detected.push({
      name: 'Apache HTTP Server',
      category: 'Web Server',
      confidence: 100,
      description: 'Modular open-source cross-platform web server software.',
      websiteUrl: 'https://httpd.apache.org',
    });
  } else if (serverHeader.includes('litespeed')) {
    detected.push({
      name: 'LiteSpeed',
      category: 'Web Server',
      confidence: 100,
      description: 'High-performance proprietary drop-in Apache replacement web server.',
      websiteUrl: 'https://litespeedtech.com',
    });
  } else if (serverHeader.includes('caddy')) {
    detected.push({
      name: 'Caddy',
      category: 'Web Server',
      confidence: 100,
      description: 'Modern enterprise web server with automatic HTTPS powered by Go.',
      websiteUrl: 'https://caddyserver.com',
    });
  }

  // 4. CDN & Cloud Edge Hosting
  if (
    serverHeader.includes('cloudflare') ||
    headerKeys['cf-ray'] ||
    headerKeys['cf-cache-status'] ||
    lowerHtml.includes('cdnjs.cloudflare.com')
  ) {
    detected.push({
      name: 'Cloudflare',
      category: 'CDN / Hosting',
      confidence: 100,
      description: 'Global Edge Anycast network providing DDoS mitigation, CDN caching, and DNS.',
      websiteUrl: 'https://cloudflare.com',
    });
  }

  if (
    serverHeader.includes('vercel') ||
    headerKeys['x-vercel-id'] ||
    headerKeys['x-vercel-cache'] ||
    targetUrl.includes('vercel.app')
  ) {
    detected.push({
      name: 'Vercel',
      category: 'CDN / Hosting',
      confidence: 100,
      description: 'Frontend cloud platform offering Global Edge Network & Serverless deployment.',
      websiteUrl: 'https://vercel.com',
    });
  }

  if (serverHeader.includes('cloudfront') || headerKeys['x-amz-cf-id'] || viaHeader.includes('cloudfront')) {
    detected.push({
      name: 'Amazon CloudFront (AWS)',
      category: 'CDN / Hosting',
      confidence: 100,
      description: 'Fast, secure, and programmable Amazon Web Services Content Delivery Network.',
      websiteUrl: 'https://aws.amazon.com/cloudfront',
    });
  }

  if (serverHeader.includes('gfe') || serverHeader.includes('gse') || serverHeader.includes('google')) {
    detected.push({
      name: 'Google Cloud (GFE)',
      category: 'CDN / Hosting',
      confidence: 90,
      description: 'Google Frontend Edge infrastructure with global load balancing.',
      websiteUrl: 'https://cloud.google.com',
    });
  }

  // 5. Backend Languages & Runtimes
  if (xPoweredBy.includes('php')) {
    detected.push({
      name: 'PHP',
      category: 'Programming Language',
      confidence: 100,
      description: 'Widely-used open source general-purpose scripting language.',
      websiteUrl: 'https://php.net',
    });
  } else if (xPoweredBy.includes('express')) {
    detected.push({
      name: 'Node.js / Express',
      category: 'Programming Language',
      confidence: 95,
      description: 'Event-driven asynchronous JavaScript backend runtime and web framework.',
      websiteUrl: 'https://nodejs.org',
    });
  }

  // 6. Analytics & Tag Management
  if (
    lowerHtml.includes('googletagmanager.com') ||
    lowerHtml.includes('google-analytics.com') ||
    lowerHtml.includes('gtag(') ||
    lowerHtml.includes('ga(')
  ) {
    detected.push({
      name: 'Google Analytics 4 / Tag Manager',
      category: 'Analytics',
      confidence: 95,
      description: 'Digital web measurement, visitor behavior, and conversion tracking.',
      websiteUrl: 'https://analytics.google.com',
    });
  }

  if (lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbq(')) {
    detected.push({
      name: 'Meta Pixel',
      category: 'Analytics',
      confidence: 95,
      description: 'Ad conversion tracking and audience retargeting for Facebook & Instagram.',
      websiteUrl: 'https://facebook.com',
    });
  }

  if (lowerHtml.includes('hotjar.com') || lowerHtml.includes('static.hotjar.com')) {
    detected.push({
      name: 'Hotjar',
      category: 'Analytics',
      confidence: 95,
      description: 'Behavior analytics and heatmap user session recording tool.',
      websiteUrl: 'https://hotjar.com',
    });
  }

  // Default fallback if minimal stack is exposed
  if (detected.length === 0) {
    detected.push({
      name: 'Modern Web Stack',
      category: 'Framework',
      confidence: 75,
      description: 'Standard HTML5, Modern CSS, and ES6+ JavaScript client architecture.',
    });
  }

  return detected;
}
