import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  path: String,
  referrer: String,
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  startTime: Date,
  endTime: Date,
  duration: Number,
  pageViews: Number
});

export const PageView = mongoose.model('PageView', pageViewSchema);
export const UserSession = mongoose.model('UserSession', userSessionSchema);