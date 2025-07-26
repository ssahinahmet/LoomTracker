const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  firmaAdi: { type: String, required: true, default: 'Pizza Development' },
  tezgahSayisi: { type: Number, default: 3 },
  vardiyalar: { type: [String], default: ['07:00-15:00', '15:00-23:00', '23:00-07:00'] },

  colors: {
    bgColor: { type: String, default: '#0a0a0a' },
    primaryColor: { type: String, default: '#ffffff' },
    primaryColorLight: { type: String, default: '#a64dff' },
    textColor: { type: String, default: '#d3d3d3' },
    textMuted: { type: String, default: '#5a5a5a' },
    inputBg: { type: String, default: '#1e1e1e' },
    inputBorder: { type: String, default: '#4a148c' },
    inputFocus: { type: String, default: '#9c27b0' },
    btnBg: { type: String, default: '#7f00ff' },
    btnBgHover: { type: String, default: '#a64dff' },
    shadowColor: { type: String, default: 'rgba(127, 0, 255, 0.6)' }
  },

  durusNedenleri: {
    type: [String],
    default: ['Malzeme Sorunu', 'Makine Arızası', 'Personel Eksikliği']
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports =
  mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', siteSettingsSchema);
