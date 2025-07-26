const Record = require('../models/Record');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const TEZGAH_ENI = 4; // Tezgah eni metre cinsinden

/**
 * Duruş süresi hesaplama fonksiyonu
 * @param {number} devir 
 * @param {number} atki 
 * @returns {number} duruş süresi dakika cinsinden, negatifse 0 döner
 */
function calculateDurusSuresi(devir, atki) {
  const x = devir * 1680 * 0.8;
  const y = atki;
  const denominator = (x / 3) / 480;
  if (denominator === 0) return 0;
  const result = (((x / 3) - y) / denominator);
  if (isNaN(result) || result < 0) return 0;
  return result;
}

/**
 * Yeni üretim kaydı oluşturur.
 * - userId ve operator_id zorunlu değil,
 * - operator ismi frontend’den geliyor.
 */
exports.createRecord = async (req, res) => {
  try {
    let {
      tarih,
      tezgah_no,
      vardiya,
      operator,   // Operatör adı frontend'den alınıyor
      devir,
      atki,
      atki_sikligi,
      durus_nedeni
    } = req.body;

    // Zorunlu alan kontrolü (userId ve operator_id yok)
    if (!tarih || !tezgah_no || !vardiya || !operator || devir == null || atki == null || atki_sikligi == null) {
      return res.status(400).json({ error: 'Gerekli tüm alanları doldurun.' });
    }

    // Tarih format kontrolü
    if (isNaN(Date.parse(tarih))) {
      return res.status(400).json({ error: 'Geçersiz tarih formatı.' });
    }

    // Vardiya kontrolü (sadece belirlenen 3 vardiya kabul edilir)
    const validVardiyalar = ['07:00-15:00', '15:00-23:00', '23:00-07:00'];
    if (!validVardiyalar.includes(vardiya)) {
      return res.status(400).json({ error: `Vardiya geçersiz. Seçenekler: ${validVardiyalar.join(', ')}` });
    }

    // Sayısal alanlar dönüşümü ve validasyonu
    devir = Number(devir);
    atki = Number(atki);
    atki_sikligi = Number(atki_sikligi);

    if (isNaN(devir) || devir < 0) return res.status(400).json({ error: 'Devir pozitif sayı olmalı.' });
    if (isNaN(atki) || atki < 0) return res.status(400).json({ error: 'Atkı pozitif sayı olmalı.' });
    if (isNaN(atki_sikligi) || atki_sikligi <= 0) return res.status(400).json({ error: 'Atkı sıklığı pozitif sayı olmalı.' });

    // m² hesabı (atkı sayısı / (atkı sıklığı * 10) * tezgah eni * 2)
    const m2 = (atki / (atki_sikligi * 10)) * (TEZGAH_ENI * 2);
    if (m2 < 0) return res.status(400).json({ error: 'Hesaplanan metrekare negatif, verileri kontrol edin.' });

    // Duruş süresi hesaplama
    const durus_suresi = calculateDurusSuresi(devir, atki);

    // Yeni Record oluşturma (operator_id yok)
    const record = new Record({
      tarih: new Date(tarih),
      tezgah_no,
      vardiya,
      operator,
      devir,
      atki,
      atki_sikligi,
      durus_nedeni: durus_nedeni || null,
      durus_suresi,
      m2
    });

    // Eğer dosya varsa izin kontrolü ve taşınması
    if (req.file) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return res.status(400).json({ error: 'Geçersiz dosya türü. Sadece jpg, jpeg, png, gif izinlidir.' });
      }
      // Benzersiz dosya adı için uuid kullan
      const newFilename = uuidv4() + ext;
      const uploadPath = path.join(__dirname, '..', 'uploads', newFilename);
      await fs.rename(req.file.path, uploadPath);
      record.photoFilename = newFilename;
    }

    // Veritabanına kaydet
    await record.save();

    return res.status(201).json({ message: 'Kayıt başarıyla oluşturuldu', record });

  } catch (error) {
    console.error('Record create error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

/**
 * --- ÜRETİM ÖZETLERİ ---
 * Günlük, haftalık, aylık toplam üretim m² verisini döner
 */
exports.getSummary = async (req, res) => {
  try {
    const daily = await Record.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$tarih' } },
          totalM2: { $sum: '$m2' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const weekly = await Record.aggregate([
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$tarih' },
            week: { $isoWeek: '$tarih' }
          },
          totalM2: { $sum: '$m2' }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);
    const monthly = await Record.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$tarih' } },
          totalM2: { $sum: '$m2' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    return res.json({ daily, weekly, monthly });
  } catch (error) {
    console.error('Get summary error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

/**
 * Operatör bazlı toplam üretim m² özetini döner
 */
exports.getOperatorSummary = async (req, res) => {
  try {
    const summary = await Record.aggregate([
      {
        $group: {
          _id: "$operator",
          totalM2: { $sum: "$m2" }
        }
      },
      {
        $project: {
          _id: 0,
          operator: "$_id",
          totalM2: 1
        }
      }
    ]);
    return res.json(summary);
  } catch (error) {
    console.error('Get operator summary error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
};

/**
 * --- ÜRETİM ANALİZ FONKSİYONLARI ---
 * Tezgah bazlı, vardiya bazlı, personel bazlı üretim, duruş süreleri vb.
 */

exports.getTezgahUretim = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      { $group: { _id: "$tezgah_no", toplam_m2: { $sum: "$m2" } } },
      { $sort: { toplam_m2: -1 } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Tezgah üretim analizi hata:', error);
    res.status(500).json({ error: "Tezgah üretim analizi başarısız" });
  }
};

exports.getVardiyaUretim = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      { $group: { _id: "$vardiya", toplam_m2: { $sum: "$m2" } } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Vardiya üretim analizi hata:', error);
    res.status(500).json({ error: "Vardiya üretim analizi başarısız" });
  }
};

exports.getTezgahAtki = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      { $group: { _id: "$tezgah_no", toplam_atki: { $sum: "$atki" } } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Tezgah atkı analizi hata:', error);
    res.status(500).json({ error: "Tezgah atkı analizi başarısız" });
  }
};

exports.getPersonelUretim = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      {
        $group: {
          _id: "$operator",
          toplam_m2: { $sum: "$m2" },
          toplam_atki: { $sum: "$atki" }
        }
      },
      { $sort: { toplam_m2: -1 } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Personel üretim analizi hata:', error);
    res.status(500).json({ error: "Personel üretim analizi başarısız" });
  }
};

exports.getDurusNedeni = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      { $match: { durus_nedeni: { $ne: null } } },
      {
        $group: {
          _id: "$durus_nedeni",
          toplam_dakika: { $sum: "$durus_suresi" }
        }
      },
      { $sort: { toplam_dakika: -1 } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Duruş nedeni analizi hata:', error);
    res.status(500).json({ error: "Duruş nedeni analizi başarısız" });
  }
};

exports.getTezgahDurusSuresi = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      { $group: { _id: "$tezgah_no", toplam_durus: { $sum: "$durus_suresi" } } }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Tezgah duruş süresi analizi hata:', error);
    res.status(500).json({ error: "Tezgah duruş süresi analizi başarısız" });
  }
};

exports.getTop3Personel = async (req, res) => {
  try {
    const sonuc = await Record.aggregate([
      {
        $group: {
          _id: "$operator",
          toplam_m2: { $sum: "$m2" }
        }
      },
      { $sort: { toplam_m2: -1 } },
      { $limit: 3 }
    ]);
    res.json(sonuc);
  } catch (error) {
    console.error('Top 3 personel analizi hata:', error);
    res.status(500).json({ error: "Top 3 personel analizi başarısız" });
  }
};