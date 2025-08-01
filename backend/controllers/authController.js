const User = require('../models/User');

// PIN formatını kontrol eder: 8 karakter, alfanumerik
function isValidPin(pin) {
  return /^[A-Za-z0-9]{8}$/.test(pin);
}

// Yeni benzersiz userId oluşturur (örnek: pizza000001)
async function generateUserId() {
  const lastUser = await User.findOne().sort({ createdAt: -1 }).exec();

  let nextNumber = 1;
  if (lastUser && lastUser.userId) {
    const match = lastUser.userId.match(/\d+$/);
    if (match) {
      nextNumber = parseInt(match[0], 10) + 1;
    }
  }

  return `pizza${nextNumber.toString().padStart(6, '0')}`;
}

// Kullanıcı Girişi (PIN bazlı)
exports.loginUser = async (req, res) => {
  try {
    let { pin } = req.body;

    if (!pin || typeof pin !== 'string' || !isValidPin(pin)) {
      return res.status(400).json({ error: 'Geçerli 8 haneli alfasayısal PIN girilmelidir.' });
    }

    pin = pin.toUpperCase();
    const user = await User.findOne({ pin });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz PIN.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'İşten çıkarıldınız, sisteme erişiminiz engellenmiştir.' });
    }

    return res.status(200).json({
      message: 'Giriş başarılı.',
      operator_id: user.userId,
      name: user.name,
      role: user.role
    });

  } catch (err) {
    console.error('[AUTH][LOGIN] Hata:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Yeni Kullanıcı Oluşturma
exports.createUser = async (req, res) => {
  try {
    let { pin, role, name } = req.body;

    if (!pin || typeof pin !== 'string' || !isValidPin(pin)) {
      return res.status(400).json({ error: '8 haneli alfasayısal PIN zorunludur.' });
    }

    pin = pin.toUpperCase();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Kullanıcı adı zorunludur.' });
    }

    const validRoles = ['admin', 'operator', 'makinist'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol. (admin, operator, makinist olabilir)' });
    }

    const exists = await User.findOne({ pin });
    if (exists) {
      return res.status(409).json({ error: 'Bu PIN zaten kayıtlı.' });
    }

    const userId = await generateUserId();

    const user = new User({
      userId,
      pin,
      role: role || 'operator',
      name: name.trim()
    });

    await user.save();

    return res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu.',
      operator_id: user.userId,
      name: user.name,
      role: user.role
    });

  } catch (err) {
    console.error('[AUTH][CREATE USER] Hata:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Kullanıcı Silme (Tam silme)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Kullanıcı ID zorunludur.' });
    }

    const deleted = await User.findOneAndDelete({ userId: id });
    if (!deleted) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    return res.json({ message: 'Kullanıcı başarıyla silindi.' });

  } catch (err) {
    console.error('[AUTH][DELETE USER] Hata:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// Kullanıcı Listeleme (Sadece aktif olanlar, PIN hariç)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }, '-__v -pin').lean();
    return res.json(users);
  } catch (err) {
    console.error('[AUTH][LIST USERS] Hata:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};

// İşten çıkarma (Deaktivasyon)
exports.deactivateUser = async (req, res) => {
  try {
    const { pin } = req.params;
    if (!pin) {
      return res.status(400).json({ error: 'PIN zorunludur.' });
    }

    const user = await User.findOne({ pin: pin.toUpperCase() });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }

    if (!user.isActive) {
      return res.status(400).json({ error: 'Kullanıcı zaten işten çıkarılmış.' });
    }

    user.isActive = false;
    await user.save();

    return res.json({ message: 'Kullanıcı işten çıkarıldı.' });
  } catch (err) {
    console.error('[AUTH][DEACTIVATE USER] Hata:', err);
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
};
