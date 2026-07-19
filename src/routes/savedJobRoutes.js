const express = require('express');
const router = express.Router();
const {
  saveJob,
  unsaveJob,
  getSavedJobs,
} = require('../controllers/savedJobController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

// Protect all saved job routes for candidates only
router.use(verifyToken, authorizeRoles('candidate'));

router.get('/', getSavedJobs);
router.post('/:jobId', saveJob);
router.delete('/:jobId', unsaveJob);

module.exports = router;
