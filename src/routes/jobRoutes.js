const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const {
  applyForJob,
  getJobApplicants,
} = require('../controllers/applicationController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Public route for all jobs & Recruiter job creation
router.get('/', getJobs);
router.post('/', verifyToken, authorizeRoles('recruiter'), createJob);

// Recruiter specific route (MUST be placed before /:jobId to avoid route collision)
router.get('/recruiter/me', verifyToken, authorizeRoles('recruiter'), getRecruiterJobs);

// Single Job routes
router.get('/:jobId', getJobById);
router.put('/:jobId', verifyToken, authorizeRoles('recruiter'), updateJob);
router.delete('/:jobId', verifyToken, authorizeRoles('recruiter'), deleteJob);

// Job Applications sub-routes
router.post('/:jobId/apply', verifyToken, authorizeRoles('candidate'), applyForJob);
router.get('/:jobId/applicants', verifyToken, authorizeRoles('recruiter'), getJobApplicants);

module.exports = router;
