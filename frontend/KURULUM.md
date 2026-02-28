# GreenCampus Frontend — Kurulum Rehberi

## Önkoşullar

| Program | Versiyon | İndirme |
|---------|----------|---------|
| Node.js | 18+ | https://nodejs.org |
| Expo Go (telefon) | Son sürüm | App Store / Google Play |

> Expo Go uygulamasını telefonuna kur — uygulamayı doğrudan kendi telefonunda test edeceksin.

---

## 1. Klasöre Gir

```bash
cd green-campus/frontend
```

---

## 2. .env Dosyası Oluştur

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

Eğer `.env.example` yoksa, `frontend/` klasöründe `.env` adında bir dosya oluştur ve şunu yaz:

```
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:8000/api/v1
```

> **ÖNEMLİ:** `192.168.1.XXX` yerine kendi bilgisayarının yerel IP adresini yaz.
> Telefonun ve bilgisayarın **aynı Wi-Fi'ye** bağlı olması gerekiyor.

### Bilgisayarının IP adresini öğrenmek için:

```bash
# Windows
ipconfig
# "Kablosuz LAN bağdaştırıcısı" → "IPv4 Adresi" satırını gör

# Mac
ifconfig | grep "inet 192"

# Linux
hostname -I
```

---

## 3. Paketleri Yükle

```bash
npm install
```

> Bu işlem 3-5 dakika sürebilir.

---

## 4. Uygulamayı Başlat

```bash
npx expo start
```

Terminalde bir QR kod görünecek:

```
› Metro waiting on exp://192.168.1.XX:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## 5. Telefonunda Aç

**Android:**
- Expo Go uygulamasını aç
- "Scan QR Code" butonuna bas
- Terminaldeki QR kodu tara

**iPhone:**
- Telefonun kamera uygulamasını aç
- QR kodu tara
- Çıkan bildirimi tıkla ("Expo Go'da Aç")

---

## Bilgisayarda Test Etmek İstersen (Emülatör)

### Android Emülatör
Android Studio'yu kur: https://developer.android.com/studio  
Bir sanal cihaz oluştur, ardından:
```bash
npx expo start --android
```

### iOS Simülatör (Sadece Mac)
Xcode'u kur (App Store'dan ücretsiz), ardından:
```bash
npx expo start --ios
```

---

## Backend Bağlantısını Test Et

Uygulama açıldığında giriş ekranı geliyorsa ve şu hatayı **görmüyorsan** bağlantı çalışıyor demektir:

```
Network Error / Could not connect
```

Hata görürsen:
1. Backend çalışıyor mu? → `http://localhost:8000/health/` tarayıcıda açılıyor mu?
2. `.env` dosyasındaki IP doğru mu?
3. Telefon ve bilgisayar aynı Wi-Fi'de mi?

---

## Test Kullanıcısı Oluştur

Backend çalışırken tarayıcıda Swagger'ı aç:
```
http://localhost:8000/api/docs/
```

`POST /api/v1/auth/register/` endpoint'ine tıkla → "Try it out" → şu bilgileri gir:

```json
{
  "email": "test@ahievran.edu.tr",
  "first_name": "Test",
  "last_name": "Kullanıcı",
  "password": "testpass123",
  "password_confirm": "testpass123",
  "role": "student"
}
```

Execute'e bas. Sonra bu bilgilerle uygulamaya giriş yapabilirsin.

---

## Sık Karşılaşılan Hatalar

### "Unable to find expo in this project"
```bash
npm install
```

### "Network request failed"
Backend çalışmıyor veya `.env`'deki IP yanlış.
Bilgisayarın IP'sini kontrol et, `.env`'i güncelle, `npx expo start` tekrar başlat.

### Beyaz ekran / uygulama açılmıyor
```bash
# Önbelleği temizle
npx expo start --clear
```

### "Something went wrong" / kırmızı hata ekranı
Terminale bak, hata mesajını oku. Genellikle eksik `.env` veya yanlış IP.

---

## Günlük Kullanım

```bash
cd green-campus/frontend
npx expo start
```

Telefonunda Expo Go açık olduğu sürece otomatik yenilenir — kod değiştirince kaydet, telefona anında yansır.
