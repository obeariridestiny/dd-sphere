import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import { URL } from 'url';
import SEOAnalysis from '../models/seoAnalysis.model.js';
import auth from '../middleware/auth.js';
import { analyzePage, analyzeKeywords, checkBacklinks, getRankings } from '../services/seoAnalyzer.service.js';

const router = express.Router();

// ================ ANALYSIS ENDPOINTS ================

// Analyze URL
router.post('/analyze', auth, async (req, res) => {
  try {
    const { url, save = true } = req.body;
    
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

    // Perform analysis
    const analysis = await analyzePage(url, req.user.id);

    if (save) {
      const seoAnalysis = new SEOAnalysis({
        ...analysis,
        userId: req.user.id,
        projectId: req.body.projectId,
        tags: req.body.tags || []
      });

      await seoAnalysis.save();
      
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

// Get analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0
    } = req.query;

    const analyses = await SEOAnalysis.find({ userId: req.user.id })
      .sort({ analyzedAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('-checks -keywords -images -links');

    const total = await SEOAnalysis.countDocuments({ userId: req.user.id });

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

// Simple analyze endpoint for testing
router.post('/analyze/simple', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic response for now
    res.json({
      url,
      score: 85,
      message: 'SEO analysis completed',
      analyzedAt: new Date().toISOString(),
      checks: [
        {
          category: 'basic',
          title: 'Page Title',
          status: 'Good',
          message: 'Title found',
          severity: 'success'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MUST HAVE THIS LINE FOR ES MODULES:
export default router;