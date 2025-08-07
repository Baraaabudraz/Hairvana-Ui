const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Serve user avatar by UUID
router.get('/avatar/:uuid', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads/avatars', req.params.uuid);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

// Serve salon image by UUID
router.get('/salon/:uuid', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads/salons', req.params.uuid);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

// Serve service image by UUID
router.get('/services/:uuid', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads/services', req.params.uuid);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

// Serve staff image by UUID
router.get('/staff/:uuid', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads/staff', req.params.uuid);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

// Serve hairstyle images
router.get('/hairstyles/original/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads/hairstyles/original', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Not found');
  }
});

module.exports = router; 