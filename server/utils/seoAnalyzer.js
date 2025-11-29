export class SEOAnalyzer {
  static analyzeContent(content, title, metaDescription = '', focusKeyword = '') {
    const analysis = {
      overallScore: 0,
      readability: this.analyzeReadability(content),
      keyword: this.analyzeKeywordUsage(content, title, metaDescription, focusKeyword),
      meta: this.analyzeMetaTags(title, metaDescription),
      content: this.analyzeContentQuality(content),
      suggestions: []
    };

    analysis.overallScore = this.calculateOverallScore(analysis);
    analysis.suggestions = this.generateSuggestions(analysis);
    
    return analysis;
  }

  static analyzeReadability(content) {
    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).length;
    const paragraphs = content.split('\n\n').length;
    
    const avgSentenceLength = words / sentences;
    let score = 100;
    
    if (avgSentenceLength > 20) score -= 20;
    if (words < 300) score -= 30;
    if (paragraphs < 3) score -= 10;
    
    return {
      score: Math.max(score, 0),
      wordCount: words,
      readingTime: Math.ceil(words / 200),
      sentenceCount: sentences,
      paragraphCount: paragraphs
    };
  }

  static analyzeKeywordUsage(content, title, metaDescription, focusKeyword) {
    if (!focusKeyword) return { score: 0, density: 0, usage: {} };

    const contentLower = content.toLowerCase();
    const titleLower = title.toLowerCase();
    const metaLower = metaDescription.toLowerCase();
    const keywordLower = focusKeyword.toLowerCase();

    const keywordCount = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
    const wordCount = content.split(' ').length;
    const density = (keywordCount / wordCount) * 100;

    const usage = {
      inTitle: titleLower.includes(keywordLower),
      inMetaDescription: metaLower.includes(keywordLower),
      density: Math.round(density * 100) / 100,
      count: keywordCount
    };

    let score = 0;
    if (usage.inTitle) score += 40;
    if (usage.inMetaDescription) score += 30;
    if (density >= 0.5 && density <= 2.5) score += 30;

    return { score, density, usage };
  }

  static analyzeMetaTags(title, metaDescription) {
    const analysis = {
      title: {
        length: title.length,
        optimal: title.length >= 50 && title.length <= 60,
        score: title.length >= 50 && title.length <= 60 ? 100 : 50
      },
      metaDescription: {
        length: metaDescription.length,
        optimal: metaDescription.length >= 120 && metaDescription.length <= 160,
        score: metaDescription.length >= 120 && metaDescription.length <= 160 ? 100 : 50
      }
    };

    analysis.overallScore = Math.round((analysis.title.score + analysis.metaDescription.score) / 2);
    return analysis;
  }

  static analyzeContentQuality(content) {
    const words = content.split(' ');
    const headings = (content.match(/#{1,6}\s+.+/g) || []).length;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length - images;

    return {
      wordCount: words.length,
      headingCount: headings,
      imageCount: images,
      linkCount: links
    };
  }

  static calculateOverallScore(analysis) {
    return Math.round(
      (analysis.readability.score * 0.3) +
      (analysis.keyword.score * 0.4) +
      (analysis.meta.overallScore * 0.2) +
      (analysis.content.wordCount > 300 ? 10 : 0)
    );
  }

  static generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.readability.score < 60) {
      suggestions.push('Improve readability by using shorter sentences');
    }

    if (analysis.content.wordCount < 300) {
      suggestions.push('Add more content (aim for 300+ words)');
    }

    if (analysis.keyword.density < 0.5) {
      suggestions.push('Consider increasing keyword density');
    }

    if (!analysis.keyword.usage.inTitle) {
      suggestions.push('Include focus keyword in the title');
    }

    if (analysis.content.headingCount < 2) {
      suggestions.push('Add more subheadings to structure content');
    }

    return suggestions;
  }
}