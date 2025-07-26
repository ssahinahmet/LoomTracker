const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

function formatDateTR(date) {
  const d = new Date(date);
  if (isNaN(d)) return "Bilinmiyor";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

async function exportRecordsToExcel(records, outputPath, siteName, monthLabel) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("Veri kaydı yok veya geçersiz.");
  }

  // Klasör yoksa oluştur
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();

  // ---------------------- 1. GENEL ÖZET ----------------------
  const summarySheet = workbook.addWorksheet("Genel Özet");

  const totalWeft = records.reduce((sum, r) => sum + (r.weftCount || 0), 0);
  const totalDowntime = records.reduce((sum, r) => sum + (r.downtime || 0), 0);
  const uniqueDays = new Set(records.map(r => {
    const date = new Date(r.date);
    return isNaN(date) ? null : formatDateTR(date);
  })).size || 1;

  const avgWeftPerDay = totalWeft / uniqueDays;

  const operatorStats = {};
  const loomStats = {};
  const shiftStats = {};

  records.forEach(r => {
    const operator = r.operatorName || "Bilinmiyor";
    const loom = r.loomNo || "Bilinmiyor";
    const shift = r.shift || "Bilinmiyor";

    // Operatör istatistikleri
    if (!operatorStats[operator]) {
      operatorStats[operator] = { weft: 0, downtime: 0, count: 0 };
    }
    operatorStats[operator].weft += r.weftCount || 0;
    operatorStats[operator].downtime += r.downtime || 0;
    operatorStats[operator].count++;

    // Tezgah istatistikleri
    if (!loomStats[loom]) loomStats[loom] = { downtime: 0 };
    loomStats[loom].downtime += r.downtime || 0;

    // Vardiya istatistikleri
    if (!shiftStats[shift]) shiftStats[shift] = { weft: 0 };
    shiftStats[shift].weft += r.weftCount || 0;
  });

  const mostEfficientOpEntry = Object.entries(operatorStats).sort((a, b) => b[1].weft - a[1].weft)[0];
  const mostDowntimeLoomEntry = Object.entries(loomStats).sort((a, b) => b[1].downtime - a[1].downtime)[0];
  const bestShiftEntry = Object.entries(shiftStats).sort((a, b) => b[1].weft - a[1].weft)[0];

  const mostEfficientOp = mostEfficientOpEntry
    ? `${mostEfficientOpEntry[0]} (${mostEfficientOpEntry[1].weft} atkı)`
    : "Veri yok";

  const mostDowntimeLoom = mostDowntimeLoomEntry
    ? `Tezgah ${mostDowntimeLoomEntry[0]} (${mostDowntimeLoomEntry[1].downtime} dk)`
    : "Veri yok";

  const bestShift = bestShiftEntry
    ? `${bestShiftEntry[0]} (${bestShiftEntry[1].weft} atkı)`
    : "Veri yok";

  const summaryData = [
    ["Firma", siteName || "Bilinmiyor"],
    ["Raporlanan Ay", monthLabel],
    ["Toplam Atkı", totalWeft],
    ["Toplam Duruş Süresi (dk)", totalDowntime],
    ["Ortalama Atkı / Gün", avgWeftPerDay.toFixed(2)],
    ["En Verimli Operatör", mostEfficientOp],
    ["En Çok Duran Tezgah", mostDowntimeLoom],
    ["En Verimli Vardiya", bestShift],
  ];
  summaryData.forEach(row => summarySheet.addRow(row));

  // ---------------------- 2. GÜNLÜK VERİLER ----------------------
  const dailySheet = workbook.addWorksheet("Günlük Veriler");
  dailySheet.columns = [
    { header: "Tarih", key: "date", width: 15 },
    { header: "Tezgah No", key: "loomNo", width: 12 },
    { header: "Vardiya", key: "shift", width: 15 },
    { header: "Operatör", key: "operatorName", width: 20 },
    { header: "Atkı Sayısı", key: "weftCount", width: 15 },
    { header: "Duruş (dk)", key: "downtime", width: 15 },
    { header: "Not", key: "note", width: 30 },
  ];

  records.forEach(r => {
    dailySheet.addRow({
      date: formatDateTR(r.date),
      loomNo: r.loomNo || "Bilinmiyor",
      shift: r.shift || "Bilinmiyor",
      operatorName: r.operatorName || "Bilinmiyor",
      weftCount: r.weftCount || 0,
      downtime: r.downtime || 0,
      note: r.note || "",
    });
  });

  // ---------------------- 3. OPERATÖR PERFORMANSI ----------------------
  const operatorSheet = workbook.addWorksheet("Operatör Performansı");
  operatorSheet.columns = [
    { header: "Operatör", key: "name", width: 20 },
    { header: "Toplam Atkı", key: "weft", width: 15 },
    { header: "Toplam Duruş", key: "downtime", width: 15 },
    { header: "Ort. Atkı/Vardiya", key: "avgWeft", width: 20 },
    { header: "Vardiya Sayısı", key: "count", width: 15 },
  ];

  Object.entries(operatorStats).forEach(([name, data]) => {
    operatorSheet.addRow({
      name,
      weft: data.weft,
      downtime: data.downtime,
      avgWeft: data.count ? (data.weft / data.count).toFixed(2) : "0.00",
      count: data.count,
    });
  });

  // ---------------------- 4. TEZGAH DURUMU ----------------------
  const loomSheet = workbook.addWorksheet("Tezgah Durumu");
  loomSheet.columns = [
    { header: "Tezgah No", key: "loom", width: 12 },
    { header: "Toplam Duruş (dk)", key: "downtime", width: 20 },
  ];

  Object.entries(loomStats).forEach(([loom, data]) => {
    loomSheet.addRow({ loom, downtime: data.downtime });
  });

  // ---------------------- 5. VARDİYA VERİMLİLİĞİ ----------------------
  const shiftSheet = workbook.addWorksheet("Vardiya Verimliliği");
  shiftSheet.columns = [
    { header: "Vardiya", key: "shift", width: 20 },
    { header: "Toplam Atkı", key: "weft", width: 20 },
  ];

  Object.entries(shiftStats).forEach(([shift, data]) => {
    shiftSheet.addRow({ shift, weft: data.weft });
  });

  // Kaydet
  await workbook.xlsx.writeFile(outputPath);

  console.log(`[${formatDateTR(new Date())}] Excel dosyası oluşturuldu → ${outputPath}`);
}

// --- TEST için elle çağrı ---
if (require.main === module) {
  (async () => {
    try {
      const dummyRecords = [
        {
          date: new Date(),
          loomNo: "1",
          shift: "07:00 - 15:00",
          operatorName: "Ahmet",
          weftCount: 1000,
          downtime: 15,
          note: "Test notu",
        },
        {
          date: new Date(),
          loomNo: "2",
          shift: "15:00 - 23:00",
          operatorName: "Mehmet",
          weftCount: 850,
          downtime: 5,
          note: "",
        },
      ];
      const filename = `test-export-${Date.now()}.xlsx`;
      const outputPath = path.join(__dirname, "../uploads/temp", filename);
      await exportRecordsToExcel(dummyRecords, outputPath, "LoomTracker", "Temmuz 2025");
    } catch (e) {
      console.error("Test başarısız:", e);
    }
  })();
}

module.exports = { exportRecordsToExcel };
