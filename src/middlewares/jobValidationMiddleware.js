const { body, validationResult } = require('express-validator');

/**
 * Handle validation result errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Express-validator rules for POST /api/jobs
 */
const validateCreateJob = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('companyName is required'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('role is required'),
  body('jobDescription')
    .trim()
    .notEmpty()
    .withMessage('jobDescription is required'),
  body('jobType')
    .trim()
    .notEmpty()
    .withMessage('jobType is required')
    .isIn(['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'])
    .withMessage('jobType must be one of: Full-time, Part-time, Internship, Remote, Contract'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('location is required'),
  body('status')
    .optional()
    .isIn(['active', 'closed', 'draft'])
    .withMessage('status must be active, closed, or draft'),
  handleValidationErrors,
];

/**
 * Express-validator rules for PUT /api/jobs/:id
 */
const validateUpdateJob = [
  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('companyName cannot be empty'),
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('role cannot be empty'),
  body('jobDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('jobDescription cannot be empty'),
  body('jobType')
    .optional()
    .trim()
    .isIn(['Full-time', 'Part-time', 'Internship', 'Remote', 'Contract'])
    .withMessage('jobType must be one of: Full-time, Part-time, Internship, Remote, Contract'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('location cannot be empty'),
  body('status')
    .optional()
    .isIn(['active', 'closed', 'draft'])
    .withMessage('status must be active, closed, or draft'),
  handleValidationErrors,
];

module.exports = {
  validateCreateJob,
  validateUpdateJob,
};
