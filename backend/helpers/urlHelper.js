/**
 * URL Helper for building full URLs with proper domain and paths
 */

/**
 * Build full URL with domain from environment variables
 * @param {string} path - Image path or filename
 * @param {string} type - Type of image (avatar, salon, staff, etc.)
 * @param {Object} options - Options object containing request info
 * @returns {string|null} Full URL or null if no path provided
 */
const buildUrl = (path, type = 'avatar', options = {}) => {
  if (!path) return null;
  
  // If already absolute URL, return as is
  if (path.startsWith('http')) return path;
  
  // Get base URL from environment or fallback
  const baseUrl = process.env.BACKEND_BASE_URL || 
                  'http://localhost:5000';
  
  // Remove trailing slash from base URL if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Determine the correct path based on type
  let imagePath;
  switch (type) {
    case 'avatar':
      imagePath = '/images/avatar';
      break;
    case 'salon':
      imagePath = '/images/salon';
      break;
    case 'staff':
      imagePath = '/images/staff';
      break;
    case 'service':
      imagePath = '/images/services';
      break;
    case 'hairstyle':
      imagePath = '/images/hairstyles';
      break;
    case 'gallery':
      imagePath = '/images/gallery';
      break;
    default:
      imagePath = '/images';
  }
  
  // If path already starts with /, use it directly
  if (path.startsWith('/')) {
    return `${cleanBaseUrl}${path}`;
  }
  
  // Otherwise, construct the full path
  return `${cleanBaseUrl}${imagePath}/${path}`;
};

/**
 * Build avatar URL specifically
 * @param {string} avatarPath - Avatar filename or path
 * @param {Object} options - Options object containing request info
 * @returns {string|null} Full avatar URL or null
 */
const buildAvatarUrl = (avatarPath, options = {}) => {
  return buildUrl(avatarPath, 'avatar', options);
};

/**
 * Build salon image URL specifically
 * @param {string} imagePath - Salon image filename or path
 * @param {Object} options - Options object containing request info
 * @returns {string|null} Full salon image URL or null
 */
const buildSalonImageUrl = (imagePath, options = {}) => {
  return buildUrl(imagePath, 'salon', options);
};

/**
 * Build staff image URL specifically
 * @param {string} imagePath - Staff image filename or path
 * @param {Object} options - Options object containing request info
 * @returns {string|null} Full staff image URL or null
 */
const buildStaffImageUrl = (imagePath, options = {}) => {
  return buildUrl(imagePath, 'staff', options);
};

/**
 * Build gallery image URL specifically
 * @param {string} imagePath - Gallery image filename or path
 * @param {Object} options - Options object containing request info
 * @returns {string|null} Full gallery image URL or null
 */
const buildGalleryImageUrl = (imagePath, options = {}) => {
  return buildUrl(imagePath, 'gallery', options);
};

/**
 * Process an array of images and build URLs for each
 * @param {Array} images - Array of image paths
 * @param {string} type - Type of images
 * @param {Object} options - Options object containing request info
 * @returns {Array} Array of full URLs
 */
const buildImageUrls = (images, type = 'avatar', options = {}) => {
  if (!Array.isArray(images)) return [];
  return images.map(img => buildUrl(img, type, options)).filter(url => url !== null);
};

/**
 * Get the base URL from environment variables
 * @returns {string} Base URL for the backend
 */
const getBaseUrl = () => {
  return process.env.BACKEND_BASE_URL || 
         process.env.VITE_BACKEND_URL || 
         'http://localhost:5000';
};

module.exports = {
  buildUrl,
  buildAvatarUrl,
  buildSalonImageUrl,
  buildStaffImageUrl,
  buildGalleryImageUrl,
  buildImageUrls,
  getBaseUrl
}; 