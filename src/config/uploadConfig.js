const multer = require('multer');
const path = require('path');

// Memory storage so files are held as buffers and streamed to Cloudinary
const storage = multer.memoryStorage();

// Avatar File Filter (jpg, jpeg, png, webp)
const avatarFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type! Only JPG, PNG, and WEBP image files are allowed.'));
};

// Resume File Filter (PDF, DOCX)
const resumeFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  if (
    (ext === '.pdf' || ext === '.docx' || ext === '.doc') &&
    (allowedMimeTypes.includes(file.mimetype) || file.mimetype === 'application/octet-stream')
  ) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type! Only PDF and DOCX resume files are allowed.'));
};

// Multer upload instances
const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: avatarFileFilter,
}).single('avatar');

const uploadResume = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: resumeFileFilter,
}).single('resume');

// Helper to handle Multer upload middleware errors cleanly
const handleMulterUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File size limit exceeded. Avatar max 5MB, Resume max 10MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadAvatar: handleMulterUpload(uploadAvatar),
  uploadResume: handleMulterUpload(uploadResume),
};
