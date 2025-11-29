import express from 'express';
import Quiz from '../models/Quiz.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('author', 'username profile')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create quiz
router.post('/', auth, async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      author: req.user.id
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;