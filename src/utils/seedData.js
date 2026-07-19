const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const User = require('../models/userModel');
const Job = require('../models/jobModel');
const SavedJob = require('../models/savedJobModel');
const Application = require('../models/applicationModel');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await SavedJob.deleteMany({});
    await Application.deleteMany({});

    console.log('👤 Seeding default users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Create Recruiter
    const recruiter = await User.create({
      fullName: 'Sarah Jenkins',
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      role: 'recruiter',
      jobTitle: 'Senior Tech Talent Acquisition',
      location: 'San Francisco, CA',
      avatarUrl: '',
      company: 'TechCorp Global',
    });

    // 2. Create Candidate
    const candidate = await User.create({
      fullName: 'Alex Morgan',
      email: 'alex.candidate@example.com',
      password: hashedPassword,
      role: 'candidate',
      jobTitle: 'Full Stack React Engineer',
      location: 'Remote',
      avatarUrl: '',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'TailwindCSS'],
      resumeUrl: '',
      resumeFileName: '',
    });

    console.log(`✅ Recruiter Created: ${recruiter.email} (Password: password123)`);
    console.log(`✅ Candidate Created: ${candidate.email} (Password: password123)`);

    console.log('💼 Seeding job postings...');
    const dummyJobs = [
      {
        title: 'Senior Frontend React Developer',
        company: 'TechCorp Global',
        location: 'Remote',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 120000,
        salaryMax: 150000,
        experienceMin: 5,
        description:
          'We are seeking an experienced Frontend Developer with strong expertise in React 18, Next.js, TypeScript, and modern CSS architecture.',
        requirements: [
          '5+ years web development experience',
          'Deep knowledge of React, Next.js, and TypeScript',
          'Experience building responsive web dashboards and micro-frontends',
        ],
        skillsRequired: ['React', 'TypeScript', 'TailwindCSS', 'Redux', 'Next.js'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Full Stack MERN Developer (India)',
        company: 'Infosolutions India',
        location: 'Bengaluru, India',
        type: 'full-time',
        currency: 'INR',
        salaryMin: 800000,
        salaryMax: 1500000,
        experienceMin: 2,
        description:
          'Looking for a passionate Full Stack JavaScript Engineer proficient in MongoDB, Express, React, and Node.js for high scale ecommerce systems.',
        requirements: [
          '2+ years MERN stack experience',
          'Good knowledge of RESTful API architecture and MongoDB queries',
          'Clean code principles & state management',
        ],
        skillsRequired: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Backend Node.js Microservices Engineer',
        company: 'CloudScale Systems',
        location: 'San Francisco, CA',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 130000,
        salaryMax: 170000,
        experienceMin: 4,
        description:
          'Join our core cloud team building RESTful APIs, high-throughput Mongoose/MongoDB integrations, and microservices.',
        requirements: [
          '4+ years Node.js and Express experience',
          'Proficiency with MongoDB, Mongoose, and Redis caching',
          'Experience with JWT authentication, rate limiting, and Docker',
        ],
        skillsRequired: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Docker', 'Redis'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Senior DevOps & Cloud Infrastructure Engineer',
        company: 'CloudPulse Networks',
        location: 'Remote',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 135000,
        salaryMax: 175000,
        experienceMin: 4,
        description:
          'Manage CI/CD pipelines, Kubernetes clusters, and multi-region AWS cloud infrastructure to ensure 99.99% system availability.',
        requirements: [
          '4+ years of hands-on DevOps and Infrastructure experience',
          'Expertise in AWS (EC2, EKS, S3, CloudFront) and Terraform',
          'Strong proficiency in Docker, Kubernetes, and Helm',
          'Experience setting up automated CI/CD with GitHub Actions or GitLab CI',
        ],
        skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Bash'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Lead Product Manager (FinTech & Payments)',
        company: 'PayFlow Solutions',
        location: 'New York, NY',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 140000,
        salaryMax: 185000,
        experienceMin: 5,
        description:
          'Lead cross-functional engineering and design teams to build next-generation payment APIs, merchant checkouts, and financial dashboards.',
        requirements: [
          '5+ years Product Management experience in FinTech, Payments, or E-commerce',
          'Proven track record of defining product roadmaps and launching web/mobile products',
          'Deep understanding of user stories, wireframing, and agile methodologies',
          'Strong quantitative analysis and metric-driven decision making',
        ],
        skillsRequired: ['Product Management', 'Agile', 'FinTech', 'User Research', 'Roadmapping', 'Jira'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Product Manager - Growth & Mobile (India)',
        company: 'BharatPay FinTech',
        location: 'Mumbai, India',
        type: 'full-time',
        currency: 'INR',
        salaryMin: 1400000,
        salaryMax: 2400000,
        experienceMin: 3,
        description:
          'Lead product strategy for mobile payment apps catering to over 5 million daily active users in South Asia.',
        requirements: [
          '3+ years product management experience in B2C or mobile apps',
          'Expertise in A/B testing, user acquisition funnels, and retention metrics',
        ],
        skillsRequired: ['Product Management', 'Mobile', 'Analytics', 'Growth Hacking'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Data Engineer & Pipeline Specialist',
        company: 'DataSphere Analytics',
        location: 'Chicago, IL',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 125000,
        salaryMax: 160000,
        experienceMin: 3,
        description:
          'Design, build, and optimize scalable ETL data pipelines and warehouse architectures supporting real-time data streaming and analytics.',
        requirements: [
          '3+ years experience with Python, SQL, and Apache Spark',
          'Hands-on experience with Snowflake, BigQuery, or Redshift',
          'Familiarity with data orchestration tools like Airflow or Prefect',
        ],
        skillsRequired: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'ETL'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Cybersecurity & Penetration Testing Specialist',
        company: 'CyberShield Security Labs',
        location: 'Washington, DC',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 130000,
        salaryMax: 165000,
        experienceMin: 4,
        description:
          'Conduct vulnerability assessments, network penetration testing, and security code reviews to safeguard web application infrastructures.',
        requirements: [
          'CEH, OSCP, or CISSP certification preferred',
          'Deep understanding of OWASP Top 10 vulnerabilities and web security protocols',
          'Experience with SIEM tools, Wireshark, Metasploit, and Burp Suite',
        ],
        skillsRequired: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'OWASP', 'Linux', 'Ethical Hacking'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Lead UI/UX & Product Designer',
        company: 'PixelCraft Studios',
        location: 'Remote',
        type: 'remote',
        currency: 'USD',
        salaryMin: 110000,
        salaryMax: 145000,
        experienceMin: 4,
        description:
          'Craft intuitive, stunning user experiences and design systems for enterprise SaaS applications from low-fi wireframes to interactive Figma prototypes.',
        requirements: [
          '4+ years UI/UX product design experience',
          'Mastery of Figma, design systems, component libraries, and interactive prototyping',
          'Strong understanding of modern web design accessibility standards (WCAG)',
        ],
        skillsRequired: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing', 'User Research', 'Prototyping'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Junior UI/UX Designer (India)',
        company: 'DesignMatrix Gurgaon',
        location: 'Gurugram, India',
        type: 'full-time',
        currency: 'INR',
        salaryMin: 600000,
        salaryMax: 1000000,
        experienceMin: 1,
        description:
          'Design clean web and mobile user interfaces using Figma and create design system components.',
        requirements: [
          '1+ year experience or strong portfolio in UI/UX design',
          'Proficiency in Figma and Adobe Illustrator',
        ],
        skillsRequired: ['Figma', 'UI/UX', 'Wireframing'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Senior AI & Machine Learning Engineer',
        company: 'NeuralTech Dynamics',
        location: 'Austin, TX',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 150000,
        salaryMax: 195000,
        experienceMin: 4,
        description:
          'Develop and fine-tune large language models (LLMs), natural language processing pipelines, and predictive ML systems using PyTorch and HuggingFace.',
        requirements: [
          'Master’s or Bachelor’s degree in CS, AI, or related field',
          'Strong proficiency in Python, PyTorch/TensorFlow, and Scikit-Learn',
          'Experience building RAG pipelines, vector databases (Pinecone, ChromaDB), and API integrations',
        ],
        skillsRequired: ['Python', 'PyTorch', 'Machine Learning', 'LLMs', 'NLP', 'RAG', 'Vector Databases'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Site Reliability Engineer (SRE)',
        company: 'Infrastructure Scale Inc.',
        location: 'Seattle, WA',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 140000,
        salaryMax: 180000,
        experienceMin: 3,
        description:
          'Bridge the gap between operations and software engineering. Implement SLO/SLA monitoring, incident response automation, and infrastructure resilience.',
        requirements: [
          '3+ years in SRE or Systems Engineering roles',
          'Proficiency in Go, Python, or Bash',
          'Expertise in Prometheus, Grafana, Datadog, and cloud incident management',
        ],
        skillsRequired: ['SRE', 'Prometheus', 'Grafana', 'Go', 'Python', 'Kubernetes', 'AWS'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Mobile App Engineer (React Native & Flutter)',
        company: 'AppPulse Mobility',
        location: 'Remote',
        type: 'contract',
        currency: 'USD',
        salaryMin: 95000,
        salaryMax: 130000,
        experienceMin: 3,
        description:
          'Build and launch cross-platform iOS and Android mobile applications integrated with native device APIs and smooth UI transitions.',
        requirements: [
          '3+ years mobile development experience with React Native or Flutter',
          'Experience publishing apps on Apple App Store & Google Play Store',
          'Proficiency with Redux, WebSocket real-time feeds, and Push Notifications',
        ],
        skillsRequired: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Apps', 'TypeScript'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'QA & Test Automation Lead',
        company: 'TestMatrix Labs',
        location: 'Boston, MA',
        type: 'full-time',
        currency: 'USD',
        salaryMin: 100000,
        salaryMax: 135000,
        experienceMin: 4,
        description:
          'Architect end-to-end automated testing suites using Cypress, Playwright, and Selenium for complex enterprise applications.',
        requirements: [
          '4+ years test automation experience in Web & API testing',
          'Hands-on expertise with JavaScript/TypeScript testing tools (Cypress, Playwright, Jest)',
          'Experience integrating automated tests into CI/CD build pipelines',
        ],
        skillsRequired: ['QA Automation', 'Cypress', 'Playwright', 'Jest', 'Selenium', 'CI/CD'],
        postedBy: recruiter._id,
        status: 'open',
      },
      {
        title: 'Cloud DevOps Specialist (India)',
        company: 'CloudScale India',
        location: 'Hyderabad, India',
        type: 'full-time',
        currency: 'INR',
        salaryMin: 1200000,
        salaryMax: 2000000,
        experienceMin: 3,
        description:
          'Build automated infrastructure using Terraform and Ansible on AWS/Azure clouds for enterprise clients.',
        requirements: [
          '3+ years DevOps experience with AWS and CI/CD tools',
          'Proficiency in Linux administration and Docker containerization',
        ],
        skillsRequired: ['AWS', 'DevOps', 'Docker', 'Terraform', 'CI/CD'],
        postedBy: recruiter._id,
        status: 'open',
      },
    ];

    const insertedJobs = await Job.insertMany(dummyJobs);
    console.log(`🎉 Successfully seeded ${insertedJobs.length} jobs!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
