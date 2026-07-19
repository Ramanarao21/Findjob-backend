const mongoose = require('mongoose');

// 1. Premium HR Contacts
const hrContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedinUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// 2. Crowdsourced Interview Insights
const interviewInsightSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    outcome: {
      type: String,
      enum: ['Accepted', 'Rejected', 'Pending'],
      default: 'Pending',
    },
    title: { type: String, required: true, trim: true },
    fullText: { type: String, required: true },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// 3. Referral Network Companies & Counts
const referralCompanySchema = new mongoose.Schema(
  {
    company: { type: String, required: true, unique: true, trim: true },
    openReferralCount: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// 4. Referral Requests (Submitted by Pro Users)
const referralRequestSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const HRContact = mongoose.model('HRContact', hrContactSchema);
const InterviewInsight = mongoose.model('InterviewInsight', interviewInsightSchema);
const ReferralCompany = mongoose.model('ReferralCompany', referralCompanySchema);
const ReferralRequest = mongoose.model('ReferralRequest', referralRequestSchema);

module.exports = {
  HRContact,
  InterviewInsight,
  ReferralCompany,
  ReferralRequest,
};
