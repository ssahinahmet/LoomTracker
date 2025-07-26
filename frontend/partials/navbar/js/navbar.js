const hamburger = document.querySelector('.hamburger');
const menu = document.querySelector('.menu');

function setHamburgerIcon(open) {
  if (open) {
    hamburger.innerHTML = `
      <span style="transform: rotate(45deg) translate(5px, 5px);"></span>
      <span style="opacity: 0;"></span>
      <span style="transform: rotate(-45deg) translate(5px, -5px);"></span>
    `;
  } else {
    hamburger.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
  }
}

// Başlangıçta ikon üç çizgili
setHamburgerIcon(false);

hamburger.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
  setHamburgerIcon(isOpen);
});

// Klavye ile erişim için Enter ve Space
hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    hamburger.click();
  }
});

// Menü dışına tıklayınca kapat
document.addEventListener('click', e => {
  if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
    menu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    setHamburgerIcon(false);
  }
});

function loadNavbarAndFooter() {
  fetch('partials/navbar/navbar.html')
    .then(r => r.text())
    .then(html => {
      document.querySelector('nav').innerHTML = html;
    })
    .catch(err => console.error('Navbar yüklenirken hata:', err));

  fetch('partials/footer/footer.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('footer-placeholder').innerHTML = html;
    })
    .catch(err => console.error('Footer yüklenirken hata:', err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadNavbarAndFooter();
});




async function loadSiteSettings() {
  try {
    const res = await fetch("http://45.150.149.84:5000/api/site-settings");
    if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
    const data = await res.json();

    if (data.colors) {
      const root = document.documentElement.style;
      for (const [key, value] of Object.entries(data.colors)) {
        const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
        root.setProperty(cssVarName, value);
      }
      console.log("Renkler backend'den başarıyla yüklendi ve uygulandı.");
    }
  } catch (err) {
    console.error("Site ayarları yüklenemedi:", err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSiteSettings();
});
