const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Supported file types and their MIME types
const FILE_TYPE_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Create a Multer upload middleware with custom options
 * @param {Object} options
 * @param {string} options.uploadDir - Directory to store files
 * @param {number} options.maxSize - Max file size in bytes
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {multer.Instance}
 */
function createUploadMiddleware({ uploadDir, maxSize = 10 * 1024 * 1024, allowedTypes = Object.keys(FILE_TYPE_MAP) }) {
  // Ensure upload directory exists

  const path = path.join( '../', '/backend', '/public', '/uploads', uploadDir);

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(path, { recursive: true });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || `.${FILE_TYPE_MAP[file.mimetype] || 'bin'}`;
      const name = `${uuidv4()}${ext}`;
      cb(null, name);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Allowed: ' + allowedTypes.join(', ')));
    }
  };

  return multer({ storage, fileFilter, limits: { fileSize: maxSize } });
}

/**
 * Get useful file info from Multer's file object
 * @param {Express.Multer.File} file
 * @param {string} publicBaseUrl - Base URL for serving files (e.g., /uploads/avatars)
 * @returns {Object}
 */
function getFileInfo(file, publicBaseUrl = '') {
  return {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    path: file.path,
    url: publicBaseUrl ? `${publicBaseUrl}/${file.filename}` : undefined,
  };
}

module.exports = {
  createUploadMiddleware,
  getFileInfo,
  FILE_TYPE_MAP,
}; 