# 📱 Merkür Referans - Mobil Uygulama (React Native & Expo)

Bu klasör, `https://merkurreferans.com.tr` platformu için geliştirilmiş **WebView tabanlı Android & iOS mobil uygulamasıdır**.

---

## 🚀 Hızlı Başlangıç (Geliştirme & Canlı Test)

### 1. Bağımlılıkları Yükleyin:
```bash
cd mobile
npm install
```

### 2. Uygulamayı Başlatın:
```bash
npx expo start
```
- Telefonunuza Google Play veya App Store'dan **Expo Go** uygulamasını indirin.
- Terminalde beliren QR kodu telefonunuzun kamerası (veya Expo Go) ile okutarak uygulamayı **anında cihazınızda test edin**.

---

## 📦 APK (Android Yükleme Dosyası) Oluşturma

Tek komutla Google Play hesabı olmadan doğrudan telefona yüklenebilir `.apk` dosyası üretmek için:

```bash
# EAS CLI yükleyin (yoksa)
npm install -g eas-cli

# Expo hesabınızla giriş yapın (ücretsiz)
npx eas login

# APK dosyasını derleyin
npx eas build -p android --profile preview
```
> Bu komut bulutta otomatik olarak APK dosyanızı derler ve indirme bağlantısını verir!

---

## ✨ İçerdiği Özellikler

- 📱 **Android Geri Tuşu Desteği:** Kullanıcı telefonun fiziksel geri tuşuna bastığında uygulamadan çıkmaz, site geçmişinde geri gider.
- 🔄 **Pull to Refresh:** Aşağı kaydırarak sayfayı yenileme desteği.
- ⏳ **Yükleniyor İndikatörü:** Sayfa açılırken şık karanlık tema yüklenme ekranı.
- 📡 **Çevrimdışı Hata Yönetimi:** İnternet koptuğunda şık hata ekranı ve "Tekrar Dene" butonu.
- 🔗 **Harici Link Yönetimi:** Telefon araması (`tel:`), WhatsApp (`whatsapp:`), Zoom (`zoommtg:`) linklerini doğrudan telefonun yerel uygulamalarında açma.
- 🎨 **Özel Marka İkon & Açılış Ekranı (Splash):** Merkür temalı parlak neon logo ve koyu tema.
