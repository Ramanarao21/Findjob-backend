const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const proRoutes = require('./routes/proRoutes');
const companyRoutes = require('./routes/companyRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://find-job-frontend-theta.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads directory for avatars and resumes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Board API is running successfully',
  });
});

// Mount Module Routes
// Note: Routes are mounted without /api prefix because Vercel intercepts /api/* as serverless functions.
// The frontend must call /api/* which Vercel rewrites to api/index.js, stripping the /api prefix before Express sees it.
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/jobs', jobRoutes);
app.use('/companies', companyRoutes);
app.use('/saved-jobs', savedJobRoutes);
app.use('/applications', applicationRoutes);
app.use('/pro', proRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
