const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  uploadAvatar,
  deleteAvatar,
  uploadResume,
  deleteResume,
  updateSkills,
} = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { uploadAvatar: multerAvatar, uploadResume: multerResume } = require('../config/uploadConfig');

// My Profile routes
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

// Avatar management
router.post('/me/avatar', verifyToken, multerAvatar, uploadAvatar);
router.delete('/me/avatar', verifyToken, deleteAvatar);

// Resume management
router.post('/me/resume', verifyToken, multerResume, uploadResume);
router.delete('/me/resume', verifyToken, deleteResume);

// Skills management
router.patch('/me/skills', verifyToken, updateSkills);

// Public profile view
router.get('/:userId', getPublicProfile);

module.exports = router;
