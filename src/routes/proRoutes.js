const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { requirePro } = require('../middlewares/proMiddleware');
const {
  getHRContacts,
  revealHRContact,
  getInterviewInsights,
  submitInterviewInsight,
  getReferralNetwork,
  requestReferral,
  getProProfileStats,
  createCheckoutSession,
  handleStripeWebhook,
  devToggleProTier,
  updateMembershipTier,
} = require('../controllers/proController');

// 1. Premium HR Contacts
router.get('/contacts', verifyToken, getHRContacts);
router.post('/contacts/:contactId/reveal', verifyToken, requirePro, revealHRContact);

// 2. Interview Insights
router.get('/interview-insights', verifyToken, getInterviewInsights);
router.post('/interview-insights', verifyToken, submitInterviewInsight);

// 3. Referral Network
router.get('/referrals', verifyToken, getReferralNetwork);
router.post('/referrals/request', verifyToken, requirePro, requestReferral);

// 4. Membership, Profile Stats & Stripe Upgrade
router.get('/membership/stats', verifyToken, getProProfileStats);
router.patch('/membership/tier', verifyToken, updateMembershipTier);
router.post('/membership/upgrade', verifyToken, createCheckoutSession);
router.post('/membership/webhook', handleStripeWebhook);
router.post('/membership/dev-toggle', verifyToken, devToggleProTier);

module.exports = router;
