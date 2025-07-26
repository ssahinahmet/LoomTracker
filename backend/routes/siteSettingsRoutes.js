const express = require('express');
const router = express.Router();
const siteSettingsController = require('../controllers/siteSettingsController');

// GET Site Settings
router.get('/', siteSettingsController.getSettings);

// PUT Update Site Settings
router.put('/', siteSettingsController.updateSettings);

module.exports = router;
