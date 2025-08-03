# 🏭 LoomTracker - Halı Üretim Takip Sistemi

**LoomTracker**, halı üretim süreçlerini dijital olarak takip eden kapsamlı bir sistemdir. Tezgâh verilerini toplar, kullanıcı rolleriyle erişim sağlar, verimlilik ve duruş analizleri sunar. Özelleştirilebilir ayarlarla üretim yönetimini kolaylaştırır, raporlar ve analizlerle performansı artırır.

## ✨ Özellikler

### 📊 Üretim Takibi
- **Gerçek Zamanlı Veri Girişi**: Atkı sayısı, devir, m² hesaplama
- **Duruş Süresi Analizi**: Otomatik hesaplama ve neden takibi
- **Fotoğraf Ekleme**: Üretim sürecine ait görsel belgeler
- **Not Sistemi**: Ek açıklamalar ve gözlemler

### 👥 Kullanıcı Yönetimi
- **3 Rol Sistemi**: Admin, Operatör, Makinist
- **PIN Tabanlı Giriş**: 8 karakter numerik güvenlik
- **Aktif/Pasif Kullanıcılar**: İşten çıkarma sistemi
- **Otomatik ID**: `pizza000001` formatında benzersiz kullanıcı ID'leri

### 📈 Analitik & Raporlama
- **Çok Katmanlı Analiz**: Günlük, haftalık, aylık bazda
- **Detaylı Metrikler**:
  - Tezgâh bazlı üretim performansı
  - Operatör bazlı verimlilik
  - Vardiya bazlı analizler
  - Duruş nedeni dağılımları
  - Top 3 performans sıralaması

### 📧 Otomatik Raporlama
- **Aylık Excel Raporları**: 5 sekmeli kapsamlı analiz
- **E-posta Gönderimi**: Her ayın 1'inde otomatik gönderim
- **HTML E-posta Şablonu**: Profesyonel görünüm
- **Dosya Eklentisi**: Excel raporu otomatik eklenir

### ⚙️ Özelleştirilebilir Ayarlar
- **Dinamik Tezgâh Yönetimi**: Sayı ve genişlik ayarları
- **Vardiya Tanımları**: Esnek çalışma saatleri
- **Tema Renkleri**: Özelleştirilebilir arayüz
- **Duruş Nedenleri**: Fabrika özelinde tanımlar

## 🛠 Teknoloji Stack

### Backend
- **Framework**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: PIN-based custom auth
- **File Upload**: Multer middleware
- **Email**: Nodemailer (SMTP)
- **Scheduling**: node-cron
- **Excel Generation**: ExcelJS
- **Environment**: dotenv

### Frontend *(Repository'de mevcut)*
- Modern JavaScript framework
- Responsive design
- Dark theme UI
- Interactive charts and graphs

## 📁 Proje Yapısı

```
backend/
├── config/
│   ├── db.js              # MongoDB bağlantı ayarları
│   └── mailer.js          # E-posta konfigürasyonu
├── controllers/
│   ├── authController.js  # Kimlik doğrulama işlemleri
│   ├── recordController.js # Üretim kayıt işlemleri
│   └── siteSettingsController.js # Site ayarları
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js               # Kullanıcı şeması
│   ├── Record.js             # Üretim kayıt şeması
│   └── siteSettings.js       # Site ayarları şeması
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── recordRoutes.js       # Üretim kayıt endpoints
│   ├── makinistRoutes.js     # Operatör yönetimi
│   └── siteSettingsRoutes.js # Ayarlar endpoints
├── services/
│   └── reportScheduler.js    # Otomatik rapor servisi
├── uploads/                  # Yüklenen dosyalar
├── app.js                    # Express app konfigürasyonu
└── server.js                 # Server başlatma
```

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14+)
- MongoDB
- SMTP e-posta hesabı


## 📊 API Endpoints

### Authentication
```
POST /api/auth/login          # Kullanıcı girişi
POST /api/auth/create         # Kullanıcı oluşturma (Admin)
GET  /api/auth/               # Kullanıcı listesi (Admin)
DELETE /api/auth/:userId      # Kullanıcı silme (Admin)
```

### Üretim Kayıtları
```
POST /api/records/            # Yeni üretim kaydı
GET  /api/records/summary     # Üretim özetleri
GET  /api/records/operator-summary # Operatör bazlı özet
```

### Analitik
```
GET /api/records/analiz/tezgah-uretim    # Tezgâh üretim analizi
GET /api/records/analiz/vardiya-uretim   # Vardiya analizi
GET /api/records/analiz/personel-uretim  # Personel performansı
GET /api/records/analiz/durus-nedeni     # Duruş analizi
GET /api/records/analiz/top3-personel    # En iyi 3 operatör
```

### Operatör Yönetimi
```
POST /api/operator            # Operatör ekleme
GET  /api/operators           # Operatör listesi
DELETE /api/operator/:id      # Operatör silme
PATCH /api/operator/deactivate/:pin # Operatör pasifleştirme
```

### Site Ayarları
```
GET  /api/site-settings/      # Ayarları getir
PUT  /api/site-settings/      # Ayarları güncelle
```

## 🔐 Güvenlik

### Authentication
- PIN tabanlı kimlik doğrulama sistemi
- 8 karakter numerik PIN formatı
- Middleware ile endpoint koruması
- Rol tabanlı erişim kontrolü

### Roller ve Yetkiler
- **Admin**: Tüm sisteme erişim, kullanıcı yönetimi
- **Operator**: Üretim kayıt girişi, analiz görüntüleme
- **Makinist**: Özel makinist işlemleri

## 📧 E-posta Sistemi

### Otomatik Raporlar
- Her ayın 1'inde sabah 09:00'da çalışır
- Önceki ayın tüm verilerini toplar
- 5 sekmeli Excel raporu oluşturur
- HTML formatında e-posta gönderir

### Rapor İçeriği
1. **Genel Özet**: Toplam üretim, ortalama verimlilik
2. **Tezgâh Bazlı Veriler**: Günlük ve aylık atkı sayısı
3. **Operatör Performansı**: Verimlilik puanları
4. **Vardiya Analizleri**: Üretim performansı
5. **Notlar ve Görseller**: Fotoğraflar ve açıklamalar

## 🎨 Tema Özelleştirme

Site ayarlarından aşağıdaki renkler özelleştirilebilir:
- Arka plan rengi
- Ana renk ve açık tonu
- Metin renkleri
- Input alanları
- Buton renkleri
- Gölge efektleri

## 📊 Metrik Hesaplamaları

### M² Hesaplama
```javascript
m² = (atkı / (atkı_sıklığı * 10)) * (tezgah_eni * 2)
```

### Duruş Süresi Hesaplama
```javascript
x = devir * 1680 * 0.8
y = atkı
denominator = (x / 3) / 480
duruş_süresi = (((x / 3) - y) / denominator)
```

## 🔧 Konfigürasyon

### Tezgâh Ayarları
```javascript
{
  no: 1,        // Tezgâh numarası
  eni: 4        // Tezgâh genişliği (metre)
}
```

### Vardiya Tanımları
```javascript
["07:00-15:00", "15:00-23:00", "23:00-07:00"]
```

## 📝 Kullanım

### Üretim Kaydı Girişi
1. PIN ile sisteme giriş yapın
2. Tezgâh numarası ve vardiya seçin
3. Operatör adı, devir, atkı değerlerini girin
4. İsteğe bağlı fotoğraf ve not ekleyin
5. Sistem otomatik olarak m² ve duruş süresini hesaplar

### Analiz Görüntüleme
1. Dashboard'a erişin
2. Farklı analiz türlerini seçin
3. Grafikler ve tablolar ile verileri inceleyin
4. Zaman aralığı filtrelemeleri yapın

## 🏢 Pizza Development

**Developer**: Ahmet Şahin  
**Email**: support@pizzadevelopment.net  
**Website**: https://pizzadevelopment.net  

**Gizlilik Politikası**: [Privacy Policy](https://pizzadevelopment.net/privacy-policy)  
**Kullanım Şartları**: [Terms of Service](https://pizzadevelopment.net/tos)

## 📄 Lisans

Bu proje özel yazılım olarak geliştirilmiştir. Tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

Proje geliştirme sürecine katkıda bulunmak için:
1. Issue açın
2. Feature request gönderin
3. Bug report edin
4. Pizza Development ile iletişime geçin

## 📞 Destek

Teknik destek ve sorularınız için:
- **E-posta**: support@pizzadevelopment.net
- **Website**: https://pizzadevelopment.net

---

**LoomTracker** - Halı üretiminde dijital dönüşümün öncüsü 🚀