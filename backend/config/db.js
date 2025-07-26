// config/db.js
const mongoose = require('mongoose');

// Bağlantı ayarları
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true, // artık gerek yok mongoose v6+
  autoIndex: true, // Geliştirme ortamı için true olabilir, prod'da false önerilir
  serverSelectionTimeoutMS: 5000, // Sunucuya bağlanma zaman aşımı
  socketTimeoutMS: 45000, // İletişim zaman aşımı
};

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error('[❌] MONGO_URI .env dosyasında tanımlı değil.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, options);
    console.log(`[✅] MongoDB bağlantısı başarılı (${mongoose.connection.host})`);

    // Bağlantı olayları
    mongoose.connection.on('connected', () => {
      console.log('[📡] MongoDB bağlantısı kuruldu.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[❌] MongoDB bağlantı hatası:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[⚠️] MongoDB bağlantısı kesildi.');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[💤] MongoDB bağlantısı kapatıldı (SIGINT)');
      process.exit(0);
    });

  } catch (error) {
    console.error('[🔥] MongoDB bağlantı sırasında hata:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
