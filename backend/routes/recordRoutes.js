const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const recordController = require('../controllers/recordController');
const { authenticate } = require('../middleware/auth');

// Upload klasörü kontrolü ve yoksa oluşturulması
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer ayarları
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error('Geçersiz dosya uzantısı'));
    }
    // Dosya adı olarak zaman damgası + uzantı
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      // İzin verilmeyen dosya uzantısı ise hata oluştur
      req.fileValidationError = 'Geçersiz dosya uzantısı';
      return cb(null, false, new Error('Geçersiz dosya uzantısı'));
    }
    cb(null, true);
  }
});

// Routes

// Yeni kayıt oluşturma (fotoğraf destekli)
// authenticate middleware ile sadece giriş yapmış kullanıcı erişebilir
router.post(
  '/',
  authenticate,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (req.fileValidationError) {
        return res.status(400).json({ error: req.fileValidationError });
      }
      await recordController.createRecord(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Üretim özetleri (günlük, haftalık, aylık toplam m²)
router.get('/summary', authenticate, recordController.getSummary);

// Operatör bazlı toplam üretim m² özetleri
router.get('/operator-summary', authenticate, recordController.getOperatorSummary);

// Analiz endpointleri - authenticate edilmiş kullanıcılar erişebilir
router.get('/analiz/tezgah-uretim', authenticate, recordController.getTezgahUretim);
router.get('/analiz/vardiya-uretim', authenticate, recordController.getVardiyaUretim);
router.get('/analiz/tezgah-atki', authenticate, recordController.getTezgahAtki);
router.get('/analiz/personel-uretim', authenticate, recordController.getPersonelUretim);
router.get('/analiz/durus-nedeni', authenticate, recordController.getDurusNedeni);
router.get('/analiz/tezgah-durus', authenticate, recordController.getTezgahDurusSuresi);
router.get('/analiz/top3-personel', authenticate, recordController.getTop3Personel);

module.exports = router;
