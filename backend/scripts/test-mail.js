require("dotenv").config({ path: __dirname + "/../.env" });
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Record = require("../models/Record");
const SiteSettings = require("../models/siteSettings");
const { exportRecordsToExcel } = require("../utils/excelExporter");
const { sendEmailWithAttachment } = require("../config/mailer");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı");

    const now = new Date();
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

    const reportDate = now.toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const settings = await SiteSettings.findOne({});
    const siteName = settings?.firmaAdi || "LoomTracker";

    const records = await Record.find({
      date: { $gte: firstDay, $lte: lastDay },
    }).lean();

    const baseHtml = (extraHtml = "") => `
      <div style="font-family:Arial, sans-serif; color:#2c2c2c; line-height:1.6;">
        <h2 style="color:#4a148c;">${siteName} — ${monthLabel} Ayı Aylık Üretim Raporu</h2>

        <p>Değerli Yönetim Ekibi,</p>

        <p>
          ${monthLabel} ayına ait üretim verilerini, duruş analizlerini ve performans özetini içeren
          aylık rapor ekte bilginize sunulmuştur.
        </p>

        <p><strong>Rapor Özeti:</strong></p>
        <ul>
          <li>Toplam kayıt sayısı: <strong>${records.length}</strong></li>
          <li>Rapor oluşturulma tarihi: <strong>${reportDate}</strong></li>
        </ul>

        ${extraHtml}

        <p>
          Detaylı veriler ve analizler için ekteki Excel dosyasını inceleyebilirsiniz.
        </p>

        <p>
          Bilgilerinize sunar, iyi çalışmalar dileriz.
        </p>

        <p style="margin-top:30px;">
          Saygılarımla,<br/>
          <strong>Planlama — Ahmet Şahin</strong>
        </p>

        <hr style="margin-top:40px; border:none; border-top:1px solid #ccc;">

        <p style="font-size:12px; color:#888; text-align:center;">
          Bu e-posta, 
          <a href="https://pizzadevelopment.net" target="_blank" style="color:#888; text-decoration:underline;">
            Pizza Development Sistemleri
          </a> tarafından otomatik olarak gönderilmiştir.
        </p>
      </div>
    `;

    if (!records || records.length === 0) {
      const warningHtml = `
        <p style="color:#a94442; background:#fdf3f3; border-left:5px solid #e53935; padding:12px; border-radius:6px;">
          <strong>🛑 Veri bulunamadı:</strong> Bu aya ait sistemde herhangi bir üretim kaydı yer almamaktadır.
        </p>
      `;

      await sendEmailWithAttachment({
        to: process.env.MAIL_TARGET,
        subject: `[${monthLabel}] Aylık LoomTracker Raporu - Veri Yok`,
        html: baseHtml(warningHtml),
      });

      console.log("✅ Uyarı maili gönderildi: Veri yok.");
    } else {
      const filename = `monthly-report-${siteName.replace(/\s+/g, "")}-${firstDay.toISOString().slice(0, 7)}.xlsx`;
      const outputPath = path.join(__dirname, "../uploads/temp", filename);

      if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      }

      await exportRecordsToExcel(records, outputPath, siteName, monthLabel);

      await sendEmailWithAttachment({
        to: process.env.MAIL_TARGET,
        subject: `[${monthLabel}] Aylık LoomTracker Raporu`,
        html: baseHtml(),
        attachmentPath: outputPath,
      });

      console.log(`✅ Rapor gönderildi → ${filename}`);
    }
  } catch (err) {
    console.error("❌ Rapor gönderilemedi:", err.message);
  } finally {
    mongoose.connection.close();
  }
})();
