# 🌱 GreenCampus

**Karbon Ayak İzi Takip & Gamification Platformu**

> React Native + Django REST API + PostgreSQL + Redis

---

## 🏗️ Proje Yapısı

```
green-campus/
├── docker-compose.yml       # Tüm servisler
├── backend/                 # Django API
│   ├── config/              # Settings, URLs, Celery, ASGI
│   ├── apps/
│   │   ├── users/           # Kullanıcı & profil (JWT auth)
│   │   ├── emissions/       # 6 kategori, faktörler, girişler
│   │   ├── analytics/       # Günlük/haftalık özetler, bütçe
│   │   ├── gamification/    # XP, seviye, rozet, seri, liderboard
│   │   ├── ai_features/     # DNA, İkiz, Zaman makinesi, Hafıza
│   │   └── market/          # GCC kredisi, akıllı sözleşmeler
│   ├── requirements.txt
│   └── .env.example
└── frontend/                # React Native (Expo)
    └── src/
        ├── theme/           # Renkler, tipografi, spacing
        ├── store/           # Redux Toolkit slices
        ├── services/        # Axios + JWT interceptor
        └── screens/         # Ekranlar
```

---

## 🚀 Kurulum

### Backend

```bash
cd backend

# 1. .env dosyası oluştur
cp .env.example .env
# SECRET_KEY ve DATABASE_URL düzenle

# 2. Docker ile başlat (PostgreSQL + Redis)
docker-compose up -d db redis

# 3. Sanal ortam
python -m venv venv && source venv/bin/activate

# 4. Paketleri yükle
pip install -r requirements.txt

# 5. Migrasyonları çalıştır
python manage.py migrate

# 6. Süper kullanıcı oluştur
python manage.py createsuperuser

# 7. Emisyon faktörlerini seed et (önemli!)
python manage.py seed_emission_factors

# 8. Çalıştır
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npx expo start
```

---

## 📡 API Endpoints

| Metod | Endpoint | Açıklama |
|-------|----------|----------|
| POST  | `/api/v1/auth/register/` | Kullanıcı kaydı |
| POST  | `/api/v1/auth/login/` | Giriş (JWT) |
| POST  | `/api/v1/auth/token/refresh/` | Token yenileme |
| POST  | `/api/v1/auth/logout/` | Çıkış (blacklist) |
| GET   | `/api/v1/auth/me/` | Profil görüntüle |
| PATCH | `/api/v1/auth/me/` | Profil güncelle |
| GET   | `/api/v1/emissions/categories/` | Kategoriler |
| GET   | `/api/v1/emissions/factors/` | Emisyon faktörleri |
| GET/POST | `/api/v1/emissions/entries/` | Giriş listele/ekle |
| GET   | `/api/v1/emissions/today/` | Bugünkü özet |
| GET   | `/api/v1/analytics/chart/weekly/` | Haftalık grafik |
| GET   | `/api/v1/analytics/trend/` | Trend analizi |
| GET/PUT | `/api/v1/analytics/budget/` | Karbon bütçesi |
| GET   | `/api/v1/gamification/status/` | XP & Streak |
| GET   | `/api/v1/gamification/badges/` | Rozetler |
| GET   | `/api/v1/gamification/leaderboard/` | Haftalık liderboard |

### 📖 Swagger UI

```
http://localhost:8000/api/docs/
```

---

## ⚙️ Celery Periyodik Görevler

| Görev | Zamanlama | Açıklama |
|-------|-----------|----------|
| `create_daily_summaries` | Her gece 23:59 | Günlük emisyon özetleri |
| `create_weekly_summaries` | Her Pazartesi 00:00 | Haftalık özetler |
| `check_and_reset_streaks` | Her sabah 08:00 | Kırılan serileri sıfırla |
| `send_daily_reminders` | Her sabah 09:00 | Push bildirim |
| `update_weekly_leaderboard` | Her Pazar 20:00 | Liderboard güncelle |

---

## 🎮 Gamification Sistemi

### XP Kazanma Kuralları
- Emisyon girişi: **+10 XP**
- Günlük hedef tutturma: **+50 XP**
- Rozet kazanma: **+50–200 XP** (tier'a göre)
- Haftalık liderboard 1.: **+200 XP**, 2.: **+150 XP**, 3.: **+100 XP**

### Seviye Eşikleri
1→100, 2→250, 3→500, 4→1000, 5→2000, 6→4000 XP...

---

## 🌿 Emisyon Kategorileri

| Kategori | Faktör Sayısı | Örnek |
|----------|--------------|-------|
| 🚗 Ulaşım | 12 | Otomobil: 0.171 kg CO₂/km |
| ⚡ Enerji | 5 | Elektrik (TR): 0.420 kg CO₂/kWh |
| 🍽️ Beslenme | 14 | Sığır eti: 27.0 kg CO₂/kg |
| ♻️ Atık | 5 | Karışık atık: 0.587 kg CO₂/kg |
| 💧 Su | 5 | Sıcak duş: 0.025 kg CO₂/dk |
| 💻 Dijital | 8 | Video izleme: 0.036 kg CO₂/saat |

---

## 🔧 Git Akışı

```bash
# Yeni özellik
git checkout -b feature/ai-carbon-dna

# Commit formatı
git commit -m "feat: karbon DNA profil hesaplama algoritması"
# feat:, fix:, refactor:, test:, docs:
```

---

*GreenCampus v1.0 | Kırşehir Ahi Evran Üniversitesi*
