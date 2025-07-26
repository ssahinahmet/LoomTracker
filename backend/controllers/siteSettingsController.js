const SiteSettings = require('../models/siteSettings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(); // default değerlerle
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error('SiteSettings get error:', error);
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(updates);
    } else {
      Object.assign(settings, updates);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('SiteSettings update error:', error);
    res.status(500).json({ message: 'Güncelleme hatası', error });
  }
};
