# 🏭 LoomTracker Sistemi - Müşteri Sunum Dokümanı

## 🎯 Problem ve Çözüm

**Mevcut Durum:** Fabrikadaki halı üretimi kağıt-kalem ile takip ediliyor. Bu da hata yapmaya açık, analiz yapmayı imkansız hale getiriyor.

**Çözümümüz:** Fabrikandaki halı üretimini tamamen dijitalleştiren, gerçek zamanlı takip eden ve aylık raporları otomatik üreten sistem.

## 💰 İş Değeri ve ROI

### **Maliyetten Tasarruf:**
- Manuel veri toplama için harcanan 2-3 saatlik günlük işgücünü tamamen ortadan kaldırır
- Kağıt-dosya sistemindeki kayıp verileri %95 azaltır  
- Rapor hazırlama süresini 8 saatten 0 saate düşürür
- 6 ay içinde sistemin kendini amorti etmesi garantili

### **Verimlilik Artışı:**
- Hangi tezgahın daha verimli olduğunu anlık görebilme
- Hangi operatörün performansı düşük, ona eğitim verebilme
- Duruş nedenlerini analiz edip önlem alabilme
- Günlük üretim hedeflerini takip edebilme

## 🔧 Sistem Özellikleri

### **Kullanıcı Arayüzü:**
- Tablet/PC'den kolay veri girişi
- Karanlık tema (fabrika ortamında göz yormaz)
- Türkçe arayüz
- Fotoğraf yükleme özelliği
- Dokunmatik ekran uyumlu büyük butonlar

### **Veri Girişi:**
- Tezgah numarası seçimi
- Vardiya bilgisi (07:00-15:00, 15:00-23:00, 23:00-07:00)
- Operatör PIN'i ile giriş (8 haneli güvenlik)
- Devir sayısı, atkı sayısı, atkı sıklığı
- Duruş nedeni (dropdown'dan seçim)
- İsteğe bağlı not ve fotoğraf

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


## 👥 Kullanıcı Rolleri

### **👨‍💼 ADMIN:**
- Tüm sistemi yönetir
- Kullanıcı ekler/çıkarır
- Ayarları değiştirir
- Tüm raporları görür

### **👷‍♂️ OPERATÖR:**
- Sadece üretim verisi girer
- 8 haneli PIN ile giriş
- Günlük işini kaydeder
- Günlük işini görüntüler

### **🔧 MAKİNİST:**
- Tezgah bakım kayıtları
- Teknik notlar
- Duruş nedenlerini detaylandırır

## 📊 Analitik ve Raporlama

### **Gerçek Zamanlı Analizler:**
- Tezgah bazlı performans
- Operatör bazlı verimlilik
- Vardiya karşılaştırmaları
- Duruş nedeni dağılımları
- Günlük/haftalık/aylık trendler
- Top 3 performans sıralaması

### **📧 Otomatik Aylık Raporlar:**
**Her ayın 1'inde sabah 09:00'da otomatik olarak:**

**5 Sekmeli Excel Raporu:**
1. **Genel Özet** - Toplam üretim, ortalama verimlilik
2. **Tezgah Analizi** - Her tezgahın performansı
3. **Operatör Performansı** - Kişisel verimlilik puanları
4. **Vardiya Analizi** - En verimli vardiya
5. **Duruş Analizi** - En çok duruş nedenleri

**E-posta İçeriği:**
- HTML formatında özet bilgiler
- Excel dosyası otomatik ek
- Görsel grafikler ve tablolar
- Önceki ay ile karşılaştırma

## 🎨 Özelleştirme Seçenekleri

### **Fabrika Özelinde Ayarlar:**
- Tezgah sayısı değiştirilebilir (varsayılan: 3 adet)
- Tezgah genişlikleri özelleştirilebilir
- Vardiya saatleri ayarlanabilir
- Duruş nedenleri fabrikaya özel tanımlanabilir
- Tema renkleri firma kimliğine uygun ayarlanabilir
- m² hesaplama formülü değiştirilebilir

### **Entegrasyon:**
- Mevcut ERP sistemlerine API ile bağlanabilir
- Excel export/import özellikleri
- Harici raporlama araçlarına veri aktarımı

## 💻 Teknik Özellikler

### **Sistem Gereksinimleri:**
```
Backend: Node.js + MongoDB
Frontend: Modern web teknolojileri  
Güvenlik: PIN tabanlı kullanıcı sistemi
Raporlama: Otomatik Excel oluşturma
E-posta: SMTP ile otomatik gönderim
Hosting: Cloud server (7/24 erişim)
Backup: Günlük otomatik yedekleme
```

### **Güvenlik Özellikleri:**
- PIN tabanlı giriş (8 haneli numerik)
- Rol bazlı yetkilendirme
- Dosya upload güvenliği
- SQL injection koruması
- XSS koruması
- Günlük otomatik MongoDB backup
- 30 günlük veri saklama

### **Mobil Uyumluluk:**
- Tablet'ten rahat kullanım
- Telefon'dan acil erişim


## 📅 Proje Süreci

### **Geliştirme Aşamaları (10-18 hafta):**
- **Hafta 1-3:** Backend API geliştirme
- **Hafta 3-5:** Frontend arayüz
- **Hafta 5-8:** Raporlama sistemi
- **Hafta 8-15:** Test ve debugging
- **Hafta 15-18:** Deployment ve eğitim

### **Günlük İş Akışı:**
1. Operatör vardiya başında PIN'i ile giriş yapar
2. Tezgah numarasını seçer
3. Günlük üretim verilerini girer
4. Varsa duruş nedenini belirtir
5. İsteğe bağlı fotoğraf ekler
6. Sistem otomatik hesaplamalar yapar
7. Veri anında kaydedilir ve raporlara yansır

## 💰 Maliyet Yapısı

### **Hosting Maliyeti:**
- Cloud server: $50-80/ay
- Domain: $30/yıl
- SSL sertifikası: $0 (Let's Encrypt)
- Email SMTP: $10-20/ay

### **Toplam Aylık Maliyet: ~62.5 $ - 102.5 $ arası**

## 🎓 Eğitim ve Destek

### **Eğitim Paketi:**
- Admin için 2 saatlik sistem yönetimi eğitimi
- Operatörler için 30 dakikalık kullanım eğitimi
- Video tutorial'lar
- Türkçe kullanım kılavuzu

### **Destek:**
- İlk 3 ay ücretsiz destek
- WhatsApp/telefon hattı
- Uzaktan erişim ile problem çözme
- Sistem güncellemeleri

## 📋 Veri Yapısı Örnekleri

### **Kullanıcı Kayıtları:**
```
userId: pizza000001 (otomatik)
pin: 12345678 (8 haneli numerik)
isim: Ahmet Şahin
rol: operator/admin/makinist
aktif: true/false
```

### **Üretim Kayıtları:**
```
tarih: 2024-12-25
tezgah_no: 1
vardiya: 07:00-15:00
operatör: Ahmet şahin
devir: 15000
atkı: 12000
atkı_sıklığı: 8.5
hesaplanan_m²: 56.47
duruş_süresi: 45 dakika
duruş_nedeni: Malzeme Sorunu
fotoğraf: production_001.jpg
notlar: Kalite kontrol yapıldı
```

### **Site Ayarları:**
```
firma_adı: Mina Carpet
tezgah_sayısı: 3
tezgahlar: [
  {no: 1, eni: 4},
  {no: 2, eni: 4},
  {no: 3, eni: 6}
]
vardiyalar: ["07:00-15:00", "15:00-23:00", "23:00-07:00"]
duruş_nedenleri: ["Malzeme Sorunu", "Makine Arızası", "Personel Eksikliği"]
```

## 🚀 Neden LoomTracker?

### **Immediate Benefits:**
- ✅ Manuel kayıt defterleri tarihe karışır
- ✅ Veri kaybı riski %95 azalır
- ✅ Aylık rapor hazırlama işi tamamen otomatik
- ✅ Gerçek zamanlı üretim takibi
- ✅ Operatör performans değerlendirmesi

### **Long-term Benefits:**
- 📈 Üretim verimliliğinde %15-25 artış
- 📊 Data-driven karar verme
- 🎯 Hedef belirleme ve takibi
- 📋 ISO kalite standartlarına uyum
- 💡 Sürekli iyileştirme kültürü

---

## 💬 Sonuç

**"Bu sistem sayesinde fabrikandaki üretim verilerini tamamen kontrol altına alacaksın. Her ay düzenli raporlarla hangi alanların geliştirilmesi gerektiğini göreceksin. Manuel veri toplama işi bitecek, operatörler sadece üretime odaklanacak. 6 ay içinde sistemin kendini amorti etmesini garantiliyorum."**

**Hazır mısın dijital dönüşüme başlamaya? 🚀**

---

*Developer: Ahmet Şahin | Pizza Development*  
*Email: support@pizzadevelopment.net | Web: pizzadevelopment.net*