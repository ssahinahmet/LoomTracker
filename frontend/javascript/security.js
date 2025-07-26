(function () {
  const timeoutMs = 60 * 5 * 1000; // 5 dakika
  const sessionMaxDuration = 1000 * 60 * 60 * 12; // 12 saat

  let timeout;

  function logoutAndRedirect(reason) {
    alert(reason || "5 dakika boyunca işlem yapılmadığı için çıkış yapıldı.");
    localStorage.clear();
    window.location.href = "login.html";
  }

  function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => logoutAndRedirect(), timeoutMs);
  }

  window.addEventListener("DOMContentLoaded", () => {
    const pin = localStorage.getItem("pin");
    const role = localStorage.getItem("role");
    const loginTime = localStorage.getItem("loginTime");

    if (!pin || !role || !loginTime) {
      logoutAndRedirect("Giriş bilgileri eksik. Lütfen tekrar giriş yapın.");
      return;
    }

    const now = Date.now();
    if (now - Number(loginTime) > sessionMaxDuration) {
      logoutAndRedirect("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
      return;
    }

    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
      window.addEventListener(evt, resetTimer);
    });

    resetTimer();
  });
})();

/**
 * CSS renk teması ve varsa sayfa içi dinamik select'leri ayarlayan fonksiyon.
 * Sayfanın yapısına göre select kutuları yoksa hata vermez.
 */
async function loadSiteSettings() {
  try {
    const res = await fetch("http://45.150.149.84:5000/api/site-settings");
    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
    const data = await res.json();

    // Tema renklerini uygula
    if (data.colors) {
      const root = document.documentElement;
      for (const [key, value] of Object.entries(data.colors)) {
        const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.style.setProperty(cssVarName, value);
      }
      console.log("Tema renkleri uygulandı.");
    }

    // Varsa tezgah select kutusunu doldur
    const tezgahSelect = document.getElementById("tezgah_no");
    if (tezgahSelect && data.tezgahSayisi) {
      tezgahSelect.innerHTML = '<option value="">Seçiniz</option>';
      for (let i = 1; i <= parseInt(data.tezgahSayisi); i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = i;
        tezgahSelect.appendChild(opt);
      }
    }

    // Varsa vardiya select kutusunu doldur
    const vardiyaSelect = document.getElementById("vardiya");
    if (vardiyaSelect && Array.isArray(data.vardiyalar)) {
      vardiyaSelect.innerHTML = '<option value="">Seçiniz</option>';
      data.vardiyalar.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        vardiyaSelect.appendChild(opt);
      });
    }

  } catch (err) {
    console.error("Site ayarları yüklenemedi:", err.message);
  }
}
