import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user'
  },
  profile: {
    bio: String,
    avatar: String,
    website: String
  },
  readingHistory: [{
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    readAt: { type: Date, default: Date.now },
    progress: Number
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  engagement: {
    points: { type: Number, default: 0 },
    level: { type: String, default: 'beginner' },
    badges: [String]
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);