const apiUrl = "http://45.150.149.84:5000/api/records";

const tabs = document.querySelectorAll('nav ul li');
const tabContents = document.querySelectorAll('.tabcontent');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');

    if (tab.dataset.tab === 'analytics') {
      loadAnalytics();
    }
  });
});

document.getElementById("recordForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());

  // Sayısal verileri parse et
  data.devir = Number(data.devir);
  data.atki = Number(data.atki);
  data.atki_sikligi = Number(data.atki_sikligi);

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (res.ok) {
      document.getElementById("formResult").textContent = "Kayıt başarıyla oluşturuldu ✅";
      document.getElementById("formResult").className = "result-message success";
      form.reset();
    } else {
      throw new Error(json.error || "Bilinmeyen hata");
    }
  } catch (err) {
    document.getElementById("formResult").textContent = "Hata: " + err.message;
    document.getElementById("formResult").className = "result-message error";
  }
});

function formatM2(val) {
  const num = parseFloat(val);
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M m²";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K m²";
  return num.toFixed(1) + " m²";
}

let dailyChart, weeklyChart, monthlyChart;

async function loadAnalytics() {
  try {
    const res = await fetch(apiUrl + "/summary");
    const data = await res.json();

    // Gelen verileri işlemeye hazırla
    const dailyLabels = data.daily.map(d => d._id);
    const dailyData = data.daily.map(d => d.totalM2);
    const weeklyLabels = data.weekly.map(d => `Y${d._id.year}W${d._id.week}`);
    const weeklyData = data.weekly.map(d => d.totalM2);
    const monthlyLabels = data.monthly.map(d => d._id);
    const monthlyData = data.monthly.map(d => d.totalM2);

    document.getElementById("dailyValue").textContent = formatM2(dailyData.reduce((a,b) => a+b, 0));
    document.getElementById("weeklyValue").textContent = formatM2(weeklyData.reduce((a,b) => a+b, 0));
    document.getElementById("monthlyValue").textContent = formatM2(monthlyData.reduce((a,b) => a+b, 0));

    if (dailyChart) dailyChart.destroy();
    if (weeklyChart) weeklyChart.destroy();
    if (monthlyChart) monthlyChart.destroy();

    dailyChart = createChart("dailyChart", dailyLabels, dailyData, '#ff7f50');
    weeklyChart = createChart("weeklyChart", weeklyLabels, weeklyData, '#ff9966');
    monthlyChart = createChart("monthlyChart", monthlyLabels, monthlyData, '#ffb380');

  } catch (err) {
    console.error("Analiz yüklenirken hata:", err);
  }
}

function createChart(id, labels, data, color) {
  const ctx = document.getElementById(id).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'm²',
        data,
        backgroundColor: color,
        borderRadius: 6,
        barPercentage: 0.6,
        maxBarThickness: 40
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#ff7f50', font: { weight: '600' } },
          grid: { color: 'rgba(255, 127, 80, 0.15)' }
        },
        x: {
          ticks: { color: '#ff7f50', font: { weight: '600' } },
          grid: { color: 'transparent' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatM2(ctx.raw)
          }
        }
      }
    }
  });
}


const devirInput = document.getElementById('devir');
const atkiInput = document.getElementById('atki');
const durusSureDisplay = document.getElementById('durus_suresi_display');

function hesaplaDurusSuresi() {
  const devir = parseFloat(devirInput.value);
  const y = parseFloat(atkiInput.value);

  if (isNaN(devir) || isNaN(y) || devir <= 0) {
    durusSureDisplay.textContent = "0 dk";
    return;
  }

  const x = devir * 1680 * 0.8;
  const numerator = (x / 3) - y;
  const denominator = (x / 3) / 480;

  const durusSure = numerator / denominator;

  if (durusSure < 0) {
    durusSureDisplay.textContent = "0 dk";
  } else {
    durusSureDisplay.textContent = Math.round(durusSure) + " dk";
  }
}

devirInput.addEventListener('input', hesaplaDurusSuresi);
atkiInput.addEventListener('input', hesaplaDurusSuresi);
