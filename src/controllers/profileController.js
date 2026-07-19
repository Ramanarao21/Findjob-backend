const mongoose = require('mongoose');
const User = require('../models/userModel');
const {
  DEFAULT_AVATAR_URL,
  uploadStreamToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');

/**
 * Format user data before returning in response
 */
const formatUserResponse = (userDoc) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  if (!userObj.avatarUrl) {
    userObj.avatarUrl = process.env.DEFAULT_AVATAR_URL || DEFAULT_AVATAR_URL;
  }
  return userObj;
};

/**
 * @desc    Get logged-in user's full profile
 * @route   GET /api/profile/me
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user's profile (fullName, jobTitle, location)
 * @route   PUT /api/profile/me
 * @access  Private
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { fullName, jobTitle, location } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName !== undefined) {
      if (!fullName.trim()) {
        return res.status(400).json({ success: false, message: 'Full name cannot be empty' });
      }
      user.fullName = fullName.trim();
    }

    if (jobTitle !== undefined) {
      user.jobTitle = jobTitle.trim();
    }

    if (location !== undefined) {
      user.location = location.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Public view of another user's profile
 * @route   GET /api/profile/:userId
 * @access  Public / Protected
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    // Exclude sensitive fields: email, password
    const user = await User.findById(userId).select('-email -password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    return res.status(200).json({ success: true, data: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or replace avatar image in Cloudinary
 * @route   POST /api/profile/me/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload as avatar',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old avatar from Cloudinary if user has a stored publicId
    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId, 'image');
    }

    // Upload new image buffer to Cloudinary
    const result = await uploadStreamToCloudinary(
      req.file.buffer,
      'findjob/avatars',
      'image',
      `avatar_${user._id}`
    );

    user.avatarUrl = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete avatar image (revert to default avatar)
 * @route   DELETE /api/profile/me/avatar
 * @access  Private
 */
const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId, 'image');
    }

    user.avatarUrl = process.env.DEFAULT_AVATAR_URL || DEFAULT_AVATAR_URL;
    user.avatarPublicId = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar reset to default successfully',
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or replace resume file (PDF/DOCX) in Cloudinary
 * @route   POST /api/profile/me/resume
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please select a PDF or DOCX file to upload as resume',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old resume from Cloudinary if existing
    if (user.resumePublicId) {
      await deleteFromCloudinary(user.resumePublicId, 'raw');
    }

    // Upload new resume buffer to Cloudinary
    const result = await uploadStreamToCloudinary(
      req.file.buffer,
      'findjob/resumes',
      'raw',
      `resume_${user._id}`
    );

    user.resumeUrl = result.secure_url;
    user.resumeFileName = req.file.originalname;
    user.resumePublicId = result.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully to Cloudinary',
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete resume file
 * @route   DELETE /api/profile/me/resume
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resumePublicId) {
      await deleteFromCloudinary(user.resumePublicId, 'raw');
    }

    user.resumeUrl = '';
    user.resumeFileName = '';
    user.resumePublicId = '';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or remove skills from candidate profile
 * @route   PATCH /api/profile/me/skills
 * @access  Private
 */
const updateSkills = async (req, res, next) => {
  try {
    const { action, skill } = req.body;

    if (!action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be either 'add' or 'remove'",
      });
    }

    if (!skill || typeof skill !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid skill string',
      });
    }

    const trimmedSkill = skill.trim();

    if (action === 'add') {
      if (trimmedSkill.length === 0 || trimmedSkill.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Skill string must be between 1 and 30 characters long',
        });
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'add') {
      // Case-insensitive duplicate check
      const exists = user.skills.some(
        (s) => s.toLowerCase() === trimmedSkill.toLowerCase()
      );
      if (!exists) {
        user.skills.push(trimmedSkill);
      }
    } else if (action === 'remove') {
      user.skills = user.skills.filter(
        (s) => s.toLowerCase() !== trimmedSkill.toLowerCase()
      );
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `Skill ${action === 'add' ? 'added' : 'removed'} successfully`,
      data: user.skills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getPublicProfile,
  uploadAvatar,
  deleteAvatar,
  uploadResume,
  deleteResume,
  updateSkills,
};
