import express from 'express';
import { PageView, UserSession } from '../models/Analytics.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Track page view
router.post('/track', async (req, res) => {
  try {
    const { path, referrer, userAgent, ip } = req.body;

    const pageView = new PageView({
      path,
      referrer: referrer || 'direct',
      userAgent,
      ip
    });

    await pageView.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics overview
router.get('/overview', auth, async (req, res) => {
  try {
    // Only admins and authors can access analytics
    if (!['admin', 'author'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalPageViews = await PageView.countDocuments();

    // Recent posts with analytics
    const recentPosts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title analytics createdAt');

    // Top performing posts
    const topPosts = await Post.find()
      .sort({ 'analytics.views': -1 })
      .limit(5)
      .select('title analytics.views analytics.likes');

    res.json({
      overview: {
        totalPosts,
        totalUsers,
        totalPageViews,
        averageEngagement: 65 // This would be calculated from actual data
      },
      recentPosts,
      topPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;