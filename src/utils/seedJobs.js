const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Job = require('../models/jobModel');
const User = require('../models/userModel');

const dummyJobs = [
  {
    title: 'Senior Frontend React Developer',
    company: 'TechCorp Global',
    location: 'Remote',
    type: 'full-time',
    salaryMin: 120000,
    salaryMax: 150000,
    description:
      'We are seeking an experienced Frontend Developer with strong expertise in React 18, Next.js, TypeScript, and modern CSS architecture.',
    requirements: [
      '5+ years web development experience',
      'Deep knowledge of React, Next.js, and TypeScript',
      'Experience building responsive web dashboards and micro-frontends',
    ],
    skillsRequired: ['React', 'TypeScript', 'TailwindCSS', 'Redux', 'Next.js'],
    status: 'open',
  },
  {
    title: 'Backend Node.js Microservices Engineer',
    company: 'CloudScale Systems',
    location: 'San Francisco, CA',
    type: 'full-time',
    salaryMin: 130000,
    salaryMax: 170000,
    description:
      'Join our core cloud team building RESTful APIs, high-throughput Mongoose/MongoDB integrations, and microservices.',
    requirements: [
      '4+ years Node.js and Express experience',
      'Proficiency with MongoDB, Mongoose, and Redis caching',
      'Experience with JWT authentication, rate limiting, and Docker',
    ],
    skillsRequired: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Docker', 'Redis'],
    status: 'open',
  },
  {
    title: 'Senior DevOps & Cloud Infrastructure Engineer',
    company: 'CloudPulse Networks',
    location: 'Remote',
    type: 'full-time',
    salaryMin: 135000,
    salaryMax: 175000,
    description:
      'Manage CI/CD pipelines, Kubernetes clusters, and multi-region AWS cloud infrastructure to ensure 99.99% system availability.',
    requirements: [
      '4+ years of hands-on DevOps and Infrastructure experience',
      'Expertise in AWS (EC2, EKS, S3, CloudFront) and Terraform',
      'Strong proficiency in Docker, Kubernetes, and Helm',
      'Experience setting up automated CI/CD with GitHub Actions or GitLab CI',
    ],
    skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Bash'],
    status: 'open',
  },
  {
    title: 'Lead Product Manager (FinTech & Payments)',
    company: 'PayFlow Solutions',
    location: 'New York, NY',
    type: 'full-time',
    salaryMin: 140000,
    salaryMax: 185000,
    description:
      'Lead cross-functional engineering and design teams to build next-generation payment APIs, merchant checkouts, and financial dashboards.',
    requirements: [
      '5+ years Product Management experience in FinTech, Payments, or E-commerce',
      'Proven track record of defining product roadmaps and launching web/mobile products',
      'Deep understanding of user stories, wireframing, and agile methodologies',
      'Strong quantitative analysis and metric-driven decision making',
    ],
    skillsRequired: ['Product Management', 'Agile', 'FinTech', 'User Research', 'Roadmapping', 'Jira'],
    status: 'open',
  },
  {
    title: 'Data Engineer & Pipeline Specialist',
    company: 'DataSphere Analytics',
    location: 'Chicago, IL',
    type: 'full-time',
    salaryMin: 125000,
    salaryMax: 160000,
    description:
      'Design, build, and optimize scalable ETL data pipelines and warehouse architectures supporting real-time data streaming and analytics.',
    requirements: [
      '3+ years experience with Python, SQL, and Apache Spark',
      'Hands-on experience with Snowflake, BigQuery, or Redshift',
      'Familiarity with data orchestration tools like Airflow or Prefect',
    ],
    skillsRequired: ['Python', 'SQL', 'Apache Spark', 'Snowflake', 'Airflow', 'ETL'],
    status: 'open',
  },
  {
    title: 'Cybersecurity & Penetration Testing Specialist',
    company: 'CyberShield Security Labs',
    location: 'Washington, DC',
    type: 'full-time',
    salaryMin: 130000,
    salaryMax: 165000,
    description:
      'Conduct vulnerability assessments, network penetration testing, and security code reviews to safeguard web application infrastructures.',
    requirements: [
      'CEH, OSCP, or CISSP certification preferred',
      'Deep understanding of OWASP Top 10 vulnerabilities and web security protocols',
      'Experience with SIEM tools, Wireshark, Metasploit, and Burp Suite',
    ],
    skillsRequired: ['Cybersecurity', 'Penetration Testing', 'Network Security', 'OWASP', 'Linux', 'Ethical Hacking'],
    status: 'open',
  },
  {
    title: 'Lead UI/UX & Product Designer',
    company: 'PixelCraft Studios',
    location: 'Remote',
    type: 'remote',
    salaryMin: 110000,
    salaryMax: 145000,
    description:
      'Craft intuitive, stunning user experiences and design systems for enterprise SaaS applications from low-fi wireframes to interactive Figma prototypes.',
    requirements: [
      '4+ years UI/UX product design experience',
      'Mastery of Figma, design systems, component libraries, and interactive prototyping',
      'Strong understanding of modern web design accessibility standards (WCAG)',
    ],
    skillsRequired: ['Figma', 'UI/UX', 'Design Systems', 'Wireframing', 'User Research', 'Prototyping'],
    status: 'open',
  },
  {
    title: 'Senior AI & Machine Learning Engineer',
    company: 'NeuralTech Dynamics',
    location: 'Austin, TX',
    type: 'full-time',
    salaryMin: 150000,
    salaryMax: 195000,
    description:
      'Develop and fine-tune large language models (LLMs), natural language processing pipelines, and predictive ML systems using PyTorch and HuggingFace.',
    requirements: [
      'Master’s or Bachelor’s degree in CS, AI, or related field',
      'Strong proficiency in Python, PyTorch/TensorFlow, and Scikit-Learn',
      'Experience building RAG pipelines, vector databases (Pinecone, ChromaDB), and API integrations',
    ],
    skillsRequired: ['Python', 'PyTorch', 'Machine Learning', 'LLMs', 'NLP', 'RAG', 'Vector Databases'],
    status: 'open',
  },
  {
    title: 'Site Reliability Engineer (SRE)',
    company: 'Infrastructure Scale Inc.',
    location: 'Seattle, WA',
    type: 'full-time',
    salaryMin: 140000,
    salaryMax: 180000,
    description:
      'Bridge the gap between operations and software engineering. Implement SLO/SLA monitoring, incident response automation, and infrastructure resilience.',
    requirements: [
      '3+ years in SRE or Systems Engineering roles',
      'Proficiency in Go, Python, or Bash',
      'Expertise in Prometheus, Grafana, Datadog, and cloud incident management',
    ],
    skillsRequired: ['SRE', 'Prometheus', 'Grafana', 'Go', 'Python', 'Kubernetes', 'AWS'],
    status: 'open',
  },
  {
    title: 'Mobile App Engineer (React Native & Flutter)',
    company: 'AppPulse Mobility',
    location: 'Remote',
    type: 'contract',
    salaryMin: 95000,
    salaryMax: 130000,
    description:
      'Build and launch cross-platform iOS and Android mobile applications integrated with native device APIs and smooth UI transitions.',
    requirements: [
      '3+ years mobile development experience with React Native or Flutter',
      'Experience publishing apps on Apple App Store & Google Play Store',
      'Proficiency with Redux, WebSocket real-time feeds, and Push Notifications',
    ],
    skillsRequired: ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile Apps', 'TypeScript'],
    status: 'open',
  },
  {
    title: 'QA & Test Automation Lead',
    company: 'TestMatrix Labs',
    location: 'Boston, MA',
    type: 'full-time',
    salaryMin: 100000,
    salaryMax: 135000,
    description:
      'Architect end-to-end automated testing suites using Cypress, Playwright, and Selenium for complex enterprise applications.',
    requirements: [
      '4+ years test automation experience in Web & API testing',
      'Hands-on expertise with JavaScript/TypeScript testing tools (Cypress, Playwright, Jest)',
      'Experience integrating automated tests into CI/CD build pipelines',
    ],
    skillsRequired: ['QA Automation', 'Cypress', 'Playwright', 'Jest', 'Selenium', 'CI/CD'],
    status: 'open',
  },
  {
    title: 'Technical Program Manager (TPM)',
    company: 'NextGen Systems',
    location: 'Remote',
    type: 'full-time',
    salaryMin: 145000,
    salaryMax: 185000,
    description:
      'Drive complex, multi-team software engineering programs from technical design phase to production launch across global engineering organizations.',
    requirements: [
      '5+ years technical program management experience',
      'Strong engineering background and ability to communicate technical trade-offs',
      'Expertise in risk management, resource allocation, and stakeholder reporting',
    ],
    skillsRequired: ['Program Management', 'Agile', 'Scrum', 'Stakeholder Management', 'Risk Management'],
    status: 'open',
  },
  {
    title: 'Cloud Solutions Architect',
    company: 'Apex Cloud Technologies',
    location: 'Denver, CO',
    type: 'full-time',
    salaryMin: 160000,
    salaryMax: 200000,
    description:
      'Architect cloud migration strategies, enterprise multi-cloud resilience, and cost optimization blueprints for fortune 500 enterprise clients.',
    requirements: [
      'AWS Solutions Architect Professional or Azure Solutions Architect certification',
      '7+ years experience designing enterprise cloud architectures',
      'Deep expertise in serverless architectures, microservices, and security compliance',
    ],
    skillsRequired: ['Cloud Architecture', 'AWS', 'Azure', 'Microservices', 'Enterprise Architecture', 'Security'],
    status: 'open',
  },
  {
    title: 'Database Administrator (DBA) & Performance Engineer',
    company: 'Core Data Systems',
    location: 'Atlanta, GA',
    type: 'full-time',
    salaryMin: 115000,
    salaryMax: 150000,
    description:
      'Manage PostgreSQL and MongoDB database clusters, perform index tuning, query optimization, automated backups, and failover disaster recovery.',
    requirements: [
      '4+ years experience managing relational and NoSQL databases in production',
      'Expertise in query optimization, sharding, replication, and high availability setup',
    ],
    skillsRequired: ['MongoDB', 'PostgreSQL', 'Database Administration', 'Performance Tuning', 'SQL', 'NoSQL'],
    status: 'open',
  },
];

const seedJobs = async () => {
  try {
    await connectDB();

    let recruiter = await User.findOne({ role: { $in: ['employer', 'recruiter'] } });

    if (!recruiter) {
      console.log('ℹ️ No existing user found. Creating a default recruiter user...');
      recruiter = await User.create({
        fullName: 'Default Recruiter',
        email: 'recruiter@findjob.com',
        password: '$2b$10$e.w2.b6Z442oXm.0F3jF.uMh6YjT4KqXq0W1cW0W1cW0W1cW0W1cW',
        role: 'recruiter',
      });
      console.log('✅ Default recruiter created with ID:', recruiter._id);
    }

    const jobsToInsert = dummyJobs.map((job) => ({
      ...job,
      postedBy: recruiter._id,
    }));

    await Job.deleteMany({});
    console.log('🧹 Existing jobs collection cleared.');

    const insertedJobs = await Job.insertMany(jobsToInsert);
    console.log(`🎉 Successfully seeded ${insertedJobs.length} dummy jobs into MongoDB!`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding dummy jobs: ${error.message}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedJobs();
