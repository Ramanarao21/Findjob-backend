const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEFAULT_AVATAR_URL =
  process.env.DEFAULT_AVATAR_URL ||
  'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const uploadStreamToCloudinary = (
  fileBuffer,
  folder = 'findjob',
  resourceType = 'auto',
  publicIdPrefix = ''
) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: resourceType,
    };

    if (publicIdPrefix) {
      const sanitizedPrefix = publicIdPrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
      options.public_id = `${sanitizedPrefix}_${Date.now()}`;
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a resource from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the resource
 * @param {string} resourceType - 'image', 'raw', or 'auto'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error('Failed to delete asset from Cloudinary:', err.message);
  }
};

module.exports = {
  cloudinary,
  DEFAULT_AVATAR_URL,
  uploadStreamToCloudinary,
  deleteFromCloudinary,
};
