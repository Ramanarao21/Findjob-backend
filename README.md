# 🚀 FindJob Backend API

A production-ready RESTful API for modern job search, recruitment management, company directory, candidate profile analytics, Cloudinary file uploads, and Stripe-powered Pro Membership subscriptions.

---

## 🛠️ Technology Stack

- **Runtime & Server**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt password hashing
- **File Storage**: Cloudinary (Direct buffer stream upload for Avatars and PDF/DOCX Resumes)
- **Payments & Subscriptions**: Stripe API (Checkout Sessions & Webhook handler)
- **Security & Authorization**: Role-Based Access Control (RBAC) & Server-Side Pro Tier Data Masking

---

## 📁 Project Directory Structure

```text
FindJob-Backend/
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection & DNS resolution
│   │   ├── cloudinary.js         # Cloudinary configuration & upload stream utilities
│   │   └── uploadConfig.js       # Multer memory storage & MIME type validation
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and token generation
│   │   ├── profileController.js  # Profile management, Cloudinary avatar & resume uploads
│   │   ├── jobController.js      # Job posting, search, pagination, and filters
│   │   ├── companyController.js  # Company directory & company-specific jobs
│   │   ├── applicationController.js # Job application processing & recruiter applicant status
│   │   ├── savedJobController.js # Candidate job bookmarking
│   │   └── proController.js      # HR contacts, interview reports, referrals & Stripe checkout
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT token verification & RBAC role authorization
│   │   ├── proMiddleware.js      # Server-side Pro tier access gating
│   │   ├── errorMiddleware.js    # Global error handler and 404 route middleware
│   │   └── jobValidationMiddleware.js # Job payload validation
│   ├── models/
│   │   ├── userModel.js          # User schema (Candidate & Recruiter roles, Pro fields)
│   │   ├── jobModel.js           # Job schema with text search indexing
│   │   ├── companyModel.js       # Company schema with ratings, reviews, and branding
│   │   ├── applicationModel.js   # Job application schema
│   │   ├── savedJobModel.js      # Saved/Bookmarked jobs schema
│   │   └── proModels.js          # HR Contacts, Interview Insights, and Referrals schemas
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── profileRoutes.js      # /api/profile
│   │   ├── jobRoutes.js          # /api/jobs
│   │   ├── companyRoutes.js      # /api/companies
│   │   ├── applicationRoutes.js  # /api/applications
│   │   ├── savedJobRoutes.js     # /api/saved-jobs
│   │   └── proRoutes.js          # /api/pro
│   ├── serializers/
│   │   └── proSerializers.js     # Server-side data masking for Free vs Pro users
│   ├── utils/
│   │   ├── seedCompanies.js      # Seeds MongoDB with 6 companies and 17 active jobs
│   │   ├── seedData.js           # Seeds sample application data
│   │   └── generateToken.js      # JWT signing helper
│   ├── app.js                    # Express app configuration & middleware pipeline
│   └── server.js                 # Server entry point
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/findjob

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Default User Avatar URL
DEFAULT_AVATAR_URL=https://cdn-icons-png.flaticon.com/512/149/149071.png
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database with Initial Data
Run the seeding script to populate MongoDB with companies, open jobs, and HR contacts:
```bash
node src/utils/seedCompanies.js
```

### 3. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 📑 Complete REST API Reference

### 🔐 1. Auth Module (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | **Public** | Register a new user (`role: "candidate"` or `"recruiter"`) |
| `POST` | `/api/auth/login` | **Public** | Authenticate credentials & return JWT token |
| `GET` | `/api/auth/me` | **Private** | Fetch logged-in user profile from token |

---

### 👤 2. Profile Module (`/api/profile`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/profile/me` | **Private** | Fetch full profile of logged-in user |
| `PUT` | `/api/profile/me` | **Private** | Update `fullName`, `jobTitle`, `location` |
| `GET` | `/api/profile/:userId` | **Public** | View public profile of another user |
| `POST` | `/api/profile/me/avatar` | **Private** | Upload avatar image to Cloudinary (Max 5MB) |
| `DELETE`| `/api/profile/me/avatar` | **Private** | Reset avatar to default |
| `POST` | `/api/profile/me/resume` | **Private** | Upload resume PDF/DOCX to Cloudinary (Max 10MB) |
| `DELETE`| `/api/profile/me/resume` | **Private** | Delete stored resume |
| `PATCH`| `/api/profile/me/skills` | **Private** | Add/Remove candidate skills |

---

### 💼 3. Jobs Module (`/api/jobs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/jobs` | **Public** | Search & list jobs with filters (title, company, type, salary) |
| `POST` | `/api/jobs` | **Recruiter** | Post a new job listing |
| `GET` | `/api/jobs/recruiter/me` | **Recruiter** | Get all jobs posted by current recruiter |
| `GET` | `/api/jobs/:jobId` | **Public** | Get detailed job information & recruiter contact |
| `PUT` | `/api/jobs/:jobId` | **Recruiter (Owner)** | Update job details |
| `DELETE`| `/api/jobs/:jobId` | **Recruiter (Owner)** | Delete job listing and associated applications |
| `POST` | `/api/jobs/:jobId/apply` | **Candidate** | Apply to job using profile's Cloudinary resume |
| `GET` | `/api/jobs/:jobId/applicants` | **Recruiter (Owner)** | View all applicants for a job |

---

### 🏢 4. Companies Module (`/api/companies`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/companies` | **Public** | Fetch all top companies with search & industry filters |
| `GET` | `/api/companies/:id` | **Public** | Fetch company profile, reviews & active open jobs |
| `GET` | `/api/companies/:id/jobs` | **Public** | Fetch open jobs posted for a specific company |
| `POST` | `/api/companies` | **Recruiter** | Register a new company profile |
| `PUT` | `/api/companies/:id` | **Recruiter** | Update company profile details |

---

### 🔖 5. Saved Jobs Module (`/api/saved-jobs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/saved-jobs/:jobId` | **Candidate** | Bookmark/save a job |
| `DELETE`| `/api/saved-jobs/:jobId` | **Candidate** | Unsave a job |
| `GET` | `/api/saved-jobs` | **Candidate** | List candidate's saved jobs |

---

### 👑 6. Pro Membership Tier Module (`/api/pro`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pro/contacts` | Authenticated | List HR contacts (Masked email for Free, unmasked for Pro) |
| `POST` | `/api/pro/contacts/:id/reveal` | **Pro Only** | Reveal full HR contact email |
| `GET` | `/api/pro/interview-insights` | Authenticated | List interview reports (Truncated for Free, full for Pro) |
| `POST` | `/api/pro/interview-insights` | Authenticated | Submit crowdsourced interview report |
| `GET` | `/api/pro/referrals` | Authenticated | View referral network count per company |
| `POST` | `/api/pro/referrals/request` | **Pro Only** | Request employee referral |
| `GET` | `/api/pro/membership/stats` | Authenticated | Profile views & recruiter search analytics |
| `POST` | `/api/pro/membership/upgrade` | Authenticated | Create Stripe Checkout Session |
| `POST` | `/api/pro/membership/webhook` | Public | Stripe Webhook listener for automatic payment activation |
| `POST` | `/api/pro/membership/dev-toggle` | Authenticated | Dev utility to toggle Free <-> Pro status |

---

## 🔒 Security & Data Masking Architecture

Pro feature gating is enforced **strictly server-side** in [proSerializers.js](file:///d:/FindJob-Backend/src/serializers/proSerializers.js) and [proMiddleware.js](file:///d:/FindJob-Backend/src/middlewares/proMiddleware.js):

- **Free Tier Users**:
  - Email addresses are masked: `s***r@techcorp.com`
  - Interview report text is truncated to the first sentence.
  - Profile analytics numbers return `null` with a `locked: true` flag.
  - Pro-only endpoints return `403 Forbidden` (`PRO_MEMBERSHIP_REQUIRED`).

- **Pro Tier Users**:
  - Email addresses are fully revealed: `sarah.connor@techcorp.com`
  - Full interview experience logs are accessible.
  - Real-time profile views and recruiter search metrics are unlocked.
