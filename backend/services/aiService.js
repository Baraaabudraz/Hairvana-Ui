const path = require('path');
const fs = require('fs');
const { Hairstyle } = require('../models');

// Dummy async function to simulate AI processing
async function processHairstyleImage(originalPath, hairstyleId) {
  // 1. Remove background (simulate by copying file)
  const segmentedFilename = 'segmented-' + path.basename(originalPath);
  const segmentedPath = path.join(path.dirname(originalPath), segmentedFilename);
  fs.copyFileSync(originalPath, segmentedPath);

  // 2. Generate AR filter file (simulate by copying again with .glb extension)
  const arFilterFilename = 'arfilter-' + path.basename(originalPath, path.extname(originalPath)) + '.glb';
  const arFilterPath = path.join(path.dirname(originalPath), arFilterFilename);
  fs.copyFileSync(originalPath, arFilterPath);

  // 3. Update the Hairstyle record
  await Hairstyle.update(
    {
      segmented_image_url: segmentedFilename,
      ar_model_url: arFilterFilename
    },
    { where: { id: hairstyleId } }
  );
}

module.exports = { processHairstyleImage };
