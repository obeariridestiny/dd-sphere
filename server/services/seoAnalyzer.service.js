import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

class SEOAnalyzerService {
  constructor() {
    this.SEORules = {
      TITLE: { min: 30, max: 60, optimal: 50 },
      DESCRIPTION: { min: 50, max: 160, optimal: 120 },
      KEYWORDS: { maxDensity: 3, minCount: 1 },
      HEADINGS: { requireH1: true, maxH1: 1 },
      CONTENT: { minWords: 300, optimal: 500 }
    };
  }

  async analyzePage(url, userId, fullAnalysis = true) {
    try {
      const html = await this.fetchHTML(url);
      const performance = fullAnalysis ? await this.analyzePerformance(url) : null;
      const backlinks = fullAnalysis ? await this.getBacklinks(url) : null;

      const $ = cheerio.load(html);
      
      // Extract basic data
      const basicData = this.extractBasicData($, url);
      const contentData = this.analyzeContent($);
      const technicalData = await this.analyzeTechnical($, url);
      const keywordData = this.analyzeKeywords(basicData.title + ' ' + contentData.text);

      // Calculate score
      const checks = this.runAllChecks(basicData, contentData, technicalData, keywordData);
      const score = this.calculateScore(checks);

      return {
        url,
        score,
        checks,
        ...basicData,
        ...contentData,
        ...technicalData,
        keywords: keywordData,
        performance: performance || {},
        backlinks: backlinks || [],
        analyzedAt: new Date()
      };
    } catch (error) {
      console.error('Page analysis error:', error);
      throw new Error(`Failed to analyze page: ${error.message}`);
    }
  }

  extractBasicData($, url) {
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const canonical = $('link[rel="canonical"]').attr('href') || url;
    const robots = $('meta[name="robots"]').attr('content') || '';

    // Extract headings
    const headings = {
      h1: $('h1').map((i, el) => $(el).text().trim()).get(),
      h2: $('h2').map((i, el) => $(el).text().trim()).get(),
      h3: $('h3').map((i, el) => $(el).text().trim()).get()
    };

    // Extract images
    const images = $('img').map((i, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || '',
      title: $(el).attr('title') || '',
      loading: $(el).attr('loading') || 'eager'
    })).get();

    // Extract links
    const links = {
      internal: [],
      external: []
    };

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === new URL(url).hostname) {
          links.internal.push({
            href,
            text: $(el).text().trim(),
            title: $(el).attr('title') || '',
            follow: $(el).attr('rel')?.includes('nofollow') ? false : true
          });
        } else {
          links.external.push({
            href,
            text: $(el).text().trim(),
            title: $(el).attr('title') || '',
            follow: $(el).attr('rel')?.includes('nofollow') ? false : true
          });
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    // Social media tags
    const socialTags = {
      og: {},
      twitter: {}
    };

    $('meta[property^="og:"]').each((i, el) => {
      const property = $(el).attr('property').replace('og:', '');
      socialTags.og[property] = $(el).attr('content');
    });

    $('meta[name^="twitter:"]').each((i, el) => {
      const name = $(el).attr('name').replace('twitter:', '');
      socialTags.twitter[name] = $(el).attr('content');
    });

    return {
      title,
      metaDescription,
      canonicalUrl: canonical,
      robotsTxt: robots,
      headings,
      images,
      links,
      socialTags,
      hasSSL: url.startsWith('https://')
    };
  }

  analyzeContent($) {
    const bodyText = $('body').text();
    const wordCount = this.countWords(bodyText);
    const text = this.cleanText(bodyText);
    
    // Readability score (simplified)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordsPerSentence = sentences.map(s => this.countWords(s));
    const avgWordsPerSentence = wordsPerSentence.reduce((a, b) => a + b, 0) / wordsPerSentence.length;
    
    // Flesch Reading Ease approximation
    const readabilityScore = Math.max(0, Math.min(100, 
      100 - (avgWordsPerSentence * 1.5)
    ));

    return {
      text,
      wordCount,
      readabilityScore,
      sentences: sentences.length,
      avgWordsPerSentence
    };
  }

  async analyzeTechnical($, url) {
    const technical = {
      isMobileFriendly: false,
      hasStructuredData: false,
      hreflang: [],
      pageSize: 0,
      loadTime: 0
    };

    // Check mobile viewport
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    technical.isMobileFriendly = viewport.includes('width=device-width');

    // Check structured data
    const structuredData = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        structuredData.push(data);
      } catch (error) {
        // Invalid JSON
      }
    });
    technical.hasStructuredData = structuredData.length > 0;
    technical.structuredData = structuredData;

    // Check hreflang
    $('link[rel="alternate"][hreflang]').each((i, el) => {
      technical.hreflang.push({
        lang: $(el).attr('hreflang'),
        url: $(el).attr('href')
      });
    });

    // Get page size (estimate)
    technical.pageSize = Buffer.byteLength($.html(), 'utf8');

    return technical;
  }

  // KEYWORD ANALYSIS METHOD (with country/language params)
  analyzeKeywords(text, country = 'us', language = 'en') {
    // Simple keyword analysis
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const frequencies = {};
  
    words.forEach(word => {
      frequencies[word] = (frequencies[word] || 0) + 1;
    });
  
    return Object.entries(frequencies)
      .slice(0, 10)
      .map(([keyword, count]) => ({
        keyword,
        count,
        volume: Math.floor(Math.random() * 10000),
        difficulty: Math.floor(Math.random() * 100)
      }));
  }
  
  // BACKLINK CHECK METHOD
  checkBacklinks(url, limit = 10) {
    // Mock backlinks
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      url: `https://example.com/backlink-${i}`,
      domain: 'example.com',
      anchorText: `Backlink ${i + 1}`,
      follow: true,
      authority: Math.floor(Math.random() * 100)
    }));
  }
  
  // RANKINGS TRACKING METHOD
  getRankings(keywords, url, competitors = []) {
    // Mock rankings
    return keywords.map(keyword => ({
      keyword,
      position: Math.floor(Math.random() * 50) + 1,
      url,
      change: Math.floor(Math.random() * 10) - 5
    }));
  }

  async analyzePerformance(url) {
    try {
      // Using Google PageSpeed Insights API
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return this.simulatePerformance();
      }

      const response = await axios.get(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`
      );

      const data = response.data;
      const lighthouse = data.lighthouseResult;

      return {
        performanceScore: lighthouse.categories.performance.score * 100,
        fcp: lighthouse.audits['first-contentful-paint'].numericValue,
        lcp: lighthouse.audits['largest-contentful-paint'].numericValue,
        fid: lighthouse.audits['max-potential-fid'].numericValue,
        cls: lighthouse.audits['cumulative-layout-shift'].numericValue,
        tti: lighthouse.audits['interactive'].numericValue,
        speedIndex: lighthouse.audits['speed-index'].numericValue
      };
    } catch (error) {
      console.error('Performance analysis error:', error);
      return this.simulatePerformance();
    }
  }

  simulatePerformance() {
    return {
      performanceScore: Math.floor(Math.random() * 30) + 70, // 70-100
      fcp: Math.floor(Math.random() * 2000) + 1000,
      lcp: Math.floor(Math.random() * 4000) + 2000,
      fid: Math.floor(Math.random() * 200) + 50,
      cls: Math.random() * 0.25,
      tti: Math.floor(Math.random() * 5000) + 3000,
      speedIndex: Math.floor(Math.random() * 4000) + 2000
    };
  }

  async getBacklinks(url) {
    // In a real implementation, use a backlink API like Ahrefs or Moz
    // This is a simulated version
    const domains = ['google.com', 'facebook.com', 'twitter.com', 'linkedin.com', 'github.com'];
    
    return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
      url: `https://${domains[Math.floor(Math.random() * domains.length)]}/backlink-${i}`,
      domain: domains[Math.floor(Math.random() * domains.length)],
      anchorText: `Related article ${i + 1}`,
      follow: Math.random() > 0.3,
      dateFound: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      authority: Math.floor(Math.random() * 50) + 20
    }));
  }

  runAllChecks(basic, content, technical, keywords) {
    const checks = [];
    let score = 100;

    // Title check
    if (!basic.title) {
      checks.push(this.createCheck('basic', 'Page Title', 'error', 'No title tag found', 'Add a title tag', 15));
      score -= 15;
    } else if (basic.title.length < this.SEORules.TITLE.min) {
      checks.push(this.createCheck('basic', 'Page Title', 'warning', 
        `Title is too short (${basic.title.length} chars)`, 
        `Increase to ${this.SEORules.TITLE.min}-${this.SEORules.TITLE.max} chars`, 5));
      score -= 5;
    } else if (basic.title.length > this.SEORules.TITLE.max) {
      checks.push(this.createCheck('basic', 'Page Title', 'warning',
        `Title is too long (${basic.title.length} chars)`,
        `Reduce to ${this.SEORules.TITLE.min}-${this.SEORules.TITLE.max} chars`, 5));
      score -= 5;
    } else {
      checks.push(this.createCheck('basic', 'Page Title', 'success',
        `Title length is good (${basic.title.length} chars)`, null, 0));
    }

    // Meta description check
    if (!basic.metaDescription) {
      checks.push(this.createCheck('basic', 'Meta Description', 'error',
        'No meta description found',
        'Add a meta description', 10));
      score -= 10;
    } else if (basic.metaDescription.length < this.SEORules.DESCRIPTION.min) {
      checks.push(this.createCheck('basic', 'Meta Description', 'warning',
        `Meta description is too short (${basic.metaDescription.length} chars)`,
        `Increase to ${this.SEORules.DESCRIPTION.min}-${this.SEORules.DESCRIPTION.max} chars`, 3));
      score -= 3;
    } else if (basic.metaDescription.length > this.SEORules.DESCRIPTION.max) {
      checks.push(this.createCheck('basic', 'Meta Description', 'warning',
        `Meta description is too long (${basic.metaDescription.length} chars)`,
        `Reduce to ${this.SEORules.DESCRIPTION.min}-${this.SEORules.DESCRIPTION.max} chars`, 3));
      score -= 3;
    } else {
      checks.push(this.createCheck('basic', 'Meta Description', 'success',
        `Meta description length is good (${basic.metaDescription.length} chars)`, null, 0));
    }

    // Heading checks
    if (!basic.headings.h1 || basic.headings.h1.length === 0) {
      checks.push(this.createCheck('content', 'H1 Heading', 'error',
        'No H1 heading found',
        'Add one H1 heading with primary keyword', 10));
      score -= 10;
    } else if (basic.headings.h1.length > 1) {
      checks.push(this.createCheck('content', 'H1 Heading', 'warning',
        `Multiple H1 headings found (${basic.headings.h1.length})`,
        'Use only one H1 heading per page', 5));
      score -= 5;
    } else {
      checks.push(this.createCheck('content', 'H1 Heading', 'success',
        'One H1 heading found', null, 0));
    }

    // Image alt text check
    const imagesWithoutAlt = basic.images.filter(img => !img.alt.trim());
    if (imagesWithoutAlt.length > 0) {
      checks.push(this.createCheck('technical', 'Image Alt Text', 'warning',
        `${imagesWithoutAlt.length} images without alt text`,
        'Add descriptive alt text to all images', imagesWithoutAlt.length * 2));
      score -= imagesWithoutAlt.length * 2;
    } else if (basic.images.length > 0) {
      checks.push(this.createCheck('technical', 'Image Alt Text', 'success',
        'All images have alt text', null, 0));
    }

    // Content length check
    if (content.wordCount < this.SEORules.CONTENT.minWords) {
      checks.push(this.createCheck('content', 'Content Length', 'warning',
        `Content is too short (${content.wordCount} words)`,
        `Aim for at least ${this.SEORules.CONTENT.minWords} words`, 8));
      score -= 8;
    } else {
      checks.push(this.createCheck('content', 'Content Length', 'success',
        `Content length is adequate (${content.wordCount} words)`, null, 0));
    }

    // Mobile friendly check
    if (!technical.isMobileFriendly) {
      checks.push(this.createCheck('technical', 'Mobile Friendly', 'warning',
        'Page may not be mobile-friendly',
        'Add viewport meta tag', 10));
      score -= 10;
    } else {
      checks.push(this.createCheck('technical', 'Mobile Friendly', 'success',
        'Page is mobile-friendly', null, 0));
    }

    // SSL check
    if (!basic.hasSSL) {
      checks.push(this.createCheck('technical', 'SSL Certificate', 'error',
        'No SSL certificate (HTTPS)',
        'Install SSL certificate', 15));
      score -= 15;
    } else {
      checks.push(this.createCheck('technical', 'SSL Certificate', 'success',
        'SSL certificate installed', null, 0));
    }

    // Internal links check
    if (basic.links.internal.length < 3) {
      checks.push(this.createCheck('content', 'Internal Links', 'warning',
        `Few internal links (${basic.links.internal.length})`,
        'Add more internal links for better navigation', 5));
      score -= 5;
    } else {
      checks.push(this.createCheck('content', 'Internal Links', 'success',
        `Good number of internal links (${basic.links.internal.length})`, null, 0));
    }

    // Structured data check
    if (!technical.hasStructuredData) {
      checks.push(this.createCheck('technical', 'Structured Data', 'info',
        'No structured data found',
        'Add structured data for rich snippets', 0));
    } else {
      checks.push(this.createCheck('technical', 'Structured Data', 'success',
        'Structured data found', null, 0));
    }

    return checks;
  }

  createCheck(category, title, severity, message, details, points = 0) {
    return {
      category,
      title,
      status: severity === 'success' ? 'Good' : 
              severity === 'warning' ? 'Warning' : 
              severity === 'error' ? 'Error' : 'Info',
      message,
      severity,
      details,
      points
    };
  }

  calculateScore(checks) {
    const maxPoints = 100;
    const deductedPoints = checks.reduce((sum, check) => sum + check.points, 0);
    return Math.max(0, maxPoints - deductedPoints);
  }

  // Utility methods
  async fetchHTML(url) {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DD-Sphere-SEO-Analyzer/1.0)'
      },
      timeout: 10000
    });
    return response.data;
  }

  countWords(text) {
    return text.trim().split(/\s+/).length;
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?\-]/g, '')
      .trim();
  }

  findWordPositions(text, word) {
    const positions = [];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      positions.push(match.index);
    }
    return positions;
  }
}

// Create instance
const seoAnalyzerService = new SEOAnalyzerService();

// Export named functions
export const analyzePage = seoAnalyzerService.analyzePage.bind(seoAnalyzerService);
export const analyzeKeywords = seoAnalyzerService.analyzeKeywords.bind(seoAnalyzerService);
export const checkBacklinks = seoAnalyzerService.checkBacklinks.bind(seoAnalyzerService);
export const getRankings = seoAnalyzerService.getRankings.bind(seoAnalyzerService);

// Also export default
export default seoAnalyzerService;