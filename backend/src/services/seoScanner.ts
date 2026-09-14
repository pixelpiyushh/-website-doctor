import * as cheerio from 'cheerio';
import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  message: string;
  recommendation: string;
}

export interface SEOCheckItem {
  key: string;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  recommendation?: string;
}

export interface SEOReport {
  score: number;
  title?: string;
  titleLength: number;
  metaDescription?: string;
  metaDescriptionLength: number;
  canonicalUrl?: string;
  robotsMeta?: string;
  viewport?: string;
  h1Count: number;
  h1Texts: string[];
  h2Count: number;
  h3Count: number;
  totalImages: number;
  imagesMissingAlt: number;
  hasOpenGraph: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  checklist: SEOCheckItem[];
  issues: SEOIssue[];
}

/**
 * Checks for sitemap.xml or robots.txt existence
 */
async function checkEndpoint(baseUrl: string, path: string): Promise<boolean> {
  try {
    const target = new URL(path, baseUrl).toString();
    const client = target.startsWith('https') ? https : http;
    return await new Promise<boolean>((resolve) => {
      const req = client.request(
        target,
        { method: 'HEAD', timeout: 3000, headers: { 'User-Agent': 'WebsiteDoctor/1.0' } },
        (res) => {
          resolve((res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400);
        }
      );
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  } catch {
    return false;
  }
}

/**
 * Scans HTML content for SEO indicators.
 */
export async function analyzeSEO(html: string, pageUrl: string): Promise<SEOReport> {
  const issues: SEOIssue[] = [];
  let score = 100;

  if (!html || html.trim().length === 0) {
    return {
      score: 0,
      titleLength: 0,
      metaDescriptionLength: 0,
      h1Count: 0,
      h1Texts: [],
      h2Count: 0,
      h3Count: 0,
      totalImages: 0,
      imagesMissingAlt: 0,
      hasOpenGraph: false,
      hasSitemap: false,
      hasRobotsTxt: false,
      checklist: [],
      issues: [
        {
          type: 'critical',
          message: 'No HTML content was returned by the server.',
          recommendation: 'Ensure your server returns valid HTML pages for search crawlers.',
        },
      ],
    };
  }

  const $ = cheerio.load(html);

  // Title check
  const title = $('title').first().text().trim();
  const titleLength = title.length;
  if (!title) {
    score -= 20;
    issues.push({
      type: 'critical',
      message: 'Page title is missing.',
      recommendation: 'Add a concise, unique <title> tag between 30 and 60 characters.',
    });
  } else if (titleLength < 20 || titleLength > 70) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: `Page title length (${titleLength} chars) is outside optimal range (30-60 characters).`,
      recommendation: 'Refine the title tag to be descriptive yet fit comfortably in search result snippets.',
    });
  }

  // Meta description
  const metaDescription = $('meta[name="description"]').attr('content')?.trim();
  const metaDescriptionLength = metaDescription ? metaDescription.length : 0;
  if (!metaDescription) {
    score -= 15;
    issues.push({
      type: 'critical',
      message: 'Meta description is missing.',
      recommendation: 'Add a concise meta description (120-160 characters) summarizing the page content.',
    });
  } else if (metaDescriptionLength < 70 || metaDescriptionLength > 170) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: `Meta description length (${metaDescriptionLength} chars) may get truncated or under-inform.`,
      recommendation: 'Keep your meta description between 120 and 160 characters for maximum search snippet impact.',
    });
  }

  // Viewport
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    score -= 15;
    issues.push({
      type: 'critical',
      message: 'Mobile viewport meta tag is missing.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> for mobile responsiveness.',
    });
  }

  // Headings
  const h1s: string[] = [];
  $('h1').each((_, el) => {
    const txt = $(el).text().trim();
    if (txt) h1s.push(txt);
  });
  const h1Count = h1s.length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  if (h1Count === 0) {
    score -= 15;
    issues.push({
      type: 'critical',
      message: 'No <h1> heading found on the page.',
      recommendation: 'Include exactly one primary <h1> tag defining the topic of the page.',
    });
  } else if (h1Count > 1) {
    score -= 5;
    issues.push({
      type: 'warning',
      message: `Found ${h1Count} <h1> tags. Multiple <h1> tags can dilute semantic focus.`,
      recommendation: 'Reserve <h1> for the main page headline and use <h2> and <h3> for sub-sections.',
    });
  }

  // Canonical
  const canonicalUrl = $('link[rel="canonical"]').attr('href');
  if (!canonicalUrl) {
    score -= 5;
    issues.push({
      type: 'info',
      message: 'No canonical link tag specified.',
      recommendation: 'Add a <link rel="canonical" href="..."> to prevent duplicate content indexing.',
    });
  }

  // Robots meta
  const robotsMeta = $('meta[name="robots"]').attr('content');
  if (robotsMeta && robotsMeta.toLowerCase().includes('noindex')) {
    issues.push({
      type: 'warning',
      message: 'Page specifies "noindex" in robots meta tag.',
      recommendation: 'Ensure "noindex" is intentional and not blocking search engine indexing.',
    });
  }

  // Images and Alt attributes
  const allImgs = $('img');
  const totalImages = allImgs.length;
  let imagesMissingAlt = 0;
  allImgs.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') {
      imagesMissingAlt++;
    }
  });

  if (imagesMissingAlt > 0) {
    score -= Math.min(15, imagesMissingAlt * 3);
    issues.push({
      type: 'warning',
      message: `${imagesMissingAlt} out of ${totalImages} images are missing alt attributes.`,
      recommendation: 'Provide meaningful alt text for all images to improve accessibility and image search indexing.',
    });
  }

  // Open Graph
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const hasOpenGraph = Boolean(ogTitle || ogImage);
  if (!hasOpenGraph) {
    score -= 5;
    issues.push({
      type: 'info',
      message: 'Open Graph social preview tags are missing.',
      recommendation: 'Add og:title, og:description, and og:image to ensure attractive social shares.',
    });
  }

  // Check sitemap.xml and robots.txt asynchronously
  const [hasSitemap, hasRobotsTxt] = await Promise.all([
    checkEndpoint(pageUrl, '/sitemap.xml'),
    checkEndpoint(pageUrl, '/robots.txt'),
  ]);

  if (!hasSitemap) {
    score -= 5;
    issues.push({
      type: 'info',
      message: 'No /sitemap.xml found at standard location.',
      recommendation: 'Generate an XML sitemap and submit it to Google Search Console.',
    });
  }

  if (!hasRobotsTxt) {
    score -= 5;
    issues.push({
      type: 'info',
      message: 'No /robots.txt file detected.',
      recommendation: 'Add a robots.txt file to guide search engine crawlers.',
    });
  }

  const checklist: SEOCheckItem[] = [
    {
      key: 'title',
      name: 'Meta Title',
      status: !title ? 'fail' : titleLength < 20 || titleLength > 70 ? 'warning' : 'pass',
      detail: title ? `${title} (${titleLength} chars)` : 'Missing <title> tag',
      recommendation: !title ? 'Add a unique <title> tag between 30 and 60 characters.' : undefined,
    },
    {
      key: 'metaDescription',
      name: 'Meta Description',
      status: !metaDescription ? 'fail' : metaDescriptionLength < 70 || metaDescriptionLength > 170 ? 'warning' : 'pass',
      detail: metaDescription ? `${metaDescription.slice(0, 65)}... (${metaDescriptionLength} chars)` : 'Missing <meta name="description"> tag',
      recommendation: !metaDescription ? 'Add a concise meta description between 120 and 160 characters.' : undefined,
    },
    {
      key: 'headings',
      name: 'Heading Hierarchy (H1/H2/H3)',
      status: h1Count === 1 ? 'pass' : h1Count === 0 ? 'fail' : 'warning',
      detail: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
      recommendation: h1Count === 0 ? 'Add exactly one primary <h1> tag.' : h1Count > 1 ? 'Keep only 1 primary <h1> tag.' : undefined,
    },
    {
      key: 'sitemap',
      name: 'XML Sitemap (/sitemap.xml)',
      status: hasSitemap ? 'pass' : 'fail',
      detail: hasSitemap ? 'Valid XML sitemap detected' : 'No /sitemap.xml found at standard location',
      recommendation: !hasSitemap ? 'Generate an XML sitemap and submit to Google Search Console.' : undefined,
    },
    {
      key: 'robotsTxt',
      name: 'Robots.txt (/robots.txt)',
      status: hasRobotsTxt ? 'pass' : 'fail',
      detail: hasRobotsTxt ? 'Valid robots.txt file detected' : 'No /robots.txt file detected',
      recommendation: !hasRobotsTxt ? 'Create a robots.txt file in the root directory.' : undefined,
    },
    {
      key: 'imageAlt',
      name: 'Image Alt Text',
      status: imagesMissingAlt === 0 ? 'pass' : imagesMissingAlt > 3 ? 'fail' : 'warning',
      detail: `${totalImages - imagesMissingAlt} of ${totalImages} images have descriptive alt text`,
      recommendation: imagesMissingAlt > 0 ? `Add alt attributes to ${imagesMissingAlt} uncaptioned images.` : undefined,
    },
    {
      key: 'viewport',
      name: 'Mobile Viewport',
      status: viewport ? 'pass' : 'fail',
      detail: viewport ? 'Mobile viewport tag configured' : 'Missing mobile viewport meta tag',
      recommendation: !viewport ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.' : undefined,
    },
    {
      key: 'openGraph',
      name: 'Open Graph Social Cards',
      status: hasOpenGraph ? 'pass' : 'warning',
      detail: hasOpenGraph ? 'og:title / og:image tags present' : 'Missing Open Graph preview tags',
      recommendation: !hasOpenGraph ? 'Add og:title and og:image tags for rich social sharing previews.' : undefined,
    },
  ];

  return {
    score: Math.max(0, Math.min(100, score)),
    title,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    canonicalUrl,
    robotsMeta,
    viewport,
    h1Count,
    h1Texts: h1s.slice(0, 5),
    h2Count,
    h3Count,
    totalImages,
    imagesMissingAlt,
    hasOpenGraph,
    ogTitle,
    ogDescription,
    ogImage,
    hasSitemap,
    hasRobotsTxt,
    checklist,
    issues,
  };
}
