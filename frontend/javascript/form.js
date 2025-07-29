// Input alanları ve API URL'si
const devirInput = document.getElementById('devir');
const atkiInput = document.getElementById('atki');
const durusSureDisplay = document.getElementById('durus_suresi_display');
const durusSelect = document.getElementById('durus_nedeni');
const durusYeniInput = document.getElementById('durus_nedeni_yeni');
const operatorInput = document.getElementById('operator');
const photoInput = document.getElementById('photo');
const tarihInput = document.getElementById('tarih'); // Tarih inputu referansı
const apiUrl = "http://45.150.149.84:5000/api/records";

// Giriş yapılmış mı kontrol et
(function () {
  const pin = localStorage.getItem("pin");
  const role = localStorage.getItem("role");
  const loginTime = localStorage.getItem("loginTime");

  if (!pin || !role || !loginTime) {
    alert("Öncelikle giriş yapmalısınız.");
    window.location.href = "login.html";
  }
})();

// Operatör inputunu set et
function setOperatorInput() {
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');

  if (!operatorInput) return;

  if (name && name.trim() !== "") {
    operatorInput.value = name;
  } else if (role === 'operator') {
    operatorInput.value = "Operatör";
  }

  if (role === 'operator') {
    operatorInput.setAttribute('readonly', 'true');
    operatorInput.style.backgroundColor = '#555';
    operatorInput.style.color = '#ccc';
    operatorInput.style.cursor = 'not-allowed';
    operatorInput.style.pointerEvents = 'none';
    operatorInput.title = "Operatör rolü nedeniyle değiştirilemez ve tıklanamaz";
  } else {
    operatorInput.removeAttribute('readonly');
    operatorInput.style.backgroundColor = '';
    operatorInput.style.color = '';
    operatorInput.style.cursor = '';
    operatorInput.style.pointerEvents = '';
    operatorInput.title = '';
  }
}

// Duruş süresini hesapla
function hesaplaDurusSuresi() {
  const devir = parseFloat(devirInput.value);
  const atki = parseFloat(atkiInput.value);

  if (isNaN(devir) || isNaN(atki) || devir <= 0) {
    durusSureDisplay.textContent = "0 dk";
    return;
  }

  const x = devir * 1680 * 0.8;
  const numerator = (x / 3) - atki;
  const denominator = (x / 3) / 480;

  const durusSure = numerator / denominator;

  durusSureDisplay.textContent = durusSure < 0 ? "0 dk" : Math.round(durusSure) + " dk";
}

// localStorage'tan operatorId al
function getOperatorId() {
  const opId = localStorage.getItem('operator_id');
  const userId = localStorage.getItem('userId');
  if (opId && opId.trim() !== '') return opId;
  if (userId && userId.trim() !== '') return userId;
  return null;
}

// localStorage'tan PIN al
function getAuthPin() {
  return localStorage.getItem("pin") || null;
}

// Duruş nedeni "diğer" ise input göster
durusSelect.addEventListener('change', () => {
  const val = durusSelect.value.toLowerCase();
  if (val === "diğer" || val === "diger") {
    durusYeniInput.style.display = "block";
    durusYeniInput.required = true;
  } else {
    durusYeniInput.style.display = "none";
    durusYeniInput.required = false;
    durusYeniInput.value = "";
  }
});

// Değişimlerde duruş süresi hesapla
devirInput.addEventListener('input', hesaplaDurusSuresi);
atkiInput.addEventListener('input', hesaplaDurusSuresi);

// Sayfa yüklendiğinde operatör adını set et
setOperatorInput();

// Tarih inputunun min değerini bugüne ayarla
if (tarihInput) {
  const today = new Date().toISOString().split('T')[0];
  tarihInput.setAttribute('min', today);
}

// Form gönderimi
document.getElementById("recordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Tarih geçmiş mi kontrol et
  const tarihValue = tarihInput.value;
  const today = new Date().toISOString().split('T')[0];
  if (!tarihValue || tarihValue < today) {
    showFormResult("Geçmiş tarihe izin verilmiyor.", false);
    return;
  }

  if (!photoInput.files || photoInput.files.length === 0) {
    showFormResult("Üretim fotoğrafı zorunludur.", false);
    return;
  }

  const form = e.target;
  const formData = new FormData(form);

  // Duruş süresi
  const sureText = durusSureDisplay.textContent;
  let sureValue = 0;
  if (sureText && sureText !== "0 dk") {
    sureValue = parseInt(sureText.replace(" dk", ""));
  }
  formData.set('sure', sureValue);

  // Duruş nedeni "diğer" ise değeri değiştir
  const durusNedeni = formData.get('durus_nedeni');
  if (durusNedeni && (durusNedeni.toLowerCase() === "diğer" || durusNedeni.toLowerCase() === "diger")) {
    const yeniNeden = formData.get('durus_nedeni_yeni')?.trim();
    if (yeniNeden) {
      formData.set('durus_nedeni', yeniNeden);
    }
  }
  formData.delete('durus_nedeni_yeni');

  // Zorunlu alan kontrolü
  const zorunluAlanlar = ['tarih', 'tezgah_no', 'vardiya', 'devir', 'atki', 'atki_sikligi'];
  for (const alan of zorunluAlanlar) {
    const val = formData.get(alan);
    if (!val || val.toString().trim() === "") {
      showFormResult("Lütfen zorunlu tüm alanları doldurun.", false);
      return;
    }
  }

  // Giriş doğrulama
  const operatorId = getOperatorId();
  const pin = getAuthPin();

  if (!pin) {
    alert("Giriş doğrulaması yapılamadı (PIN eksik).");
    window.location.href = "login.html";
    return;
  }

  if (operatorId) {
    formData.set('operator_id', operatorId);

    // userId opsiyonel, varsa ekle
    const userId = localStorage.getItem('userId');
    if (userId && userId.trim() !== '') {
      formData.set('userId', userId);
    }
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-auth-pin": pin
      },
      body: formData
    });

    const json = await res.json();

    if (res.ok) {
      showFormResult("Kayıt başarıyla oluşturuldu ✅", true);
      form.reset();
      durusYeniInput.style.display = "none";
      durusSureDisplay.textContent = "0 dk";
      setOperatorInput();
    } else {
      showFormResult("Hata: " + (json.error || "Bilinmeyen hata"), false);
    }
  } catch (err) {
    showFormResult("Sunucu hatası: " + err.message, false);
  }
});

// Form sonucu gösterme
function showFormResult(msg, success) {
  const el = document.getElementById("formResult");
  el.textContent = msg;
  el.className = "result-message " + (success ? "success" : "error");
}
