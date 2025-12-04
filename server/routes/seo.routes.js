const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const SEOAnalysis = require('../models/seoAnalysis.model');
const auth = require('../middleware/auth');
const { analyzePage, analyzeKeywords, checkBacklinks, getRankings } = require('../services/seoAnalyzer.service');

// ================ ANALYSIS ENDPOINTS ================

// Analyze URL
router.post('/analyze', auth, async (req, res) => {
  try {
    const { url, save = true, schedule } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Check recent analysis (within 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAnalysis = await SEOAnalysis.findOne({
      url,
      userId: req.user.id,
      analyzedAt: { $gte: oneDayAgo }
    }).sort({ analyzedAt: -1 });

    if (recentAnalysis && !req.query.force) {
      return res.json({
        ...recentAnalysis.toObject(),
        cached: true,
        message: 'Using cached analysis from less than 24 hours ago'
      });
    }

    // Perform comprehensive analysis
    const analysis = await analyzePage(url, req.user.id);

    if (save) {
      // Save to database
      const seoAnalysis = new SEOAnalysis({
        ...analysis,
        userId: req.user.id,
        projectId: req.body.projectId,
        tags: req.body.tags || []
      });

      await seoAnalysis.save();
      
      // Update improvement score
      if (recentAnalysis) {
        seoAnalysis.previousScore = recentAnalysis.score;
        seoAnalysis.improvement = seoAnalysis.score - recentAnalysis.score;
        await seoAnalysis.save();
      }

      res.json(seoAnalysis);
    } else {
      res.json(analysis);
    }

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze SEO',
      details: error.message 
    });
  }
});

// Batch analyze multiple URLs
router.post('/analyze/batch', auth, async (req, res) => {
  try {
    const { urls = [], tags = [] } = req.body;
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 URLs per batch' });
    }

    const results = [];
    const errors = [];

    // Process URLs in parallel with limit
    const batchSize = 5;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(async (url) => {
        try {
          const analysis = await analyzePage(url, req.user.id);
          
          const seoAnalysis = new SEOAnalysis({
            ...analysis,
            userId: req.user.id,
            tags: [...tags, 'batch']
          });
          
          await seoAnalysis.save();
          results.push(seoAnalysis);
        } catch (error) {
          errors.push({ url, error: error.message });
        }
      });

      await Promise.all(batchPromises);
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Batch analysis failed' });
  }
});

// Get analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      sortBy = 'analyzedAt', 
      sortOrder = 'desc',
      tags,
      minScore,
      maxScore
    } = req.query;

    const filter = { userId: req.user.id };
    
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }
    
    if (minScore || maxScore) {
      filter.score = {};
      if (minScore) filter.score.$gte = parseInt(minScore);
      if (maxScore) filter.score.$lte = parseInt(maxScore);
    }

    const analyses = await SEOAnalysis.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('-checks -keywords -images -links');

    const total = await SEOAnalysis.countDocuments(filter);

    res.json({
      analyses,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get specific analysis
router.get('/analysis/:id', auth, async (req, res) => {
  try {
    const analysis = await SEOAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

// Delete analysis
router.delete('/analysis/:id', auth, async (req, res) => {
  try {
    const result = await SEOAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ success: true, message: 'Analysis deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// ================ KEYWORD RESEARCH ================

// Analyze keywords
router.post('/keywords/analyze', auth, async (req, res) => {
  try {
    const { keyword, url, country = 'us', language = 'en' } = req.body;
    
    if (!keyword && !url) {
      return res.status(400).json({ error: 'Keyword or URL is required' });
    }

    const analysis = await analyzeKeywords(
      keyword || url, 
      country, 
      language,
      req.user.id
    );

    res.json(analysis);
  } catch (error) {
    console.error('Keyword analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze keywords' });
  }
});

// Get keyword suggestions
router.get('/keywords/suggest', auth, async (req, res) => {
  try {
    const { keyword, limit = 10 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    // Use Google Autocomplete API (simulated)
    const suggestions = await getKeywordSuggestions(keyword, limit);
    
    res.json({ keyword, suggestions });
  } catch (error) {
    console.error('Keyword suggest error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Track keyword rankings
router.post('/keywords/track', auth, async (req, res) => {
  try {
    const { keywords, url, competitors = [] } = req.body;
    
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const rankings = await getRankings(keywords, url, competitors, req.user.id);
    
    // Save rankings
    const keywordTrack = new KeywordTrack({
      userId: req.user.id,
      url,
      keywords,
      competitors,
      rankings,
      date: new Date()
    });

    await keywordTrack.save();

    res.json({
      success: true,
      rankings,
      trackId: keywordTrack._id
    });
  } catch (error) {
    console.error('Keyword tracking error:', error);
    res.status(500).json({ error: 'Failed to track keywords' });
  }
});

// ================ BACKLINK ANALYSIS ================

// Check backlinks
router.get('/backlinks', auth, async (req, res) => {
  try {
    const { url, limit = 50 } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const backlinks = await checkBacklinks(url, limit);
    
    res.json({
      url,
      total: backlinks.length,
      backlinks
    });
  } catch (error) {
    console.error('Backlink error:', error);
    res.status(500).json({ error: 'Failed to fetch backlinks' });
  }
});

// ================ COMPETITOR ANALYSIS ================

// Analyze competitors
router.post('/competitors', auth, async (req, res) => {
  try {
    const { url, competitors = [] } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'Competitors array is required' });
    }

    if (competitors.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 competitors' });
    }

    // Analyze all competitors
    const competitorAnalyses = [];
    for (const competitor of [url, ...competitors]) {
      try {
        const analysis = await analyzePage(competitor, req.user.id, false);
        competitorAnalyses.push({
          url: competitor,
          ...analysis
        });
      } catch (error) {
        competitorAnalyses.push({
          url: competitor,
          error: error.message
        });
      }
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate comparison
    const comparison = generateComparison(competitorAnalyses);

    res.json({
      comparison,
      analyses: competitorAnalyses
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze competitors' });
  }
});

// ================ REPORTS & DASHBOARD ================

// Generate SEO report
router.post('/reports/generate', auth, async (req, res) => {
  try {
    const { analysisId, format = 'html', includeCharts = true } = req.body;
    
    const analysis = await SEOAnalysis.findOne({
      _id: analysisId,
      userId: req.user.id
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const report = await generateReport(analysis, format, includeCharts);
    
    res.json({
      success: true,
      report,
      downloadUrl: `/api/seo/reports/download/${analysisId}?format=${format}`
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get SEO dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [
      totalAnalyses,
      averageScore,
      scoreTrend,
      recentAnalyses,
      topIssues,
      keywordPerformance
    ] = await Promise.all([
      // Total analyses
      SEOAnalysis.countDocuments({ userId: req.user.id }),
      
      // Average score
      SEOAnalysis.aggregate([
        { $match: { userId: req.user.id } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]),
      
      // Score trend (last 30 days)
      SEOAnalysis.aggregate([
        {
          $match: {
            userId: req.user.id,
            analyzedAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' } },
            avgScore: { $avg: '$score' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),
      
      // Recent analyses
      SEOAnalysis.find({ userId: req.user.id })
        .sort({ analyzedAt: -1 })
        .limit(5)
        .select('url score analyzedAt'),
      
      // Top issues
      SEOAnalysis.aggregate([
        { $match: { userId: req.user.id } },
        { $unwind: '$checks' },
        { $match: { 'checks.severity': { $in: ['error', 'warning'] } } },
        { $group: { 
          _id: '$checks.title', 
          count: { $sum: 1 },
          avgSeverity: { $avg: { 
            $cond: [{ $eq: ['$checks.severity', 'error'] }, 2, 1] 
          }}
        }},
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Keyword performance (if tracking)
      KeywordTrack.aggregate([
        { $match: { userId: req.user.id } },
        { $sort: { date: -1 } },
        { $limit: 1 }
      ])
    ]);

    res.json({
      overview: {
        totalAnalyses,
        averageScore: averageScore[0]?.avgScore || 0,
        improvement: scoreTrend.length > 1 
          ? scoreTrend[scoreTrend.length - 1].avgScore - scoreTrend[0].avgScore 
          : 0
      },
      scoreTrend,
      recentAnalyses,
      topIssues,
      keywordPerformance: keywordPerformance[0] || null
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ================ INTEGRATION HELPERS ================

// Webhook for automatic analysis (e.g., when page is published)
router.post('/webhook/analyze', async (req, res) => {
  try {
    const { secret, url, userId, projectId } = req.body;
    
    // Verify webhook secret
    if (secret !== process.env.SEO_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid webhook secret' });
    }

    // Perform analysis
    const analysis = await analyzePage(url, userId);
    
    const seoAnalysis = new SEOAnalysis({
      ...analysis,
      userId,
      projectId,
      tags: ['webhook', 'auto'],
      scheduled: true
    });

    await seoAnalysis.save();

    // Send notification (you can integrate with your notification system)
    // await sendNotification(userId, 'SEO Analysis Complete', { url, score: analysis.score });

    res.json({ success: true, analysisId: seoAnalysis._id });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check
router.get('/health', async (req, res) => {
  const services = {
    database: false,
    externalApis: false
  };

  try {
    // Check database
    await SEOAnalysis.findOne();
    services.database = true;
    
    // Check external API (Google PageSpeed Insights)
    await axios.get('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com');
    services.externalApis = true;
    
    res.json({
      status: 'healthy',
      services,
      timestamp: new Date()
    });
  } catch (error) {
    res.json({
      status: 'degraded',
      services,
      timestamp: new Date()
    });
  }
});

module.exports = router;