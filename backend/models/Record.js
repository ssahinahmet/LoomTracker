const mongoose = require('mongoose');

const VARDIYALAR = ['07:00-15:00', '15:00-23:00', '23:00-07:00'];

const recordSchema = new mongoose.Schema({
  tarih: {
    type: Date,
    required: true,
    index: true,
    description: 'Kayıt tarihi ve saati'
  },
  tezgah_no: {
    type: String,
    required: true,
    trim: true,
    description: 'Tezgah numarası (örn: "1", "2", "3")'
  },
  vardiya: {
    type: String,
    required: true,
    description: 'Çalışma vardiyası'
  },
  operator: {
    type: String,
    required: true,
    trim: true,
    description: 'Operatör adı (manuel girilmiş, gösterim için)'
  },
  devir: {
    type: Number,
    required: true,
    min: 0,
    description: 'Devir sayısı'
  },
  atki: {
    type: Number,
    required: true,
    min: 0,
    description: 'Atkı sayısı'
  },
  atki_sikligi: {
    type: Number,
    required: true,
    min: 0.00001,
    description: 'Atkı sıklığı (m² için çarpan)'
  },
  durus_nedeni: {
    type: String,
    default: null,
    trim: true,
    description: 'Duruş nedeni (isteğe bağlı)'
  },
  durus_suresi: {
    type: Number,
    default: 0,
    min: 0,
    description: 'Duruş süresi (dakika)'
  },
  m2: {
    type: Number,
    required: true,
    min: 0,
    description: 'Toplam üretim (m² cinsinden)'
  },
  photoFilename: {
    type: String,
    default: null,
    description: 'Yüklenen fotoğraf dosyasının adı (ID.jpg)'
  },
  not: {
    type: String,
    default: null,
    trim: true,
    maxlength: 300,
    description: 'Ek açıklama, gözlem vb. (opsiyonel)'
  }
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
