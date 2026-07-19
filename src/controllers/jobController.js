const mongoose = require('mongoose');
const Job = require('../models/jobModel');
const Application = require('../models/applicationModel');
const SavedJob = require('../models/savedJobModel');

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Recruiter only)
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      type,
      salaryMin,
      salaryMax,
      currency,
      experienceMin,
      experienceYears,
      description,
      requirements,
      skillsRequired,
    } = req.body;

    // Validate required fields
    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, company, and description',
      });
    }

    const job = await Job.create({
      title: title.trim(),
      company: company.trim(),
      location: location ? location.trim() : '',
      type: type || 'full-time',
      salaryMin: salaryMin !== undefined ? Number(salaryMin) : undefined,
      salaryMax: salaryMax !== undefined ? Number(salaryMax) : undefined,
      currency: currency ? currency.trim() : 'USD',
      experienceMin: experienceMin !== undefined ? Number(experienceMin) : (experienceYears !== undefined ? Number(experienceYears) : 0),
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : typeof requirements === 'string'
        ? requirements.split(',').map((s) => s.trim())
        : [],
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired
        : typeof skillsRequired === 'string'
        ? skillsRequired.split(',').map((s) => s.trim())
        : [],
      postedBy: req.user.id,
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs with pagination and filters
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res, next) => {
  try {
    const {
      search,
      role,
      location,
      type,
      jobType,
      skills,
      minSalary,
      salary,
      salaryMin,
      currency,
      experience,
      experienceMin,
      experienceYears,
      page = 1,
      limit = 10,
      status,
    } = req.query;

    const query = {};

    // Filter by status (default to 'open')
    if (status) {
      if (status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'open';
    }

    // Role / Search filter
    const searchVal = search || role;
    if (searchVal && searchVal.trim() !== '') {
      const searchRegex = new RegExp(searchVal.trim(), 'i');
      query.$or = [{ title: searchRegex }, { company: searchRegex }, { description: searchRegex }];
    }

    // Location search
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Job type search
    const typeVal = type || jobType;
    if (typeVal && typeVal.trim() !== '') {
      query.type = typeVal.trim().toLowerCase();
    }

    // Skills search (comma-separated string or array)
    if (skills && skills.trim() !== '') {
      const skillsArray = skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
      query.skillsRequired = { $in: skillsArray };
    }

    // Min Salary filter
    const salVal = minSalary !== undefined && minSalary !== '' ? minSalary : (salary !== undefined && salary !== '' ? salary : salaryMin);
    if (salVal !== undefined && salVal !== '' && !isNaN(Number(salVal)) && Number(salVal) > 0) {
      const minSalNum = Number(salVal);
      // Job max salary should be >= min salary requested
      query.$and = (query.$and || []).concat([
        {
          $or: [
            { salaryMax: { $gte: minSalNum } },
            { salaryMin: { $gte: minSalNum } },
          ],
        },
      ]);
    }

    // Currency filter
    if (currency && currency.trim() !== '') {
      const currStr = currency.trim();
      let matchedCurrencies = [currStr];
      if (currStr === '$' || currStr.toUpperCase() === 'USD') {
        matchedCurrencies = ['USD', '$'];
      } else if (currStr === '₹' || currStr.toUpperCase() === 'INR') {
        matchedCurrencies = ['INR', '₹'];
      } else if (currStr === '£' || currStr.toUpperCase() === 'GBP') {
        matchedCurrencies = ['GBP', '£'];
      } else if (currStr === '€' || currStr.toUpperCase() === 'EUR') {
        matchedCurrencies = ['EUR', '€'];
      }
      query.currency = { $in: matchedCurrencies };
    }

    // Experience filter
    const expVal = experience !== undefined && experience !== '' ? experience : (experienceMin !== undefined && experienceMin !== '' ? experienceMin : experienceYears);
    if (expVal !== undefined && expVal !== '' && !isNaN(Number(expVal))) {
      const expNum = Number(expVal);
      if (expNum >= 0) {
        // Filter jobs where required minimum experience is <= candidate's experience
        query.experienceMin = { $lte: expNum };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('postedBy', 'fullName avatarUrl company');

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      data: jobs,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get jobs posted by the currently logged-in recruiter
 * @route   GET /api/jobs/recruiter/me
 * @access  Private (Recruiter only)
 */
const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single job by ID
 * @route   GET /api/jobs/:jobId
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
      });
    }

    const job = await Job.findById(jobId).populate('postedBy', 'fullName avatarUrl');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a job by ID
 * @route   PUT /api/jobs/:jobId
 * @access  Private (Recruiter owner only)
 */
const updateJob = async (req, res, next) => {
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

    // Ownership check
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update jobs posted by yourself',
      });
    }

    const allowedUpdates = [
      'title',
      'company',
      'location',
      'type',
      'salaryMin',
      'salaryMax',
      'currency',
      'experienceMin',
      'experienceYears',
      'description',
      'requirements',
      'skillsRequired',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    job.updatedAt = Date.now();
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete job and cascade-delete related Applications and SavedJobs
 * @route   DELETE /api/jobs/:jobId
 * @access  Private (Recruiter owner only)
 */
const deleteJob = async (req, res, next) => {
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

    // Ownership check
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete jobs posted by yourself',
      });
    }

    // Cascade delete related applications and saved jobs
    await Application.deleteMany({ job: jobId });
    await SavedJob.deleteMany({ job: jobId });
    await job.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Job and all related applications deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
};
