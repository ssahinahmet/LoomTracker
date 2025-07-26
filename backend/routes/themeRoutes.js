const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/siteSettings');

// GET /api/theme
router.get('/', async (req, res) => {
  try {
    const siteSettings = await SiteSettings.findOne();
    if (!siteSettings) return res.status(404).json({ message: 'Site ayarları bulunamadı' });
    
    // sadece colors alanını dön
    res.json(siteSettings.colors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
