const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Helper: Yeni benzersiz userId oluştur
async function generateNewUserId() {
  const lastUser = await User.find({ userId: /^pizza\d+$/ })
    .sort({ userId: -1 }) // büyükten küçüğe sırala
    .limit(1);

  let newIdNumber = 1;
  if (lastUser.length > 0) {
    const lastId = lastUser[0].userId; // pizza00003 gibi
    const num = parseInt(lastId.replace("pizza", ""), 10);
    if (!isNaN(num)) newIdNumber = num + 1;
  }

  return "pizza" + newIdNumber.toString().padStart(5, "0");
}

// Operatör Ekle
router.post("/operator", async (req, res) => {
  const { name, pin } = req.body;

  if (!name || !pin) {
    return res.status(400).json({ message: "İsim ve PIN zorunludur." });
  }

  if (!/^\d{8}$/.test(pin)) {
    return res.status(400).json({ message: "PIN 8 haneli olmalı." });
  }

  try {
    const exists = await User.findOne({ pin, role: "operator" });
    if (exists) {
      return res.status(409).json({ message: "Bu PIN zaten kullanılıyor." });
    }

    const newUserId = await generateNewUserId();

    const newOperator = new User({
      name,
      pin,
      role: "operator",
      userId: newUserId,
      isActive: true, // ekle bunu da açık kalsın başta
    });

    await newOperator.save();
    return res.status(201).json(newOperator);
  } catch (err) {
    console.error("Operatör ekleme hatası:", err);
    return res.status(500).json({ message: "Kayıt sırasında sunucu hatası oluştu." });
  }
});

// Operatör Listele
router.get("/operators", async (req, res) => {
  try {
    // isActive alanını da seçiyoruz ki frontend görebilsin
    const users = await User.find({ role: "operator" }).select("name pin userId _id isActive");
    return res.json(users);
  } catch (err) {
    console.error("Operatör listeleme hatası:", err);
    return res.status(500).json({ message: "Listeleme hatası" });
  }
});

// Operatör Sil - ID ile
router.delete("/operator/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await User.deleteOne({ _id: id, role: "operator" });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Operatör bulunamadı." });
    }

    return res.json({ message: "Operatör silindi." });
  } catch (err) {
    console.error("Operatör silme hatası (ID):", err);
    return res.status(500).json({ message: "Silme hatası." });
  }
});

// Operatör Sil - PIN ile
router.delete("/operator/pin/:pin", async (req, res) => {
  const { pin } = req.params;

  try {
    const result = await User.deleteOne({ pin, role: "operator" });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Bu PIN'e sahip operatör bulunamadı." });
    }

    return res.json({ message: "Operatör silindi." });
  } catch (err) {
    console.error("Operatör silme hatası (PIN):", err);
    return res.status(500).json({ message: "Silme hatası." });
  }
});

// ======= Ekleme: İşten çıkarma (pasifleştirme) =======
router.patch("/operator/deactivate/:pin", async (req, res) => {
  const { pin } = req.params;

  if (!pin) {
    return res.status(400).json({ message: "PIN zorunludur." });
  }

  try {
    const user = await User.findOne({ pin, role: "operator" });
    if (!user) {
      return res.status(404).json({ message: "Bu PIN'e sahip operatör bulunamadı." });
    }

    user.isActive = false;
    await user.save();

    return res.json({ message: "Operatör işten çıkarıldı (pasif edildi)." });
  } catch (err) {
    console.error("Operatör işten çıkarma hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
