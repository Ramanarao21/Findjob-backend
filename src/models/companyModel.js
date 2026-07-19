const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: { type: Number, required: true, min: 1, max: 5 },
    author: { type: String, required: true, trim: true },
    tenure: { type: String, default: '', trim: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: 'CO',
      trim: true,
    },
    logoColor: {
      type: String,
      default: '#4f46e5',
      trim: true,
    },
    logoBg: {
      type: String,
      default: '#eef2ff',
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: String,
      default: '0',
      trim: true,
    },
    openRoles: {
      type: Number,
      default: 0,
    },
    size: {
      type: String,
      default: '100 – 500 employees',
      trim: true,
    },
    hq: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    bannerGradient: {
      type: String,
      default: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    about: {
      type: [String],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    ratingBreakdown: {
      type: Map,
      of: Number,
      default: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ name: 'text', industry: 'text', tagline: 'text' });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
