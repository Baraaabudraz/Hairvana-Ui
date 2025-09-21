const express = require('express');
const path = require('path');
const { createUploadMiddleware, getFileInfo, FILE_TYPE_MAP } = require('../helpers/uploadHelper');

const router = express.Router();

// Directory for salon images
const allowedTypes = Object.keys(FILE_TYPE_MAP).filter(type => type.startsWith('image/'));
const upload = createUploadMiddleware({ uploadDir: '/salons', maxSize: 10 * 1024 * 1024, allowedTypes });

// Remove the /upload-image endpoint for salons

module.exports = router; 