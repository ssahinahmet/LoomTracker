const User = require('../models/User');

/**
 * authenticate - Kullanıcının PIN'i ile kimlik doğrulaması yapar.
 * PIN hem harf hem sayı içerebilir, 8 karakter uzunluğunda olmalı.
 * Gelen PIN header'dan alınır: 'x-auth-pin'
 * Doğrulama başarılıysa, kullanıcı nesnesi req.user olarak atanır.
 */
const authenticate = async (req, res, next) => {
  let pin = req.header('x-auth-pin');

  // PIN var mı ve uzunluğu 8 mi kontrol et
  if (!pin || typeof pin !== 'string' || pin.length !== 8) {
    return res.status(401).json({ error: 'PIN gerekli ve 8 karakter uzunluğunda olmalıdır' });
  }

  // PIN sadece harf ve rakamlardan oluşmalı
  const pinRegex = /^[A-Za-z0-9]{8}$/;
  if (!pinRegex.test(pin)) {
    return res.status(401).json({ error: 'PIN sadece harf ve rakamlardan oluşabilir' });
  }

  try {
    pin = pin.toUpperCase(); // PIN'i normalize et

    // PIN veritabanında büyük harf olarak saklanmalı (createUser kısmında da yapmalısın)
    const user = await User.findOne({ pin });

    if (!user) {
      return res.status(401).json({ error: 'Geçersiz PIN' });
    }

    req.user = user; // sonraki middleware ve controllerlarda kullanılmak üzere kullanıcı bilgisi

    next(); // başarılı, diğer middleware’e geç
  } catch (err) {
    console.error('Auth middleware hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

/**
 * isAdmin - Sadece admin rolüne izin verir.
 * req.user.authenticate tarafından atanmış olmalıdır.
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Kimlik doğrulaması yapılmamış' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yetkisiz erişim: Sadece adminler izinli' });
  }

  next();
};

/**
 * isOperator - Sadece operator rolüne izin verir.
 */
const isOperator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Kimlik doğrulaması yapılmamış' });
  }

  if (req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Yetkisiz erişim: Sadece operatörler izinli' });
  }

  next();
};

/**
 * isMakinist - Sadece makinist rolüne izin verir.
 */
const isMakinist = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Kimlik doğrulaması yapılmamış' });
  }

  if (req.user.role !== 'makinist') {
    return res.status(403).json({ error: 'Yetkisiz erişim: Sadece makinistler izinli' });
  }

  next();
};

/**
 * isOperatorOrAdmin - Operatör ya da admin rolü için izin.
 */
const isOperatorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Kimlik doğrulaması yapılmamış' });
  }

  if (req.user.role !== 'operator' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Yetkisiz erişim: Operatör veya admin olmalısınız' });
  }

  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isOperator,
  isMakinist,
  isOperatorOrAdmin
};
