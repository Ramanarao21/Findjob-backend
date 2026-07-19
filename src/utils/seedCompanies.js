const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Company = require('../models/companyModel');
const Job = require('../models/jobModel');
const User = require('../models/userModel');

const seedCompaniesData = [
  {
    name: "TechFlow",
    logo: "TF",
    logoColor: "#6366f1",
    logoBg: "#eef2ff",
    industry: "Software",
    tagline: "Building the backbone of the modern internet.",
    rating: 4.8,
    reviewCount: "1.2k",
    openRoles: 3,
    size: "500 – 1,000 employees",
    hq: "Austin, TX",
    bannerGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    about: [
      "TechFlow was founded in 2017 with one mission: make developer tooling invisible. Today, over 40,000 engineering teams rely on our platform to ship faster, collaborate better, and scale with confidence.",
      "We are a remote-first company with hubs in Austin, London, and Singapore. Our culture is built on radical transparency, deep ownership, and a relentless bias for action."
    ],
    reviews: [
      { rating: 5, author: "Senior Engineer", tenure: "3 years at company", title: "Best engineering culture I've experienced", body: "The autonomy and trust given to engineers here is unmatched. Every problem is genuinely hard and rewarding. Management actually listens and acts on feedback." },
      { rating: 4, author: "Product Manager", tenure: "2 years at company", title: "High growth, high impact", body: "Incredible pace of innovation. The work is meaningful and the team is world-class. Can be intense at times but very rewarding overall." },
      { rating: 5, author: "DevOps Lead", tenure: "1 year at company", title: "Technically challenging and collaborative", body: "Great stack, great people. I've grown more here in one year than in the previous three combined. Highly recommended for senior engineers." }
    ],
    ratingBreakdown: { 5: 68, 4: 20, 3: 8, 2: 2, 1: 2 },
    totalReviews: 342,
    jobs: [
      { title: "Staff Backend Engineer", location: "Remote / Austin", salaryMin: 180, salaryMax: 240, type: "full-time", description: "Design and scale resilient backend services using Go and Kubernetes.", skillsRequired: ["Go", "Kubernetes", "Microservices"] },
      { title: "UI/UX Designer", location: "Austin, TX", salaryMin: 120, salaryMax: 160, type: "full-time", description: "Craft modern design systems and beautiful developer tooling interfaces.", skillsRequired: ["Figma", "Design Systems", "User Research"] },
      { title: "Technical Recruiter", location: "Austin, TX / Hybrid", salaryMin: 90, salaryMax: 120, type: "full-time", description: "Scale our world-class engineering team across global hubs.", skillsRequired: ["Talent Ops", "Technical Sourcing"] }
    ]
  },
  {
    name: "GreenGrid",
    logo: "GG",
    logoColor: "#10b981",
    logoBg: "#d1fae5",
    industry: "Sustainability",
    tagline: "Powering a cleaner planet through smart energy.",
    rating: 4.2,
    reviewCount: "850",
    openRoles: 2,
    size: "200 – 500 employees",
    hq: "San Francisco, CA",
    bannerGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    about: [
      "GreenGrid is a clean-energy technology company helping utilities and enterprises optimize their energy consumption through AI-driven analytics. Founded in 2019, we've already helped reduce carbon emissions by over 2 million tonnes.",
      "We believe business and sustainability are not at odds — they're aligned. Our team of scientists, engineers, and policy experts work together to create a measurable impact on the planet."
    ],
    reviews: [
      { rating: 4, author: "Data Scientist", tenure: "2 years at company", title: "Purposeful work with a great team", body: "The mission is real and you can see the impact of your work. The team is collaborative and leadership is accessible. Growth opportunities are solid." },
      { rating: 5, author: "Climate Policy Analyst", tenure: "1.5 years at company", title: "Doing work that matters", body: "Rare chance to apply technical skills to a genuine global challenge. Benefits are excellent and the remote culture is well-managed." },
      { rating: 4, author: "Frontend Engineer", tenure: "1 year at company", title: "Great place for mission-driven engineers", body: "Tech stack is modern and the team is smart. Sometimes processes are still maturing (startup phase) but overall a great experience." }
    ],
    ratingBreakdown: { 5: 45, 4: 35, 3: 12, 2: 5, 1: 3 },
    totalReviews: 198,
    jobs: [
      { title: "Climate Data Engineer", location: "Remote", salaryMin: 130, salaryMax: 170, type: "full-time", description: "Build scalable data pipelines for processing energy sensor streams.", skillsRequired: ["Python", "Spark", "PostgreSQL"] },
      { title: "Sustainability Analyst", location: "San Francisco, CA", salaryMin: 95, salaryMax: 125, type: "full-time", description: "Analyze ESG policy compliance and carbon emission reduction metrics.", skillsRequired: ["ESG", "Policy", "Data Analysis"] }
    ]
  },
  {
    name: "NexusPay",
    logo: "NP",
    logoColor: "#f59e0b",
    logoBg: "#fef3c7",
    industry: "Fintech",
    tagline: "Reimagining global payments for everyone.",
    rating: 4.9,
    reviewCount: "2.1k",
    openRoles: 4,
    size: "1,000 – 5,000 employees",
    hq: "New York, NY",
    bannerGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    about: [
      "NexusPay is a global fintech company processing over $50B in transactions annually across 120 countries. We build the payment rails that power thousands of businesses — from solo creators to Fortune 500 enterprises.",
      "Our engineering teams move fast, own their products end-to-end, and operate with a startup mindset inside a scaled organization. We invest heavily in our people's growth and well-being."
    ],
    reviews: [
      { rating: 5, author: "Senior SWE", tenure: "4 years at company", title: "World-class engineering org", body: "The scale of problems you work on is mind-blowing. Huge investment in internal tooling and developer experience. Best place I've ever worked." },
      { rating: 5, author: "Product Designer", tenure: "2 years at company", title: "Design is truly valued here", body: "Design has a real seat at the table. Fast iteration cycles, great user research culture, and leadership actually trusts the design team." },
      { rating: 4, author: "Risk Analyst", tenure: "3 years at company", title: "High impact, competitive comp", body: "Compensation is top-of-market and the problems are complex. Can be demanding but the rewards and career growth are exceptional." }
    ],
    ratingBreakdown: { 5: 75, 4: 18, 3: 5, 2: 1, 1: 1 },
    totalReviews: 612,
    jobs: [
      { title: "Payments Infrastructure Engineer", location: "New York, NY", salaryMin: 200, salaryMax: 280, type: "full-time", description: "Build high-throughput, fault-tolerant financial settlement engines.", skillsRequired: ["Java", "Kafka", "Distributed Systems"] },
      { title: "Senior Product Designer", location: "Remote", salaryMin: 150, salaryMax: 200, type: "full-time", description: "Lead end-to-end UX architecture for global checkout flows.", skillsRequired: ["Figma", "Payments", "Design Systems"] },
      { title: "Fraud Risk Analyst", location: "New York, NY / Hybrid", salaryMin: 110, salaryMax: 150, type: "full-time", description: "Deploy real-time ML models to combat credit card fraud.", skillsRequired: ["Risk", "ML", "Python"] },
      { title: "Growth Marketing Manager", location: "New York, NY", salaryMin: 120, salaryMax: 160, type: "full-time", description: "Drive B2B enterprise acquisition campaigns across North America.", skillsRequired: ["Growth", "B2B", "SEO"] }
    ]
  },
  {
    name: "PulseCare",
    logo: "PC",
    logoColor: "#ec4899",
    logoBg: "#fce7f3",
    industry: "Healthcare",
    tagline: "Technology that puts patient care first.",
    rating: 4.0,
    reviewCount: "540",
    openRoles: 2,
    size: "100 – 200 employees",
    hq: "Boston, MA",
    bannerGradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    about: [
      "PulseCare builds AI-powered clinical decision support tools used by over 800 hospitals across the US and Canada. Our software helps physicians make faster, more accurate diagnoses at the point of care.",
      "We are a mission-driven team of clinicians, engineers, and data scientists united by a single goal: save lives through better technology. We move deliberately, prioritizing patient safety and regulatory excellence."
    ],
    reviews: [
      { rating: 4, author: "Clinical Informatics Lead", tenure: "2 years at company", title: "Meaningful work in a strong team", body: "The clinical rigor here is exceptional. Every feature goes through serious validation. If you care about healthcare impact, this is the place." },
      { rating: 4, author: "ML Engineer", tenure: "1.5 years at company", title: "Complex problems, great collaboration", body: "Fascinating ML challenges in a regulated domain. The team is brilliant and humble. Slower pace than a pure startup but very intentional." },
      { rating: 5, author: "UX Researcher", tenure: "1 year at company", title: "User research actually drives decisions", body: "I've never been at a company where research is so well integrated into the product process. Clinical users are fascinating to design for." }
    ],
    ratingBreakdown: { 5: 38, 4: 42, 3: 15, 2: 3, 1: 2 },
    totalReviews: 127,
    jobs: [
      { title: "Clinical ML Engineer", location: "Boston, MA / Hybrid", salaryMin: 150, salaryMax: 190, type: "full-time", description: "Develop medical imaging diagnostic models with PyTorch.", skillsRequired: ["Python", "Healthcare AI", "PyTorch"] },
      { title: "Regulatory Affairs Specialist", location: "Boston, MA", salaryMin: 90, salaryMax: 120, type: "full-time", description: "Manage FDA 510(k) clearances and medical device compliance.", skillsRequired: ["FDA", "510k", "Compliance"] }
    ]
  },
  {
    name: "OmniBotics",
    logo: "OB",
    logoColor: "#8b5cf6",
    logoBg: "#ede9fe",
    industry: "Robotics",
    tagline: "Building robots that work alongside humans.",
    rating: 4.9,
    reviewCount: "320",
    openRoles: 3,
    size: "200 – 500 employees",
    hq: "Pittsburgh, PA",
    bannerGradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    about: [
      "OmniBotics is building the next generation of collaborative robots for manufacturing, logistics, and healthcare. Our robots are designed to work safely alongside humans — no cage required.",
      "We combine advances in computer vision, reinforcement learning, and mechanical engineering to create machines that are intuitive, adaptable, and genuinely useful. Backed by top-tier VCs with a clear path to IPO."
    ],
    reviews: [
      { rating: 5, author: "Robotics Engineer", tenure: "2 years at company", title: "Cutting-edge work, exceptional team", body: "The technical depth here is unreal. We're solving problems that have never been solved before. Every day is challenging and energizing." },
      { rating: 5, author: "Computer Vision Lead", tenure: "3 years at company", title: "Best job of my career", body: "Incredible colleagues, ambitious mission, and real resources to do the work right. The hardware-software integration challenges are endlessly interesting." },
      { rating: 4, author: "Manufacturing Engineer", tenure: "1 year at company", title: "Great place for robotics talent", body: "Strong engineering culture and a genuine commitment to safety. Processes are still maturing but leadership is thoughtful and transparent." }
    ],
    ratingBreakdown: { 5: 72, 4: 20, 3: 6, 2: 1, 1: 1 },
    totalReviews: 89,
    jobs: [
      { title: "Motion Planning Engineer", location: "Pittsburgh, PA", salaryMin: 160, salaryMax: 220, type: "full-time", description: "Implement real-time trajectory optimization for industrial robotic arms.", skillsRequired: ["C++", "ROS", "Kinematics"] },
      { title: "Computer Vision Engineer", location: "Pittsburgh, PA / Hybrid", salaryMin: 150, salaryMax: 210, type: "full-time", description: "Train 3D object detection models for autonomous warehouse navigation.", skillsRequired: ["PyTorch", "OpenCV", "3D Vision"] },
      { title: "Hardware Engineer", location: "Pittsburgh, PA", salaryMin: 130, salaryMax: 180, type: "full-time", description: "Design motor controller PCBs and embedded safety circuits.", skillsRequired: ["Embedded", "PCB", "Hardware"] }
    ]
  },
  {
    name: "ShieldGuard",
    logo: "SG",
    logoColor: "#14b8a6",
    logoBg: "#ccfbf1",
    industry: "Security",
    tagline: "Zero-trust security for the modern enterprise.",
    rating: 4.6,
    reviewCount: "910",
    openRoles: 3,
    size: "500 – 1,000 employees",
    hq: "Washington, DC",
    bannerGradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    about: [
      "ShieldGuard provides enterprise-grade zero-trust security infrastructure trusted by governments, defense contractors, and Fortune 100 companies. Our platform protects over 3 million identities worldwide.",
      "We operate at the intersection of national security and modern software engineering. Our teams are small, empowered, and deeply technical — every engineer ships code that matters."
    ],
    reviews: [
      { rating: 5, author: "Security Engineer", tenure: "3 years at company", title: "Important work, excellent team", body: "The caliber of engineers here is exceptional. The problems are genuinely hard and the stakes are real. Compensation is competitive and the mission is clear." },
      { rating: 4, author: "Threat Intelligence Analyst", tenure: "2 years at company", title: "High-impact security work", body: "Great exposure to complex, real-world threat landscapes. The work is meaningful and the team is collaborative. Benefits package is strong." },
      { rating: 5, author: "Infrastructure Engineer", tenure: "1.5 years at company", title: "Best security team I've worked with", body: "Strong culture of security-first thinking that permeates everything. Excellent mentorship and clear growth paths." }
    ],
    ratingBreakdown: { 5: 60, 4: 28, 3: 8, 2: 2, 1: 2 },
    totalReviews: 276,
    jobs: [
      { title: "Staff Security Engineer", location: "Washington, DC / Remote", salaryMin: 180, salaryMax: 240, type: "full-time", description: "Lead architectural security reviews for cloud zero-trust platforms.", skillsRequired: ["Zero Trust", "Cloud", "IAM"] },
      { title: "Threat Intelligence Analyst", location: "Washington, DC", salaryMin: 120, salaryMax: 160, type: "full-time", description: "Analyze global APT threat vectors and produce actionable intelligence reports.", skillsRequired: ["OSINT", "Malware", "Threat Intel"] },
      { title: "Identity Platform Engineer", location: "Remote", salaryMin: 150, salaryMax: 200, type: "full-time", description: "Engine OAuth2 / OIDC authentication protocols for government scale.", skillsRequired: ["IAM", "OAuth", "Go"] }
    ]
  }
];

const seedCompanies = async () => {
  try {
    const connString = process.env.MONGO_URI;
    if (!connString) {
      console.error('❌ MONGO_URI missing in .env');
      process.exit(1);
    }

    await mongoose.connect(connString);
    console.log('✅ Connected to MongoDB for seeding companies...');

    // Find or create default recruiter user
    let defaultRecruiter = await User.findOne({ role: 'recruiter' });
    if (!defaultRecruiter) {
      defaultRecruiter = await User.create({
        fullName: 'Talent Acquisition Team',
        email: 'recruiter@findjob.com',
        password: '$2b$10$YourHashedPasswordPlaceholderString123',
        role: 'recruiter',
      });
      console.log('👤 Default recruiter created for company jobs:', defaultRecruiter.email);
    }

    // Seed companies
    for (const cData of seedCompaniesData) {
      const { jobs, ...compFields } = cData;

      // Upsert company
      let company = await Company.findOne({ name: compFields.name });
      if (company) {
        Object.assign(company, compFields);
        company.postedBy = defaultRecruiter._id;
        await company.save();
        console.log(`🔄 Updated existing company: ${company.name}`);
      } else {
        company = await Company.create({
          ...compFields,
          postedBy: defaultRecruiter._id,
        });
        console.log(`✨ Created new company: ${company.name}`);
      }

      // Create linked jobs for this company
      let activeJobsCount = 0;
      for (const jobItem of jobs) {
        const existingJob = await Job.findOne({
          title: jobItem.title,
          company: company.name,
        });

        if (!existingJob) {
          await Job.create({
            title: jobItem.title,
            company: company.name,
            location: jobItem.location,
            salaryMin: jobItem.salaryMin,
            salaryMax: jobItem.salaryMax,
            type: jobItem.type,
            description: jobItem.description,
            skillsRequired: jobItem.skillsRequired,
            postedBy: defaultRecruiter._id,
            status: 'open',
          });
          console.log(`   📌 Created job for ${company.name}: ${jobItem.title}`);
        }
        activeJobsCount++;
      }

      // Update openRoles count on company
      company.openRoles = activeJobsCount;
      await company.save();
    }

    console.log('\n🎉 ALL 6 COMPANIES AND THEIR OPEN JOBS HAVE BEEN SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedCompanies();
