/**
 * Mask email address for free tier users
 * Example: "sarah.connor@company.com" -> "s***r@company.com"
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '***@***.com';
  const [localPart, domain] = email.split('@');
  if (!domain) return '***@***.com';

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  return `${firstChar}***${lastChar}@${domain}`;
};

/**
 * Truncate text to the first sentence for free tier users
 */
const truncateFirstSentence = (text) => {
  if (!text || typeof text !== 'string') return '';
  const match = text.match(/^.*?[.!?](?:\s|$)/);
  return match ? match[0].trim() : text.slice(0, 80).trim();
};

/**
 * Serialize HR Contact object depending on user Pro status
 */
const serializeHRContact = (contactDoc, isPro) => {
  const contact = contactDoc.toObject ? contactDoc.toObject() : contactDoc;
  return {
    _id: contact._id,
    name: contact.name,
    title: contact.title,
    company: contact.company,
    email: isPro ? contact.email : maskEmail(contact.email),
    linkedinUrl: isPro ? contact.linkedinUrl : undefined,
    isMasked: !isPro,
  };
};

/**
 * Serialize Interview Insight object depending on user Pro status
 */
const serializeInterviewInsight = (insightDoc, isPro) => {
  const insight = insightDoc.toObject ? insightDoc.toObject() : insightDoc;
  return {
    _id: insight._id,
    company: insight.company,
    role: insight.role,
    difficulty: insight.difficulty,
    outcome: insight.outcome,
    title: insight.title,
    fullText: isPro
      ? insight.fullText
      : `${truncateFirstSentence(insight.fullText)}... [Pro Exclusive: Upgrade to read full report]`,
    isTruncated: !isPro,
    submittedBy: insight.submittedBy,
    createdAt: insight.createdAt,
  };
};

/**
 * Serialize Profile Analytics Stats depending on user Pro status
 */
const serializeProfileStats = (statsObj, isPro) => {
  if (isPro) {
    return {
      views: statsObj?.views || 0,
      recruiterSearches: statsObj?.recruiterSearches || 0,
      responseRate: statsObj?.responseRate || 0,
      locked: false,
    };
  }

  return {
    views: null,
    recruiterSearches: null,
    responseRate: null,
    locked: true,
    message: 'Upgrade to Pro to unlock profile views, recruiter search appearances, and response rates.',
  };
};

module.exports = {
  maskEmail,
  truncateFirstSentence,
  serializeHRContact,
  serializeInterviewInsight,
  serializeProfileStats,
};
