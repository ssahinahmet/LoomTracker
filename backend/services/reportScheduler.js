require("dotenv").config({ path: __dirname + "/../.env" });

const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const { exportRecordsToExcel } = require("../utils/excelExporter");
const Record = require("../models/Record");
const SiteSettings = require("../models/siteSettings");
const { sendEmailWithAttachment } = require("../config/mailer");

cron.schedule("0 10 1 * *", async () => {
  let outputPath = null;
  try {
    // 1. MongoDB bağlantısı
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı");

    // 2. Tarih hesaplamaları
    const now = new Date();
    const reportDate = now.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const year = now.getFullYear();
    const prevMonth = now.getMonth() - 1;
    const targetMonth = prevMonth >= 0 ? prevMonth : 11;
    const targetYear = prevMonth >= 0 ? year : year - 1;

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const monthLabel = new Date(targetYear, targetMonth).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
    });

    // 3. Firma bilgisi
    const settings = await SiteSettings.findOne({});
    const siteName = settings?.firmaAdi || "LoomTracker";

    // 4. Kayıtları çek
    const records = await Record.find({
      date: { $gte: firstDay, $lte: lastDay },
    }).lean();

    // 5. Excel dosyasını oluştur
    const filename = `monthly-report-${siteName.replace(/\s+/g, "")}-${firstDay.toISOString().slice(0, 7)}.xlsx`;
    outputPath = path.join(__dirname, "../uploads/temp", filename);

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    // Eğer veri varsa Excel dosyasını oluştur
    if (records.length > 0) {
      await exportRecordsToExcel(records, outputPath, siteName, monthLabel);
    }

    // 6. Mail içeriği
    const warningHtml = records.length === 0
      ? `<p style="color:#a94442; background:#fdf3f3; border-left:5px solid #e53935; padding:12px; border-radius:6px;">
           <strong>🛑 Veri bulunamadı:</strong> ${monthLabel} ayına ait sistemde herhangi bir üretim kaydı yer almamaktadır.
         </p>`
      : "";

    const htmlBody = `
      <div style="font-family:Arial, sans-serif; color:#2c2c2c; line-height:1.6;">
        <h2 style="color:#4a148c;">${siteName} — ${monthLabel} Ayı Aylık Üretim Raporu</h2>
        <p>Değerli Yönetim Ekibi,</p>
        <p>${monthLabel} ayına ait üretim verilerini, duruş analizlerini ve performans özetini içeren aylık rapor ${records.length > 0 ? "ekte" : "aşağıda"} bilginize sunulmuştur.</p>
        <p><strong>Rapor Özeti:</strong></p>
        <ul>
          <li>Toplam kayıt sayısı: <strong>${records.length}</strong></li>
          <li>Rapor oluşturulma tarihi: <strong>${reportDate}</strong></li>
        </ul>
        ${warningHtml}
        <p>Detaylı veriler ${records.length > 0 ? "ekteki Excel dosyasında yer almaktadır." : "bulunamadığı için Excel dosyası eklenmemiştir."}</p>
        <p>Bilgilerinize sunar, iyi çalışmalar dileriz.</p>
        <p style="margin-top:30px;">Saygılarımla,<br/><strong>Planlama — Ahmet Şahin</strong></p>
        <hr style="margin-top:40px; border:none; border-top:1px solid #ccc;">
        <p style="font-size:12px; color:#888; text-align:center;">
          Bu e-posta, 
          <a href="https://pizzadevelopment.net" target="_blank" style="color:#888; text-decoration:underline;">
            Pizza Development
          </a> tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    `;

    // 7. Mail gönder
    await sendEmailWithAttachment({
      to: process.env.MAIL_TARGET,
      subject: `[${monthLabel}] Aylık LoomTracker Raporu`,
      html: htmlBody,
      attachmentPath: records.length > 0 ? outputPath : null,
    });

    console.log(`✅ Aylık rapor gönderildi → ${records.length > 0 ? filename : "Veri yok, raporsuz e-posta gönderildi."}`);
  } catch (err) {
    console.error("❌ Aylık rapor gönderiminde hata:", err);
  }
}, {
  timezone: "Europe/Istanbul"
});
