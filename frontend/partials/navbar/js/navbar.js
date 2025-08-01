
// JavaScript - navbar.js - Çakışmasız namespace
(function() {
    'use strict';
    
    // Namespace oluştur
    window.MinahaliNavbar = window.MinahaliNavbar || {};
    
    function initMinahaliNavbar() {
        console.log('🚀 Minahali Navbar başlatılıyor...');
        
        const navbarToggle = document.getElementById('minahali-navbar-toggle');
        const navbarMenu = document.getElementById('minahali-navbar-menu');
        
        // Elementleri kontrol et
        if (!navbarToggle || !navbarMenu) {
            console.log('⏳ Navbar elementleri henüz hazır değil, tekrar denenecek...');
            setTimeout(initMinahaliNavbar, 100);
            return;
        }
        
        console.log('✅ Navbar elementleri bulundu:', {
            toggle: navbarToggle,
            menu: navbarMenu
        });

        // Başlangıç durumu
        navbarMenu.classList.remove('minahali-active');
        navbarToggle.classList.remove('minahali-active');
        navbarToggle.setAttribute('aria-expanded', 'false');

        // Hamburger menü toggle - Event delegation kullan
        navbarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🍔 Hamburger tıklandı');
            
            const isActive = navbarMenu.classList.toggle('minahali-active');
            navbarToggle.classList.toggle('minahali-active', isActive);
            navbarToggle.setAttribute('aria-expanded', isActive);
            
            console.log('📱 Menü durumu:', isActive ? 'Açık' : 'Kapalı');
        });

        // Klavye erişimi
        navbarToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                navbarToggle.click();
            }
        });

        // Menü dışına tıklayınca kapat
        document.addEventListener('click', function(e) {
            if (!navbarMenu.contains(e.target) && !navbarToggle.contains(e.target)) {
                navbarMenu.classList.remove('minahali-active');
                navbarToggle.classList.remove('minahali-active');
                navbarToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Menü linklerine tıklayınca mobilde menüyü kapat
        const menuLinks = navbarMenu.querySelectorAll('.minahali-navbar-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navbarMenu.classList.remove('minahali-active');
                    navbarToggle.classList.remove('minahali-active');
                    navbarToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Ekran boyutu değiştiğinde menüyü kapat
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navbarMenu.classList.remove('minahali-active');
                navbarToggle.classList.remove('minahali-active');
                navbarToggle.setAttribute('aria-expanded', 'false');
            }
        });

        console.log('✅ Minahali Navbar başarıyla başlatıldı!');
        
        // Global namespace'e kaydet
        window.MinahaliNavbar.initialized = true;
    }

    // Ana fonksiyon - loadNavbarAndFooter'dan sonra çağır
    function loadNavbarAndFooter() {
        fetch('partials/navbar/navbar.html')
            .then(r => r.text())
            .then(html => {
                const navContainer = document.querySelector('nav') || document.createElement('nav');
                navContainer.innerHTML = html;
                if (!document.contains(navContainer)) {
                    document.body.insertBefore(navContainer, document.body.firstChild);
                }
                
                // Navbar yüklendikten sonra başlat
                setTimeout(initMinahaliNavbar, 50);
            })
            .catch(err => console.error('Navbar yüklenirken hata:', err));

        fetch('partials/footer/footer.html')
            .then(r => r.text())
            .then(html => {
                const footerContainer = document.getElementById('footer-placeholder');
                if (footerContainer) {
                    footerContainer.innerHTML = html;
                }
            })
            .catch(err => console.error('Footer yüklenirken hata:', err));
    }

    // Site ayarları
    async function loadSiteSettings() {
        try {
            const res = await fetch("http://45.150.149.84:5000/api/site-settings");
            if (!res.ok) throw new Error(`Sunucu hatası: ${res.status}`);
            const data = await res.json();

            if (data.colors) {
                const root = document.documentElement.style;
                for (const [key, value] of Object.entries(data.colors)) {
                    const cssVarName = `--minahali-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
                    root.setProperty(cssVarName, value);
                }
                console.log("Renkler backend'den başarıyla yüklendi ve uygulandı.");
            }
        } catch (err) {
            console.error("Site ayarları yüklenemedi:", err.message);
        }
    }

    // DOM hazır olduğunda başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadNavbarAndFooter();
            loadSiteSettings();
        });
    } else {
        loadNavbarAndFooter();
        loadSiteSettings();
    }

    // Global erişim için
    window.MinahaliNavbar.init = initMinahaliNavbar;
    window.MinahaliNavbar.loadNavbarAndFooter = loadNavbarAndFooter;
    
})();