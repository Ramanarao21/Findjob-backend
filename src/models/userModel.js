const mongoose = require('mongoose');
const { DEFAULT_AVATAR_URL } = require('../config/cloudinary');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'recruiter'],
        message: '{VALUE} is not a valid role',
      },
      default: 'candidate',
    },
    membershipTier: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    proExpiresAt: {
      type: Date,
      default: null,
    },
    profileStats: {
      views: { type: Number, default: 42 },
      recruiterSearches: { type: Number, default: 18 },
      responseRate: { type: Number, default: 85 }, // Percentage
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: () => process.env.DEFAULT_AVATAR_URL || DEFAULT_AVATAR_URL,
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeFileName: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
