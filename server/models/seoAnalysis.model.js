const mongoose = require('mongoose');

const SEOCheckSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['basic', 'content', 'technical', 'performance', 'accessibility'],
    required: true
  },
  title: String,
  status: String,
  message: String,
  severity: {
    type: String,
    enum: ['success', 'warning', 'error', 'info']
  },
  details: String
});

const KeywordSchema = new mongoose.Schema({
  keyword: String,
  density: Number,
  count: Number,
  positions: [Number]
});

const SEORankingSchema = new mongoose.Schema({
  keyword: String,
  position: Number,
  change: Number,
  volume: Number,
  difficulty: Number,
  url: String,
  date: Date
});

const SEOCampaignSchema = new mongoose.Schema({
  name: String,
  keywords: [String],
  targetUrl: String,
  competitors: [String],
  goals: {
    targetPosition: Number,
    targetTraffic: Number,
    timeframe: Date
  }
});

const SEOLinkSchema = new mongoose.Schema({
  url: String,
  domain: String,
  anchorText: String,
  follow: Boolean,
  dateFound: Date,
  authority: Number
});

const SEOAnalysisSchema = new mongoose.Schema({
  // Basic info
  url: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  
  // Analysis results
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  checks: [SEOCheckSchema],
  keywords: [KeywordSchema],
  
  // Page data
  title: String,
  metaDescription: String,
  headings: {
    h1: [String],
    h2: [String],
    h3: [String]
  },
  images: [{
    src: String,
    alt: String,
    width: Number,
    height: Number
  }],
  links: {
    internal: [String],
    external: [String]
  },
  
  // Technical data
  loadTime: Number,
  pageSize: Number,
  isMobileFriendly: Boolean,
  hasSSL: Boolean,
  structuredData: [String],
  socialTags: {
    og: Map,
    twitter: Map
  },
  
  // Content analysis
  wordCount: Number,
  readabilityScore: Number,
  keywordDensity: Map,
  
  // Historical tracking
  previousScore: Number,
  improvement: Number,
  
  // Metadata
  analyzedAt: {
    type: Date,
    default: Date.now
  },
  scheduled: {
    type: Boolean,
    default: false
  },
  tags: [String],
  
  // SEO specific
  backlinks: [SEOLinkSchema],
  rankings: [SEORankingSchema],
  canonicalUrl: String,
  hreflang: [{
    lang: String,
    url: String
  }],
  robotsTxt: String,
  sitemap: String,
  
  // Performance metrics
  performance: {
    fcp: Number,  // First Contentful Paint
    lcp: Number,  // Largest Contentful Paint
    fid: Number,  // First Input Delay
    cls: Number,  // Cumulative Layout Shift
    tti: Number   // Time to Interactive
  }
});

// Indexes for faster queries
SEOAnalysisSchema.index({ url: 1, analyzedAt: -1 });
SEOAnalysisSchema.index({ userId: 1, analyzedAt: -1 });
SEOAnalysisSchema.index({ score: -1 });
SEOAnalysisSchema.index({ tags: 1 });

module.exports = mongoose.model('SEOAnalysis', SEOAnalysisSchema);