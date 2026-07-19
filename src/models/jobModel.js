const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        message: '{VALUE} is not a valid job type',
      },
      default: 'full-time',
    },
    salaryMin: {
      type: Number,
    },
    salaryMax: {
      type: Number,
    },
    currency: {
      type: String,
      enum: ['USD', 'INR', 'GBP', 'EUR', '$', '₹', '£', '€'],
      default: 'USD',
      trim: true,
    },
    experienceMin: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'postedBy recruiter reference is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'closed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for text search & filtering
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ type: 1, location: 1, status: 1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
