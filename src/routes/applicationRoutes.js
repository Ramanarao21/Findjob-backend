const express = require('express');
const router = express.Router();
const {
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// GET /api/applications/me - Get candidate applications
router.get('/me', verifyToken, authorizeRoles('candidate'), getMyApplications);

// PATCH /api/applications/:applicationId/status - Recruiter updates status
router.patch(
  '/:applicationId/status',
  verifyToken,
  authorizeRoles('recruiter'),
  updateApplicationStatus
);

module.exports = router;
