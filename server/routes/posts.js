import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const posts = await Post.find(filter)
      .populate('author', 'username profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({
      slug: req.params.slug,
      status: 'published'
    }).populate('author', 'username profile');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.analytics.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post (authors/admins only)
router.post('/', auth, async (req, res) => {
  try {
    if (!['author', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const post = new Post({
      ...req.body,
      author: req.user.id
    });

    await post.save();
    await post.populate('author', 'username profile');

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;