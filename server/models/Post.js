import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    url: String,
    alt: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    focusKeyword: String,
    seoScore: Number,
    readabilityScore: Number
  },
  featured: {
    type: Boolean,
    default: false
  },
  readingTime: {
    type: Number,
    default: 5
  },
  analytics: {
    views: { type: Number, default: 0 },
    reads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);