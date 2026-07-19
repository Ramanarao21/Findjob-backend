const mongoose = require('mongoose');
const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');

/**
 * @desc    Apply for a job
 * @route   POST /api/jobs/:jobId/apply
 * @access  Private (Candidate only)
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverNote } = req.body;

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

    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to a closed job posting',
      });
    }

    // Fetch candidate profile to check for resume
    const candidateUser = await User.findById(req.user.id);
    if (!candidateUser || !candidateUser.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume before applying to jobs',
      });
    }

    // Check for existing application
    const existingApp = await Application.findOne({
      job: jobId,
      candidate: req.user.id,
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }

    // Create Application snapshot
    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      resumeUrl: candidateUser.resumeUrl,
      resumeFileName: candidateUser.resumeFileName || 'resume.pdf',
      coverNote: coverNote ? coverNote.trim() : '',
      status: 'applied',
    });

    // Increment applicantsCount on Job
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all job applications submitted by the logged-in candidate
 * @route   GET /api/applications/me
 * @access  Private (Candidate only)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .sort({ appliedAt: -1 })
      .populate({
        path: 'job',
        select: 'title company location type salaryMin salaryMax status',
        populate: { path: 'postedBy', select: 'fullName avatarUrl' },
      });

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applicants for a specific job (Recruiter owner only)
 * @route   GET /api/jobs/:jobId/applicants
 * @access  Private (Recruiter owner only)
 */
const getJobApplicants = async (req, res, next) => {
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

    // Recruiter ownership check
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view applicants for your own posted jobs',
      });
    }

    const applications = await Application.find({ job: jobId })
      .sort({ appliedAt: -1 })
      .populate('candidate', 'fullName avatarUrl skills resumeUrl resumeFileName email jobTitle location');

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update application status (applied, under_review, shortlisted, rejected, hired)
 * @route   PATCH /api/applications/:applicationId/status
 * @access  Private (Recruiter owner only)
 */
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'rejected', 'hired'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Ownership check via application's job postedBy
    if (!application.job || application.job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update applications for your own posted jobs',
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'`,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
};
