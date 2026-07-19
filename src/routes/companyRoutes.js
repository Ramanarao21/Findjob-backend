const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompanyById,
  getCompanyJobs,
  createCompany,
  updateCompany,
} = require('../controllers/companyController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Public routes for companies
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.get('/:id/jobs', getCompanyJobs);

// Protected routes for recruiters
router.post('/', verifyToken, authorizeRoles('recruiter'), createCompany);
router.put('/:id', verifyToken, authorizeRoles('recruiter'), updateCompany);

module.exports = router;
