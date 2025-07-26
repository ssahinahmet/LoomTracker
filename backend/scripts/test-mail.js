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

    const monthLabel = new Date(targetYear, targetMonth).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
    });

    const settings = await SiteSettings.findOne({});
    const siteName = settings?.firmaAdi || "LoomTracker";

    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const records = await Record.find({
      date: { $gte: firstDay, $lte: lastDay },
    }).lean();

    const filename = `monthly-report-${siteName.replace(/\s+/g, "")}-${firstDay
      .toISOString()
      .slice(0, 7)}.xlsx`;
    const outputPath = path.join(__dirname, "../uploads/temp", filename);

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    await exportRecordsToExcel(records, outputPath, siteName, monthLabel);

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;color:#333;">
        <h2>${siteName} - ${monthLabel} Aylık Üretim Raporu</h2>
        <p>Merhaba,</p>
        <p>Ek'te ${monthLabel} ayına ait üretim, duruş ve verimlilik analiz raporu bulunmaktadır.</p>
        <ul>
          <li>Toplam kayıt sayısı: <strong>${records.length}</strong></li>
          <li>Rapor tarihi: <strong>${new Date().toLocaleDateString("tr-TR")}</strong></li>
        </ul>
        ${
          records.length === 0
            ? "<p style='color:#b00;'><strong>⚠️ Not:</strong> Bu ay için sistemde kayıtlı veri bulunmamaktadır.</p>"
            : ""
        }
        <p>İyi çalışmalar.<br/>LoomTracker Otomasyon Sistemi</p>
      </div>
    `;

    await sendEmailWithAttachment({
      to: process.env.MAIL_TARGET,
      subject: `[${monthLabel}] Aylık LoomTracker Raporu`,
      html: htmlBody,
      attachmentPath: outputPath,
    });

    console.log(`✅ Rapor gönderildi → ${filename}`);
  } catch (err) {
    console.error("❌ Rapor gönderilemedi:", err.message);
  } finally {
    mongoose.connection.close();
  }
})();
