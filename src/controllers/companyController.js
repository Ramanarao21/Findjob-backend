const mongoose = require('mongoose');
const Company = require('../models/companyModel');
const Job = require('../models/jobModel');

/**
 * @desc    Get all companies with search & industry filters
 * @route   GET /api/companies
 * @access  Public
 */
const getCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { industry: searchRegex },
        { tagline: searchRegex },
      ];
    }

    if (industry && industry.trim() && industry !== 'All') {
      query.industry = new RegExp(`^${industry.trim()}$`, 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const totalCompanies = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Dynamic count of open jobs from Job collection for each company
    const companiesWithJobs = await Promise.all(
      companies.map(async (comp) => {
        const compObj = comp.toObject();
        const activeJobsCount = await Job.countDocuments({
          company: new RegExp(`^${comp.name}$`, 'i'),
          status: 'open',
        });
        compObj.openRoles = activeJobsCount || compObj.openRoles || 0;
        return compObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: companiesWithJobs.length,
      total: totalCompanies,
      page: pageNum,
      pages: Math.ceil(totalCompanies / limitNum),
      data: companiesWithJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single company profile by ID or Name along with its jobs
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let company = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      company = await Company.findById(id);
    }

    if (!company) {
      // Fallback search by company name or slug
      company = await Company.findOne({ name: new RegExp(`^${id}$`, 'i') });
    }

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    const companyObj = company.toObject();

    // Fetch active jobs for this company
    const jobs = await Job.find({
      company: new RegExp(`^${company.name}$`, 'i'),
      status: 'open',
    }).sort({ createdAt: -1 });

    companyObj.jobs = jobs;
    companyObj.openRoles = jobs.length;

    return res.status(200).json({
      success: true,
      data: companyObj,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active open jobs for a specific company
 * @route   GET /api/companies/:id/jobs
 * @access  Public
 */
const getCompanyJobs = async (req, res, next) => {
  try {
    const { id } = req.params;

    let company = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      company = await Company.findById(id);
    }
    if (!company) {
      company = await Company.findOne({ name: new RegExp(`^${id}$`, 'i') });
    }

    const companyName = company ? company.name : id;

    const jobs = await Job.find({
      company: new RegExp(`^${companyName}$`, 'i'),
      status: 'open',
    }).sort({ createdAt: -1 });

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
 * @desc    Create a new company profile (Recruiter only)
 * @route   POST /api/companies
 * @access  Private (Recruiter)
 */
const createCompany = async (req, res, next) => {
  try {
    const {
      name,
      logo,
      logoColor,
      logoBg,
      industry,
      tagline,
      size,
      hq,
      bannerGradient,
      about,
    } = req.body;

    if (!name || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Company name and industry are required',
      });
    }

    const existing = await Company.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A company with this name already exists',
      });
    }

    const newCompany = await Company.create({
      name: name.trim(),
      logo: logo || name.trim().slice(0, 2).toUpperCase(),
      logoColor: logoColor || '#4f46e5',
      logoBg: logoBg || '#eef2ff',
      industry: industry.trim(),
      tagline: tagline || '',
      size: size || '100 – 500 employees',
      hq: hq || 'Remote',
      bannerGradient: bannerGradient || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      about: Array.isArray(about) ? about : [about].filter(Boolean),
      postedBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Company profile created successfully',
      data: newCompany,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update company profile (Recruiter / Owner)
 * @route   PUT /api/companies/:id
 * @access  Private (Recruiter)
 */
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    const updated = await Company.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  getCompanyJobs,
  createCompany,
  updateCompany,
};
