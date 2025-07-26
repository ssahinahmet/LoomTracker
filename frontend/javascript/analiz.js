// ========== 1. Yardımcı Fonksiyonlar ==========

function getAuthPin() {
  return localStorage.getItem('pin') || null;
}

function getUserRole() {
  return localStorage.getItem('role') || null;
}

function formatM2(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return "0 m²";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M m²";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K m²";
  return num.toFixed(1) + " m²";
}

// ========== 2. API Veri Çekme Fonksiyonu ==========

async function fetchData(url) {
  const pin = getAuthPin();
  if (!pin) throw new Error('PIN bulunamadı. Lütfen giriş yapınız.');

  const res = await fetch(url, {
    headers: { 'x-auth-pin': pin }
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Yetkisiz erişim. PIN hatalı veya yetkiniz yok.');
    throw new Error(`Veri alınamadı (HTTP ${res.status})`);
  }

  return res.json();
}

// ========== 3. Genel Tablo Doldurma Fonksiyonu ==========

function fillTable(tbodySelector, data, columns) {
  const tbody = document.querySelector(tbodySelector);
  if (!tbody) {
    console.warn(`Tablo gövdesi bulunamadı: ${tbodySelector}`);
    return;
  }
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${columns.length}" style="text-align:center; padding:12px; color:#888;">Veri bulunamadı</td></tr>`;
    return;
  }

  data.forEach(item => {
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.style.padding = '8px';
      td.style.borderBottom = '1px solid #444';
      td.style.textAlign = col.align || 'left';

      let val = typeof col.key === 'function' ? col.key(item) : item[col.key];
      if (col.format) val = col.format(val);

      td.textContent = val ?? '';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

// ========== 4. Temel Üretim Analizleri ve Tablolar ==========

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('tr-TR');
}

async function loadAnalytics() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/summary");
    console.log("loadAnalytics data:", data);

    const dailyTotal = data.daily.reduce((sum, d) => sum + d.totalM2, 0);
    const weeklyTotal = data.weekly.reduce((sum, d) => sum + d.totalM2, 0);
    const monthlyTotal = data.monthly.reduce((sum, d) => sum + d.totalM2, 0);



    fillTable("#dailyTable tbody", data.daily, [
      { key: d => formatDate(d._id), align: 'left' },
      { key: 'totalM2', format: formatM2, align: 'right' }
    ]);

    fillTable("#weeklyTable tbody", data.weekly.map(d => ({
      _id: `Yıl: ${d._id.year} Hafta: ${d._id.week}`,
      totalM2: d.totalM2
    })), [
      { key: '_id', align: 'left' },
      { key: 'totalM2', format: formatM2, align: 'right' }
    ]);

    fillTable("#monthlyTable tbody", data.monthly, [
      { key: d => {
        if (typeof d._id === 'string') {
          const parts = d._id.split("-");
          if (parts.length === 2) {
            const year = parts[0];
            const month = parts[1];
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
          }
        }
        return d._id;
      }, align: 'left' },
      { key: 'totalM2', format: formatM2, align: 'right' }
    ]);
  } catch (err) {
    console.error("Analiz yüklenirken hata:", err);
    ['dailyValue', 'weeklyValue', 'monthlyValue'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "Veri alınamadı";
    });
    alert(err.message);
  }
}

// ========== 5. Diğer Tablo Yükleme Fonksiyonları (LOG EKLENDİ) ==========

async function loadOperatorM2() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/operator-summary");
    console.log("loadOperatorM2 data:", data);
    fillTable("#operatorM2Table tbody", data, [
      { key: 'operator', align: 'left' },
      { key: 'totalM2', format: formatM2, align: 'right' }
    ]);
  } catch (err) {
    console.error("Operatör m² yüklenirken hata:", err);
    fillTable("#operatorM2Table tbody", [], [{}, {}]);
  }
}

async function loadTezgahAtki() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/tezgah-atki");
    console.log("loadTezgahAtki data:", data);
    fillTable("#tezgahAtkiTable tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_atki', format: v => v.toLocaleString(), align: 'right' }
    ]);
  } catch (err) {
    console.error("Tezgah atkı yüklenirken hata:", err);
    fillTable("#tezgahAtkiTable tbody", [], [{}, {}]);
  }
}

async function loadTezgahUretim() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/tezgah-uretim");
    console.log("loadTezgahUretim data:", data);
    fillTable("#tezgahUretimTable tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_m2', format: formatM2, align: 'right' }
    ]);
  } catch (err) {
    console.error("Tezgah üretim yüklenirken hata:", err);
    fillTable("#tezgahUretimTable tbody", [], [{}, {}]);
  }
}

async function loadPersonelUretim() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/personel-uretim");
    console.log("loadPersonelUretim data:", data);
    fillTable("#personelUretimTable tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_m2', format: formatM2, align: 'right' },
      { key: 'toplam_atki', format: v => v.toLocaleString(), align: 'right' }
    ]);
  } catch (err) {
    console.error("Personel üretim yüklenirken hata:", err);
    fillTable("#personelUretimTable tbody", [], [{}, {}, {}]);
  }
}

async function loadDurusNedenleriTable() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/durus-nedeni");
    console.log("loadDurusNedenleriTable data:", data);

    if (!Array.isArray(data) || data.length === 0) {
      fillTable("#durusNedeniTable tbody", [], [{}, {}]);
      return;
    }

    fillTable("#durusNedeniTable tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_dakika', format: v => Math.round(Number(v)).toLocaleString('tr-TR'), align: 'right' }
    ]);
  } catch (err) {
    console.error("Duruş nedenleri yüklenirken hata:", err);
    fillTable("#durusNedeniTable tbody", [], [{}, {}]);
  }
}

async function loadVardiyaUretim() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/vardiya-uretim");
    console.log("loadVardiyaUretim data:", data);
    fillTable("#vardiyaM2Table tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_m2', format: formatM2, align: 'right' }
    ]);
  } catch (err) {
    console.error("Vardiya üretim yüklenirken hata:", err);
    fillTable("#vardiyaM2Table tbody", [], [{}, {}]);
  }
}

async function loadTezgahDurusData() {
  const tableBody = document.querySelector('#tezgahDurusTable tbody');

  try {
    const response = await fetch("http://45.150.149.84:5000/api/records/analiz/tezgah-durus", {
      headers: { 'x-auth-pin': getAuthPin() }
    });

    if (!response.ok) throw new Error('Veri çekilemedi: ' + response.status);

    const data = await response.json();
    console.log("loadTezgahDurusData data:", data);

    if (!Array.isArray(data) || data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:12px; color:#888;">Veri bulunamadı.</td></tr>`;
      return;
    }

    const rows = data.map(item => `
      <tr>
        <td style="text-align:left; padding:8px; border-bottom:1px solid #444;">${item._id}</td>
        <td style="text-align:right; padding:8px; border-bottom:1px solid #444;">${Math.round(item.toplam_durus)}</td>
      </tr>
    `).join('');

    tableBody.innerHTML = rows;

  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:12px; color:#f00;">Veri yüklenirken hata oluştu.</td></tr>`;
    console.error("Tezgah bazlı duruş süresi yüklenirken hata:", error);
  }
}

async function loadTop3PersonelTable() {
  try {
    const data = await fetchData("http://45.150.149.84:5000/api/records/analiz/top3-personel");
    console.log("loadTop3PersonelTable data:", data);
    fillTable("#top3PersonelTable tbody", data, [
      { key: '_id', align: 'left' },
      { key: 'toplam_m2', format: formatM2, align: 'right' }
    ]);
  } catch (err) {
    console.error("Top 3 personel yüklenirken hata:", err);
    fillTable("#top3PersonelTable tbody", [], [{}, {}]);
  }
}

// OPK tabı için veri yükleme fonksiyonu (POST ile)
async function loadOPKData(operatorId = null, year = null, month = null) {
  const tbody = document.querySelector('#opkTable tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:12px; color:#888;">Yükleniyor...</td></tr>';

  try {
    const pin = getAuthPin();
    if (!pin) throw new Error('PIN bulunamadı.');

    // Backend endpoint POST /api/opk/calculate
    const response = await fetch("http://45.150.149.84:5000/api/opk/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-pin": pin,
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({ operatorId, year, month })
    });

    if (!response.ok) throw new Error(`Veri alınamadı (HTTP ${response.status})`);

    const data = await response.json();
    console.log("loadOPKData data:", data);

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:12px; color:#888;">Veri yok</td></tr>';
      return;
    }

    fillTable("#opkTable tbody", data, [
      { key: "operator", align: "left" },
      { key: "opkScore", format: v => v.toFixed(2), align: "right" },
      { key: "fireScore", format: v => (v * 100).toFixed(1) + "%", align: "right" },
      { key: "verimlilik", format: v => (v * 100).toFixed(1) + "%", align: "right" },
      { key: "durusSuresi", align: "right" },
      { key: "netSure", align: "right" }
    ]);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:12px; color:red;">Hata: ${err.message}</td></tr>`;
    console.error("OPK yüklenirken hata:", err);
  }
}

// Tab değiştiğinde OPK tabına geçilmişse veri yükle
document.getElementById('tab-opk-btn').addEventListener('click', () => {
  loadOPKData();
});

// ========== 6. Sayfa Yüklenince Çalışacak Ana Fonksiyon ==========

window.addEventListener("DOMContentLoaded", () => {
  const pin = getAuthPin();
  const role = getUserRole();

  if (!pin || !role) {
    alert("Lütfen giriş yapın.");
    window.location.href = "index.html";
    return;
  }

  if (role === "operator") {
    alert("Yönetim girebilir, veri sayfasına yönlendiriliyorsunuz.");
    window.location.href = "index.html";
    return;
  }

  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  function activateTab(tab) {
    tabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");

    const panelId = tab.getAttribute("aria-controls");
    panels.forEach(p => {
      if (p.id === panelId) {
        p.classList.add("active");
        p.removeAttribute("hidden");
      } else {
        p.classList.remove("active");
        p.setAttribute("hidden", true);
      }
    });
    tab.focus();
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", e => {
      const index = Array.from(tabs).indexOf(document.activeElement);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (index + 1) % tabs.length;
        activateTab(tabs[nextIndex]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (index - 1 + tabs.length) % tabs.length;
        activateTab(tabs[prevIndex]);
      }
    });
  });

  if (tabs.length > 0) activateTab(tabs[0]);

  // Veri yüklemeleri
  loadAnalytics();
  loadOperatorM2();
  loadTezgahAtki();
  loadTezgahUretim();
  loadPersonelUretim();
  loadDurusNedenleriTable();
  loadVardiyaUretim();
  loadTezgahDurusData();
  loadTop3PersonelTable();
});