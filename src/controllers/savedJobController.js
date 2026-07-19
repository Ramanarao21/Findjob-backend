const mongoose = require('mongoose');
const SavedJob = require('../models/savedJobModel');
const Job = require('../models/jobModel');

/**
 * @desc    Save a job for candidate
 * @route   POST /api/saved-jobs/:jobId
 * @access  Private (Candidate only)
 */
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    // Check if already saved to provide clean 409 response
    const existingSave = await SavedJob.findOne({
      user: req.user.id,
      job: jobId,
    });

    if (existingSave) {
      return res.status(409).json({
        success: false,
        message: 'Job is already saved in your bookmarks',
      });
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      job: jobId,
    });

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Job is already saved in your bookmarks',
      });
    }
    next(error);
  }
};

/**
 * @desc    Unsave/remove a bookmarked job
 * @route   DELETE /api/saved-jobs/:jobId
 * @access  Private (Candidate only)
 */
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    // Match either job ID or SavedJob record ID for flexibility
    const deletedSave = await SavedJob.findOneAndDelete({
      user: req.user.id,
      $or: [{ job: jobId }, { _id: jobId }],
    });

    if (!deletedSave) {
      return res.status(404).json({
        success: false,
        message: 'Saved job record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs successfully',
      removedJobId: jobId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all saved jobs for candidate
 * @route   GET /api/saved-jobs
 * @access  Private (Candidate only)
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const rawSavedJobs = await SavedJob.find({ user: req.user.id })
      .sort({ savedAt: -1 })
      .populate({
        path: 'job',
        populate: { path: 'postedBy', select: 'fullName avatarUrl company' },
      });

    // Clean up orphaned records if job was deleted
    const validSavedJobs = [];
    const orphanIds = [];

    for (const item of rawSavedJobs) {
      if (item.job) {
        validSavedJobs.push(item);
      } else {
        orphanIds.push(item._id);
      }
    }

    if (orphanIds.length > 0) {
      await SavedJob.deleteMany({ _id: { $in: orphanIds } });
    }

    return res.status(200).json({
      success: true,
      count: validSavedJobs.length,
      data: validSavedJobs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
};
