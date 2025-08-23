const path = require('path');
const hairstyleRepository = require('../repositories/hairstyleRepository');
const { buildUrl } = require('../helpers/urlHelper');
const fs = require('fs');

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

function mapHairstyleResponse(req, h) {
  return {
    ...h.toJSON(),
    image_url: buildUrl(h.image_url, 'hairstyle')
  };
}

function mapHairstylesResponse(req, hairstyles) {
  if (!Array.isArray(hairstyles)) {
    return hairstyles;
  }
  return hairstyles.map(h => mapHairstyleResponse(req, h));
}



module.exports = {
  parseTags,
  mapHairstyleResponse,
  mapHairstylesResponse,
  ...hairstyleRepository,
}; 