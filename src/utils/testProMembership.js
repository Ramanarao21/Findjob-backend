require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const {
  maskEmail,
  truncateFirstSentence,
  serializeHRContact,
  serializeInterviewInsight,
  serializeProfileStats,
} = require('../serializers/proSerializers');
const { isProUser } = require('../middlewares/proMiddleware');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runProTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING PRO MEMBERSHIP TEST SUITE');
  console.log('====================================================\n');

  // ── 1. SERIALIZER UNIT TESTS ──
  console.log('1. Testing Data Masking & Serialization (Free vs Pro)');

  // 1a. Email Masking
  const rawEmail = 'sarah.connor@techcorp.com';
  const maskedEmail = maskEmail(rawEmail);
  assert(maskedEmail.includes('***') && maskedEmail.includes('techcorp.com'), `Email masking converts '${rawEmail}' to '${maskedEmail}'`);

  // 1b. HR Contact Serialization
  const dummyContact = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Sarah Connor',
    title: 'Recruiter',
    company: 'TechCorp',
    email: rawEmail,
  };
  const freeContact = serializeHRContact(dummyContact, false);
  const proContact = serializeHRContact(dummyContact, true);

  assert(freeContact.email !== rawEmail && freeContact.isMasked === true, 'Free user receives masked HR email');
  assert(proContact.email === rawEmail && proContact.isMasked === false, 'Pro user receives full unmasked HR email');

  // 1c. Interview Insight Truncation
  const dummyInsight = {
    _id: new mongoose.Types.ObjectId(),
    company: 'TechCorp',
    role: 'Dev',
    difficulty: 'Hard',
    outcome: 'Accepted',
    title: 'Coding Interview',
    fullText: 'The interview process was very tough. Round 1 was DP. Round 2 was System Design.',
  };
  const freeInsight = serializeInterviewInsight(dummyInsight, false);
  const proInsight = serializeInterviewInsight(dummyInsight, true);

  assert(freeInsight.isTruncated === true && freeInsight.fullText.includes('[Pro Exclusive'), 'Free user gets truncated interview text with CTA');
  assert(proInsight.isTruncated === false && proInsight.fullText === dummyInsight.fullText, 'Pro user gets full interview text');

  // 1d. Profile Stats Locking
  const dummyStats = { views: 42, recruiterSearches: 18, responseRate: 85 };
  const freeStats = serializeProfileStats(dummyStats, false);
  const proStats = serializeProfileStats(dummyStats, true);

  assert(freeStats.locked === true && freeStats.views === null, 'Free user profile stats are locked (null values)');
  assert(proStats.locked === false && proStats.views === 42, 'Pro user profile stats are unlocked with actual metrics');

  // ── 2. MIDDLEWARE ACCESS GATING TESTS ──
  console.log('\n2. Testing Middleware Gating & Pro Tier Check');

  // Free user instance
  const testFreeUser = {
    membershipTier: 'free',
    proExpiresAt: null,
  };
  assert(!isProUser(testFreeUser), 'isProUser helper returns false for Free tier user');

  // Active Pro user instance
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const testProUser = {
    membershipTier: 'pro',
    proExpiresAt: oneYearLater,
  };
  assert(isProUser(testProUser), 'isProUser helper returns true for active Pro tier user');

  // Expired Pro user instance
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const testExpiredUser = {
    membershipTier: 'pro',
    proExpiresAt: yesterday,
  };
  assert(!isProUser(testExpiredUser), 'isProUser helper returns false for Expired Pro user');

  console.log('\n====================================================');
  console.log(`RESULTS: Passed: ${testsPassed} | Failed: ${testsFailed}`);
  console.log('====================================================\n');

  if (testsFailed === 0) {
    console.log('🎉 ALL PRO MEMBERSHIP TESTS PASSED PERFECTLY!');
  }
}

runProTestSuite();
