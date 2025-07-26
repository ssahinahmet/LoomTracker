const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const User = require('../models/User');

// GET /api/profile-records?pin=1234
router.get('/profile-records', async (req, res, next) => {
  try {
    const pin = req.query.pin;
    if (!pin) {
      return res.status(400).json({ error: 'PIN belirtilmedi' });
    }

    const user = await User.findOne({ pin });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const operatorName = user.name;

    const records = await Record.find({ operator: operatorName }).sort({ tarih: -1 });

    res.json(records);
  } catch (error) {
    console.error('Profil kayıtları çekilirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
