const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const { exportRecordsToExcel } = require("../utils/excelExporter");
const Record = require("../models/Record");
const SiteSettings = require("../models/siteSettings");
const { sendEmailWithAttachment } = require("../config/mailer");

cron.schedule("0 9 1 * *", async () => {
  try {
    // 1. MongoDB bağlantısı (cron her tetiklendiğinde bağlan)
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB bağlantısı başarılı");

    const now = new Date();
    const monthLabel = new Date(now.getFullYear(), now.getMonth() - 1).toLocaleString("tr-TR", {
      year: "numeric",
      month: "long",
    });

    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // 2. Firma ayarı çek
    const settings = await SiteSettings.findOne({});
    const siteName = settings?.firmaAdi || "LoomTracker";

    // 3. Veriler
    const records = await Record.find({
      date: { $gte: firstDay, $lte: lastDay },
    }).lean();

    // 4. Dosya yolu hazırla
    const filename = `monthly-report-${siteName.replace(/\s+/g, "")}-${firstDay.toISOString().slice(0, 7)}.xlsx`;
    const outputPath = path.join(__dirname, "../uploads/temp", filename);

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    // 5. Excel dosyasını boş olsa da oluştur
    await exportRecordsToExcel(records, outputPath, siteName, monthLabel);

    // 6. Mail içeriği (veri yoksa uyarı ekle)
    const htmlBody = `
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
  
    ${records.length === 0 
      ? `<p style="color:#a94442; background:#fdf3f3; border-left:5px solid #e53935; padding:12px; border-radius:6px;">
           <strong>🛑 Veri bulunamadı:</strong> Bu aya ait sistemde herhangi bir üretim kaydı yer almamaktadır.
         </p>` 
      : ''}
  
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

    // 7. Mail gönderimi
    await sendEmailWithAttachment({
      to: process.env.MAIL_TARGET,
      subject: `[${monthLabel}] Aylık LoomTracker Raporu`,
      html: htmlBody,
      attachmentPath: outputPath,
    });

    console.log(`✅ Aylık rapor başarıyla gönderildi → ${filename}`);
  } catch (err) {
    console.error("❌ Aylık rapor gönderiminde hata:", err);
  } finally {
    // 8. Bağlantıyı kapat
    await mongoose.connection.close();
  }
});
