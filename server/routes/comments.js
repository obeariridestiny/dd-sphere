import express from 'express';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username profile')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create comment
router.post('/posts/:postId/comments', auth, async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId,
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'username profile');

    // Update post comments count
    await Post.findByIdAndUpdate(req.params.postId, {
      $inc: { 'analytics.commentsCount': 1 }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like comment
router.post('/comments/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    const hasLiked = comment.likes.includes(req.user.id);
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.json({ likes: comment.likes.length, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Comment.deleteOne({ _id: req.params.id });

    // Update post comments count
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { 'analytics.commentsCount': -1 }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;