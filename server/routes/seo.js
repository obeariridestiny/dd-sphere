import express from 'express';
import { SEOAnalyzer } from '../utils/seoAnalyzer.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', auth, (req, res) => {
  try {
    const { content, title, metaDescription, focusKeyword } = req.body;

    if (!content || !title) {
      return res.status(400).json({ error: 'Content and title are required' });
    }

    const analysis = SEOAnalyzer.analyzeContent(content, title, metaDescription, focusKeyword);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

export default router;