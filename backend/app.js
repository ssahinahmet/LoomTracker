require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const recordRoutes = require('./routes/recordRoutes');
const authRoutes = require('./routes/authRoutes');
const makinistRoutes = require('./routes/makinistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const themeRoutes = require('./routes/themeRoutes'); // <-- RENK teması için yeni route

const app = express();

// ============================
// 🔧 Middleware
// ============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// 📋 Logger
// ============================
app.use(morgan('dev'));

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ============================
// 🗂 Statik dosyalar
// ============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ============================
// 🔌 Veritabanı bağlantısı
// ============================
connectDB();

// ============================
// 📦 Rotalar
// ============================
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api', makinistRoutes);
app.use('/api', profileRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/theme', themeRoutes);

// ============================
// ❤️ Sağlık kontrolü
// ============================
app.get('/', (req, res) => {
  res.send('Loom Tracker Backend çalışıyor');
});

// ============================
// ❌ Hata yönetimi
// ============================
app.use((err, req, res, next) => {
  console.error('Genel hata:', err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

module.exports = app;


// app.js'in en altına ekle
require("./services/reportScheduler");
