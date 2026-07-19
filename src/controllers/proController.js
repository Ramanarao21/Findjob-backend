const mongoose = require('mongoose');
const User = require('../models/userModel');
const {
  HRContact,
  InterviewInsight,
  ReferralCompany,
  ReferralRequest,
} = require('../models/proModels');
const { isProUser } = require('../middlewares/proMiddleware');
const {
  serializeHRContact,
  serializeInterviewInsight,
  serializeProfileStats,
} = require('../serializers/proSerializers');

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. PREMIUM HR CONTACTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @desc    Get HR contacts list (Free users get masked emails, Pro users get full emails)
 * @route   GET /api/pro/contacts
 * @access  Private (Authenticated users)
 */
const getHRContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const isPro = isProUser(user);

    let contacts = await HRContact.find().sort({ createdAt: -1 });

    // Seed dummy HR contacts if collection is empty
    if (contacts.length === 0) {
      contacts = await HRContact.insertMany([
        {
          name: 'Sarah Connor',
          title: 'Senior Tech Recruiter',
          company: 'TechCorp Global',
          email: 'sarah.connor@techcorp.com',
          linkedinUrl: 'https://linkedin.com/in/sarahconnor',
        },
        {
          name: 'Michael Scott',
          title: 'Head of Talent Acquisition',
          company: 'CloudScale Inc',
          email: 'm.scott@cloudscale.io',
          linkedinUrl: 'https://linkedin.com/in/michaelscott',
        },
        {
          name: 'Elena Rostova',
          title: 'Engineering HR Lead',
          company: 'InnovateX',
          email: 'elena.r@innovatex.dev',
          linkedinUrl: 'https://linkedin.com/in/elenarostova',
        },
      ]);
    }

    const serializedData = contacts.map((contact) =>
      serializeHRContact(contact, isPro)
    );

    return res.status(200).json({
      success: true,
      count: serializedData.length,
      isProUser: isPro,
      data: serializedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reveal full HR contact email (Pro users only, server-side verified)
 * @route   POST /api/pro/contacts/:contactId/reveal
 * @access  Private (Pro Tier Only)
 */
const revealHRContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json({ success: false, message: 'Invalid contact ID' });
    }

    const contact = await HRContact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'HR Contact not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact email revealed successfully',
      data: {
        contactId: contact._id,
        email: contact.email,
        contact: serializeHRContact(contact, true),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. INTERVIEW INSIGHTS
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @desc    Get interview reports (Free users get truncated sentence, Pro users get full text)
 * @route   GET /api/pro/interview-insights
 * @access  Private (Authenticated users)
 */
const getInterviewInsights = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const isPro = isProUser(user);

    const { company, difficulty } = req.query;
    const filter = {};
    if (company) filter.company = new RegExp(company, 'i');
    if (difficulty) filter.difficulty = difficulty;

    let insights = await InterviewInsight.find(filter).sort({ createdAt: -1 });

    // Seed dummy insights if empty
    if (insights.length === 0) {
      insights = await InterviewInsight.insertMany([
        {
          company: 'TechCorp Global',
          role: 'Full Stack Engineer',
          difficulty: 'Hard',
          outcome: 'Accepted',
          title: 'System Design & System Architecture Deep Dive',
          fullText:
            'The interview process consisted of 4 intense technical rounds. The first round focused on system design for a distributed rate limiter with Redis and sliding window counters. Second round was LeetCode hard dynamic programming. Final round was behavioral with VP of Engineering.',
          submittedBy: req.user.id,
        },
        {
          company: 'CloudScale Inc',
          role: 'Frontend Developer',
          difficulty: 'Medium',
          outcome: 'Accepted',
          title: 'React Performance Optimization & State Management',
          fullText:
            'Very smooth 3-round interview experience. First round was a live coding challenge building a Virtualized List in React. Second round covered web vitals, memoization, and bundle optimization. Received offer within 48 hours.',
          submittedBy: req.user.id,
        },
      ]);
    }

    const serialized = insights.map((item) =>
      serializeInterviewInsight(item, isPro)
    );

    return res.status(200).json({
      success: true,
      count: serialized.length,
      isProUser: isPro,
      data: serialized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a crowdsourced interview report
 * @route   POST /api/pro/interview-insights
 * @access  Private (All authenticated users can contribute)
 */
const submitInterviewInsight = async (req, res, next) => {
  try {
    const { company, role, difficulty, outcome, title, fullText } = req.body;

    if (!company || !role || !title || !fullText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company, role, title, and fullText for the report',
      });
    }

    const newInsight = await InterviewInsight.create({
      company: company.trim(),
      role: role.trim(),
      difficulty: difficulty || 'Medium',
      outcome: outcome || 'Pending',
      title: title.trim(),
      fullText: fullText.trim(),
      submittedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Interview insight submitted successfully! Thank you for contributing.',
      data: newInsight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. REFERRAL NETWORK
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @desc    Get referral counts per company (Visible to Free & Pro)
 * @route   GET /api/pro/referrals
 * @access  Private (Authenticated users)
 */
const getReferralNetwork = async (req, res, next) => {
  try {
    let companies = await ReferralCompany.find().sort({ openReferralCount: -1 });

    if (companies.length === 0) {
      companies = await ReferralCompany.insertMany([
        { company: 'TechCorp Global', openReferralCount: 14, description: 'Tier-1 enterprise software company' },
        { company: 'CloudScale Inc', openReferralCount: 8, description: 'High-growth cloud infrastructure platform' },
        { company: 'InnovateX Labs', openReferralCount: 6, description: 'AI & Machine Learning research startup' },
      ]);
    }

    const user = await User.findById(req.user.id);

    return res.status(200).json({
      success: true,
      isProUser: isProUser(user),
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a referral request to company employees (Pro users only)
 * @route   POST /api/pro/referrals/request
 * @access  Private (Pro Tier Only)
 */
const requestReferral = async (req, res, next) => {
  try {
    const { company, message } = req.body;

    if (!company || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target company and request message',
      });
    }

    const request = await ReferralRequest.create({
      candidate: req.user.id,
      company: company.trim(),
      message: message.trim(),
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: `Referral request submitted successfully for ${company}!`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. MEMBERSHIP, PROFILE ANALYTICS & STRIPE UPGRADE
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @desc    Get Pro Profile Analytics (Locked for Free, Unlocked for Pro)
 * @route   GET /api/pro/membership/stats
 * @access  Private (Authenticated users)
 */
const getProProfileStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPro = isProUser(user);
    const serializedStats = serializeProfileStats(user.profileStats, isPro);

    return res.status(200).json({
      success: true,
      membershipTier: user.membershipTier,
      isProUser: isPro,
      proExpiresAt: user.proExpiresAt,
      data: serializedStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create Stripe Checkout session for upgrading to Pro
 * @route   POST /api/pro/membership/upgrade
 * @access  Private
 */
/**
 * @desc    Create Stripe Checkout session for upgrading to Pro
 * @route   POST /api/pro/membership/upgrade
 * @access  Private
 */
const createCheckoutSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173';
    const clientOrigin = origin.replace(/\/$/, '');

    if (stripeSecretKey && !stripeSecretKey.includes('YOUR_SECRET_KEY')) {
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        metadata: {
          userId: user._id.toString(),
          userEmail: user.email,
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'FindJob Pro Membership Tier',
                description: '1 Year Full Access to Unmasked HR Contacts, Full Interview Reports & Referrals',
              },
              unit_amount: 1900, // $19.00 USD
            },
            quantity: 1,
          },
        ],
        success_url: `${clientOrigin}/pro?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${clientOrigin}/pro?payment=cancelled`,
      });

      return res.status(200).json({
        success: true,
        message: 'Stripe checkout session created successfully',
        data: {
          sessionId: session.id,
          checkoutUrl: session.url,
          amount: 1900,
          currency: 'usd',
          plan: 'FindJob Pro Membership (1 Year)',
        },
      });
    }

    // Fallback if Stripe key is missing
    const sessionId = `cs_test_${Date.now()}_${user._id}`;
    const checkoutUrl = `${clientOrigin}/pro?payment=success&session_id=${sessionId}`;

    return res.status(200).json({
      success: true,
      message: 'Checkout session created (Dev Fallback)',
      data: {
        sessionId,
        checkoutUrl,
        amount: 1900,
        currency: 'usd',
        plan: 'Pro Membership Tier (1 Year)',
      },
    });
  } catch (error) {
    console.error('Stripe Checkout Error:', error.message);
    next(error);
  }
};

/**
 * @desc    Stripe Webhook handler to flip membership tier on successful payment
 * @route   POST /api/pro/membership/webhook
 * @access  Public (Stripe Signatures)
 */
const handleStripeWebhook = async (req, res, next) => {
  try {
    let userId = req.body?.userId;
    let event = req.body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers['stripe-signature'];

    if (stripeSecretKey && signature && stripeWebhookSecret && !stripeWebhookSecret.includes('dummy')) {
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey);
      try {
        event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    // Handle checkout.session.completed or manual payload
    if (event.type === 'checkout.session.completed' || event.data?.object) {
      const sessionObj = event.data ? event.data.object : event;
      userId = sessionObj.client_reference_id || sessionObj.metadata?.userId || userId;
    }

    const targetUserId = userId || (req.user ? req.user.id : null);

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required in webhook payload',
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Set 1-year Pro expiration date
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    user.membershipTier = 'pro';
    user.proExpiresAt = oneYearFromNow;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Membership upgraded to Pro successfully via Stripe webhook',
      data: {
        userId: user._id,
        membershipTier: user.membershipTier,
        proExpiresAt: user.proExpiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dev utility to instantly toggle Pro membership tier for testing
 * @route   POST /api/pro/membership/dev-toggle
 * @access  Private (Authenticated users)
 */
const devToggleProTier = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.membershipTier === 'pro') {
      user.membershipTier = 'free';
      user.proExpiresAt = null;
    } else {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      user.membershipTier = 'pro';
      user.proExpiresAt = oneYearLater;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Membership tier toggled to '${user.membershipTier}'`,
      data: {
        membershipTier: user.membershipTier,
        proExpiresAt: user.proExpiresAt,
        isPro: isProUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Directly update membership tier (free or pro)
 * @route   PATCH /api/pro/membership/tier
 * @access  Private (Authenticated users)
 */
const updateMembershipTier = async (req, res, next) => {
  try {
    const { tier, membershipTier } = req.body;
    const targetTier = (tier || membershipTier || '').toLowerCase().trim();

    if (!['free', 'pro'].includes(targetTier)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tier. Must be 'free' or 'pro'",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (targetTier === 'pro') {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      user.membershipTier = 'pro';
      user.proExpiresAt = oneYearLater;
    } else {
      user.membershipTier = 'free';
      user.proExpiresAt = null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Membership tier successfully updated to '${user.membershipTier}'`,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        membershipTier: user.membershipTier,
        proExpiresAt: user.proExpiresAt,
        isPro: isProUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

