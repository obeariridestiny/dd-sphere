import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false'],
      default: 'multiple-choice'
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    explanation: String,
    points: {
      type: Number,
      default: 10
    }
  }],
  category: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  settings: {
    timeLimit: Number,
    passingScore: {
      type: Number,
      default: 70
    },
    allowRetakes: {
      type: Boolean,
      default: true
    }
  },
  analytics: {
    attempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model('Quiz', quizSchema);