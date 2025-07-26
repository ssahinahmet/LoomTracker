// userAdd.js
const mongoose = require('mongoose');
const User = require('./models/User'); // Model yolunu kendi yapına göre ayarla

// userId otomatik üretici fonksiyon (son kullanıcıya göre increment yapar)
async function generateUserId() {
  const lastUser = await User.findOne().sort({ createdAt: -1 }).exec();
  let nextNumber = 1;
  if (lastUser && lastUser.userId) {
    const match = lastUser.userId.match(/\d+$/);
    if (match) nextNumber = parseInt(match[0], 10) + 1;
  }
  return `pizza${nextNumber.toString().padStart(5, '0')}`;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Kullanım: node userAdd.js "<isim soyisim>" <pin> <role>');
    console.error('Örnek: node userAdd.js "Ahmet Şahin" 12345678 admin');
    process.exit(1);
  }

  const [name, pin, role] = args;

  if (pin.length !== 8) {
    console.error('PIN 8 karakter olmalı.');
    process.exit(1);
  }

  if (!['admin', 'operator', 'makinist'].includes(role)) {
    console.error('Role sadece "admin", "operator" veya "makinist" olabilir.');
    process.exit(1);
  }

  await mongoose.connect('mongodb://127.0.0.1:27017/veri', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    const exists = await User.findOne({ pin });
    if (exists) {
      console.error('Bu PIN zaten kayıtlı.');
      process.exit(1);
    }

    // userId oluştur
    const userId = await generateUserId();

    const user = new User({ userId, name, pin, role });
    await user.save();

    console.log(`Kullanıcı başarıyla eklendi:\nİsim: ${name}\nPIN: ${pin}\nRole: ${role}\nUserID: ${userId}`);
  } catch (err) {
    console.error('Hata oluştu:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
