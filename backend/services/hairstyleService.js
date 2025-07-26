const path = require('path');
const aiService = require('./aiService');
const hairstyleRepository = require('../repositories/hairstyleRepository');

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  if (typeof tags === 'string') {
    // Accept comma-separated or single string
    if (tags.trim().startsWith('[')) {
      // Try to parse as JSON array string
      try {
        return JSON.parse(tags);
      } catch {
        // Fallback to comma split
        return tags.split(',').map(t => t.trim());
      }
    }
    return tags.split(',').map(t => t.trim());
  }
  return [];
}

function getPublicUrl(req, folder, filename) {
  if (!filename) return null;
  const baseUrl = req.protocol + '://' + req.get('host');
  return `${baseUrl}/images/${folder}/${filename}`;
}

function mapHairstyleResponse(req, h) {
  return {
    ...h.toJSON(),
    image_url: getPublicUrl(req, 'hairstyles/original', h.image_url),
    segmented_image_url: getPublicUrl(req, 'hairstyles/original', h.segmented_image_url),
    ar_model_url: getPublicUrl(req, 'hairstyles/original', h.ar_model_url)
  };
}

async function triggerAIJobIfNeeded(imageStoredName, hairstyleId) {
  if (imageStoredName) {
    await aiService.processHairstyleImage(
      path.join('backend/public/uploads/hairstyles/original', imageStoredName),
      hairstyleId
    );
  }
}

module.exports = {
  parseTags,
  mapHairstyleResponse,
  triggerAIJobIfNeeded,
  ...hairstyleRepository,
}; 