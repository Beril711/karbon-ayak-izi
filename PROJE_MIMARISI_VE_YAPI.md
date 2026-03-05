# GreenCampus — Karbon Ayak İzi Takip Platformu
## Kapsamlı Proje Mimarisi ve Yapı Dokümantasyonu

---

## 1. PROJE GENEL BAKIŞ

**GreenCampus**, üniversite öğrenci ve personelinin günlük karbon ayak izini takip etmelerini, azaltmalarını ve sürdürülebilirlik bilinci geliştirmelerini sağlayan **full-stack mobil uygulama** platformudur.

### 1.1 Temel Özellikler
- Günlük karbon emisyonu girişi ve takibi (6 kategoride 57 faktör)
- AI/ML destekli analiz ve tahmin sistemi (4 farklı AI modülü)
- Gamification sistemi (XP, seviye, rozet, seri, liderboard)
- Sanal karbon kredi pazarı (GCC — Green Carbon Credit)
- Akıllı sözleşme sistemi (grup karbon taahhüdü)
- Haftalık/aylık analitik ve trend takibi
- Üniversite bazlı erişim kontrolü (edu.tr domain)

### 1.2 Hedef Kitle
- Üniversite öğrencileri (`student` rolü)
- Üniversite personeli (`staff` rolü)
- Sistem yöneticileri (`admin` rolü)

---

## 2. TEKNOLOJİ STACK'İ

### 2.1 Frontend (Mobil Uygulama)

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|---------|----------------|
| React Native | 0.81.5 | Cross-platform mobil uygulama |
| Expo SDK | 54 | Geliştirme altyapısı, build, OTA güncelleme |
| TypeScript | 5.8 | Tip güvenliği |
| Redux Toolkit | 2.7 | Merkezi state yönetimi |
| React Navigation | 7.x | Ekran navigasyonu |
| Axios | 1.9 | HTTP istemcisi |
| expo-secure-store | — | JWT token güvenli saklama |
| react-native-svg | — | SVG ikon rendering |
| react-native-safe-area-context | — | Güvenli alan yönetimi |

### 2.2 Backend (API Sunucusu)

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|---------|----------------|
| Python | 3.11+ | Ana programlama dili |
| Django | 4.2 | Web framework |
| Django REST Framework | 3.15 | RESTful API |
| SimpleJWT | — | JWT token kimlik doğrulama |
| drf-spectacular | — | Swagger/ReDoc API dökümantasyonu |
| django-celery-beat | — | Periyodik görev zamanlayıcı |
| channels | — | WebSocket desteği |
| whitenoise | — | Statik dosya servisi |
| django-cors-headers | — | CORS yapılandırması |
| scikit-learn | — | Makine öğrenmesi (K-NN, Linear Regression) |
| numpy / pandas | — | Veri analizi |

### 2.3 Altyapı

| Teknoloji | Kullanım Amacı |
|-----------|----------------|
| Docker Compose | 5 servisli konteyner orkestrasyon |
| PostgreSQL 15 | Production veritabanı |
| SQLite | Development veritabanı (fallback) |
| Redis 7 | Mesaj kuyruğu (Celery broker) |
| Celery | Asenkron görev işleme |
| Celery Beat | Zamanlı görevler (gece özetleri vb.) |

---

## 3. MİMARİ ŞEMA

### 3.1 Genel Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────────┐
│                        KULLANICI KATMANI                        │
│                                                                  │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│    │  iOS Cihaz   │    │ Android     │    │  Web        │        │
│    │  (Expo Go)   │    │ (Expo Go)   │    │  (localhost) │        │
│    └──────┬───────┘    └──────┬──────┘    └──────┬──────┘        │
│           │                   │                   │              │
│           └───────────────────┼───────────────────┘              │
│                               │                                  │
│                    ┌──────────┴──────────┐                       │
│                    │  React Native App   │                       │
│                    │  (Expo SDK 54)      │                       │
│                    │  TypeScript         │                       │
│                    └──────────┬──────────┘                       │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTPS / JWT Bearer
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                        API KATMANI                               │
│                               │                                  │
│                    ┌──────────┴──────────┐                       │
│                    │   Django REST       │                       │
│                    │   Framework         │                       │
│                    │   Port: 8000        │                       │
│                    └──────────┬──────────┘                       │
│                               │                                  │
│              ┌────────────────┼────────────────┐                 │
│              │                │                │                 │
│     ┌────────┴───────┐ ┌─────┴──────┐ ┌──────┴───────┐         │
│     │  Middleware     │ │ Serializer │ │  Views       │         │
│     │  - CORS        │ │ Katmanı    │ │  (6 App)     │         │
│     │  - JWT Auth    │ │            │ │              │         │
│     │  - Throttling  │ │            │ │              │         │
│     └────────────────┘ └────────────┘ └──────────────┘         │
└──────────────────────────────┼───────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                     VERİ KATMANI                                 │
│                               │                                  │
│     ┌─────────────────────────┼─────────────────────────┐       │
│     │                         │                         │       │
│  ┌──┴──────────┐   ┌─────────┴────────┐   ┌───────────┴──┐    │
│  │ PostgreSQL  │   │  Redis           │   │  Dosya       │    │
│  │ / SQLite    │   │  (Cache/Queue)   │   │  Sistemi     │    │
│  │             │   │                  │   │  (Media/     │    │
│  │  - Users    │   │  - Celery Broker │   │   Static)    │    │
│  │  - Entries  │   │  - Cache Backend │   │              │    │
│  │  - Analytics│   │                  │   │              │    │
│  │  - Badges   │   │                  │   │              │    │
│  │  - Market   │   │                  │   │              │    │
│  └─────────────┘   └──────────────────┘   └──────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                    ARKA PLAN KATMANI                              │
│                               │                                  │
│     ┌─────────────────────────┼─────────────────────────┐       │
│     │                         │                         │       │
│  ┌──┴──────────┐   ┌─────────┴────────┐                        │
│  │ Celery      │   │ Celery Beat      │                        │
│  │ Worker      │   │ (Scheduler)      │                        │
│  │             │   │                  │                        │
│  │ - XP hesap  │   │ - Gece özetleri │                        │
│  │ - Rozet     │   │ - Haftalık rapor│                        │
│  │ - Streak    │   │ - Seri kontrol  │                        │
│  │ - Bildirim  │   │ - Liderboard    │                        │
│  └─────────────┘   └─────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 Docker Compose Servisleri

```
┌─────────────────────────────────────────────────────┐
│                 docker-compose.yml                   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │    db     │  │  redis   │  │    backend        │  │
│  │ postgres  │  │ redis:7  │  │ Django :8000      │  │
│  │ :15-alpine│  │ -alpine  │  │                    │  │
│  │ :5432     │  │ :6379    │  │ depends_on:       │  │
│  └─────┬─────┘  └────┬─────┘  │  db, redis        │  │
│        │              │        └─────────┬──────────┘  │
│        │              │                  │             │
│        │              │        ┌─────────┴──────────┐  │
│        │              │        │   celery worker     │  │
│        │              │        │   celery -A config  │  │
│        │              │        │   worker --loglevel │  │
│        │              │        └─────────┬──────────┘  │
│        │              │                  │             │
│        │              │        ┌─────────┴──────────┐  │
│        │              │        │   celery-beat       │  │
│        │              │        │   celery -A config  │  │
│        │              │        │   beat --scheduler  │  │
│        │              │        └────────────────────┘  │
│  Volumes: postgres_data                                │
└─────────────────────────────────────────────────────┘
```

---

## 4. BACKEND UYGULAMA YAPISI

### 4.1 Django Uygulama Modülleri

```
backend/
├── config/                     # Proje yapılandırması
│   ├── settings.py             # Django ayarları
│   ├── urls.py                 # URL yönlendirme
│   ├── wsgi.py                 # WSGI arayüzü
│   ├── asgi.py                 # ASGI arayüzü (WebSocket)
│   └── celery.py               # Celery yapılandırması
│
├── apps/
│   ├── users/                  # Kullanıcı yönetimi
│   │   ├── models.py           # CustomUser + UserProfile
│   │   ├── serializers.py      # Register/Login serializer
│   │   ├── views.py            # Auth endpoints
│   │   └── signals.py          # Otomatik profil oluşturma
│   │
│   ├── emissions/              # Emisyon takip sistemi
│   │   ├── models.py           # Category, Factor, Entry
│   │   ├── serializers.py      # CRUD serializer'lar
│   │   ├── views.py            # REST API endpoint'leri
│   │   └── management/commands/
│   │       └── seed_emission_factors.py  # 57 faktör seed
│   │
│   ├── analytics/              # Analitik ve raporlama
│   │   ├── models.py           # DailyEmissionSummary, WeeklySummary, CarbonBudget
│   │   ├── views.py            # Haftalık/aylık analiz endpoint'leri
│   │   └── tasks.py            # Celery görevleri (gece özetleri)
│   │
│   ├── gamification/           # Oyunlaştırma sistemi
│   │   ├── models.py           # Badge, UserXP, Streak, WeeklyLeaderboard
│   │   ├── views.py            # XP/Streak/Badge endpoint'leri
│   │   └── tasks.py            # XP hesaplama görevleri
│   │
│   ├── ai_features/            # AI/ML modülleri
│   │   ├── services.py         # 4 AI servisi (DNA, Twin, Time, Memory)
│   │   └── views.py            # AI endpoint'leri
│   │
│   └── market/                 # Karbon kredi pazarı
│       ├── models.py           # CarbonCredit, SmartContract
│       └── views.py            # Cüzdan ve sözleşme endpoint'leri
│
├── requirements.txt            # Python bağımlılıkları
├── Dockerfile                  # Docker image tanımı
└── manage.py                   # Django yönetim aracı
```

### 4.2 Veritabanı Şeması (ER Diyagramı)

```
┌──────────────────────┐         ┌──────────────────────┐
│     CustomUser        │         │    UserProfile        │
├──────────────────────┤         ├──────────────────────┤
│ id (PK)              │◄───────│ user (FK, OneToOne)   │
│ email (unique)       │         │ avatar               │
│ first_name           │         │ bio                  │
│ last_name            │         │ faculty              │
│ role (student/staff) │         │ department           │
│ university           │         │ student_number       │
│ is_active            │         │ daily_carbon_goal    │
│ is_staff             │         │ notify_daily         │
│ date_joined          │         │ notify_streak        │
│ fcm_token            │         │ is_public            │
└──────────┬───────────┘         └──────────────────────┘
           │
           │ 1:N
           ▼
┌──────────────────────┐
│    EmissionEntry      │
├──────────────────────┤
│ id (PK, UUID)        │
│ user (FK)            │───────────────────────┐
│ factor (FK)          │──────┐                │
│ quantity             │      │                │
│ co2_kg (hesaplanan)  │      │                │
│ note                 │      │                │
│ date                 │      │                │
│ is_predicted         │      │                │
│ created_at           │      │                │
└──────────────────────┘      │                │
                              │                │
                              ▼                │
┌──────────────────────┐                       │
│   EmissionFactor      │                       │
├──────────────────────┤                       │
│ id (PK)              │                       │
│ category (FK)        │──────┐                │
│ name / name_tr       │      │                │
│ co2_per_unit         │      │                │
│ unit (km/kWh/kg/..)  │      │                │
│ source               │      │                │
│ is_active            │      │                │
└──────────────────────┘      │                │
                              │                │
                              ▼                │
┌──────────────────────┐                       │
│  EmissionCategory     │                       │
├──────────────────────┤                       │
│ slug (PK, unique)    │                       │
│ name / name_tr       │                       │
│ icon                 │                       │
│ color                │                       │
│ order                │                       │
│ is_active            │                       │
└──────────────────────┘                       │
                                               │
┌──────────────────────┐                       │
│  DailyEmissionSummary │                       │
├──────────────────────┤                       │
│ user (FK)            │◄──────────────────────┘
│ date                 │
│ total_co2            │
│ transport_co2        │
│ energy_co2           │
│ food_co2             │
│ waste_co2            │
│ water_co2            │
│ digital_co2          │
│ daily_goal           │
│ goal_achieved        │
│ entry_count          │
└──────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│      UserXP           │    │      Badge            │
├──────────────────────┤    ├──────────────────────┤
│ user (FK, 1:1)       │    │ slug (PK)            │
│ total_xp             │    │ name / name_tr       │
│ level (1-11)         │    │ description          │
│ updated_at           │    │ icon                 │
└──────────┬───────────┘    │ tier (bronze/..)     │
           │                │ xp_reward            │
           │                │ trigger              │
           │                │ threshold            │
           │                └──────────┬───────────┘
           │                           │
           │    ┌──────────────────────┐│
           │    │     UserBadge        ││
           │    ├──────────────────────┤│
           └───►│ user (FK)           │◄┘
                │ badge (FK)           │
                │ earned_at            │
                │ is_new               │
                └──────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│      Streak           │    │  WeeklyLeaderboard   │
├──────────────────────┤    ├──────────────────────┤
│ user (FK, 1:1)       │    │ user (FK)            │
│ current_streak       │    │ week_start           │
│ longest_streak       │    │ total_co2            │
│ last_entry_date      │    │ rank                 │
│ updated_at           │    │ xp_earned            │
└──────────────────────┘    └──────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│    CarbonCredit       │    │   SmartContract      │
│    (GCC Cüzdan)       │    │  (Akıllı Sözleşme)   │
├──────────────────────┤    ├──────────────────────┤
│ user (FK, 1:1)       │    │ id (UUID)            │
│ balance              │    │ creator (FK)         │
│ total_earned         │    │ title                │
│ total_spent          │    │ description          │
│ updated_at           │    │ target_co2_red_pct   │
└──────────────────────┘    │ duration_days        │
                            │ max_participants     │
                            │ reward_per_part      │
                            │ start_date           │
                            │ end_date             │
                            │ status               │
                            └──────────────────────┘
```

---

## 5. FRONTEND UYGULAMA YAPISI

### 5.1 Dizin Yapısı

```
frontend/
├── app/
│   └── index.tsx               # Expo Router giriş noktası
│
├── src/
│   ├── navigation/
│   │   ├── index.tsx            # RootNavigator + MainTabs + CustomDrawer
│   │   └── DrawerContext.tsx    # Drawer state context
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── OnboardingScreen.tsx   # 4-slide tanıtım
│   │   │   ├── LoginScreen.tsx        # E-posta/şifre giriş
│   │   │   └── RegisterScreen.tsx     # Kayıt formu
│   │   │
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx         # Ana dashboard
│   │   │   ├── AddEntryScreen.tsx     # 3-adımlı emisyon ekleme
│   │   │   ├── AnalyticsScreen.tsx    # Haftalık analiz
│   │   │   └── ProfileScreen.tsx      # Profil ve rozetler
│   │   │
│   │   └── ai/
│   │       ├── AIHubScreen.tsx        # AI merkezi
│   │       ├── CarbonDNAScreen.tsx    # Karbon DNA profili
│   │       ├── CarbonTwinScreen.tsx   # Senaryo simülasyonu
│   │       ├── TimeMachineScreen.tsx  # Gelecek projeksiyonu
│   │       └── CarbonMemoryScreen.tsx # K-NN tahmin
│   │
│   ├── store/
│   │   ├── index.ts             # Redux store yapılandırması
│   │   └── slices/
│   │       ├── authSlice.ts     # Kimlik doğrulama state
│   │       ├── emissionSlice.ts # Emisyon verisi state
│   │       └── gamificationSlice.ts # XP/badge/streak state
│   │
│   ├── services/
│   │   └── api.ts               # Axios instance + JWT interceptor
│   │
│   ├── theme/
│   │   └── index.ts             # Tema sistemi (renkler, tipografi, spacing)
│   │
│   └── types/
│       └── index.ts             # TypeScript tip tanımları
│
├── package.json                 # Bağımlılıklar
├── tsconfig.json                # TypeScript yapılandırması
└── app.json                     # Expo yapılandırması
```

### 5.2 Navigasyon Akışı

```
┌─────────────────────────────────────────────────────────────┐
│                      RootNavigator                          │
│                   (NativeStackNavigator)                     │
│                                                              │
│  ┌─ user === null ──────────────────────────────────────┐   │
│  │                                                       │   │
│  │  OnboardingScreen ──► LoginScreen ──► RegisterScreen  │   │
│  │       (4-slide)        (e-posta)       (kayıt formu)  │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ user !== null ──────────────────────────────────────┐   │
│  │                                                       │   │
│  │  MainApp (AppWithDrawer)                              │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │              MainTabs                            │  │   │
│  │  │         (BottomTabNavigator)                     │  │   │
│  │  │                                                  │  │   │
│  │  │  ┌────────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌────┐ │   │
│  │  │  │  Home  │ │Analytic│ │  +   │ │Leader │ │Prof│ │  │   │
│  │  │  │  Ana   │ │ Analiz │ │ FAB  │ │ board │ │ il │ │  │   │
│  │  │  │ Sayfa  │ │        │ │      │ │       │ │    │ │  │   │
│  │  │  └────────┘ └────────┘ └──────┘ └───────┘ └────┘ │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  ┌─ CustomDrawerPanel (Animated Overlay) ──────────┐  │   │
│  │  │  - Keşfet                                       │  │   │
│  │  │  - AI Özellikleri                               │  │   │
│  │  │  - Karbon DNA                                   │  │   │
│  │  │  - Karbon İkizi                                 │  │   │
│  │  │  - Zaman Makinesi                               │  │   │
│  │  │  - Karbon Hafıza                                │  │   │
│  │  │  - Ayarlar                                      │  │   │
│  │  │  - Çıkış Yap                                    │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  │                                                       │   │
│  │  AddEntryModal (presentation: 'modal')                │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 State Yönetimi (Redux)

```
┌─────────────────────────────────────────────────────┐
│                   Redux Store                        │
│                                                      │
│  ┌─ authSlice ────────────────────────────────────┐ │
│  │  user: User | null                              │ │
│  │  isLoading: boolean                             │ │
│  │  error: string | null                           │ │
│  │                                                  │ │
│  │  Thunks:                                        │ │
│  │   - login(email, password)                      │ │
│  │   - register(data)                              │ │
│  │   - logout()                                    │ │
│  │   - loadStoredAuth()                            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ emissionSlice ────────────────────────────────┐ │
│  │  entries: EmissionEntry[]                       │ │
│  │  todaySummary: TodaySummary | null              │ │
│  │  categories: EmissionCategory[]                 │ │
│  │  factors: EmissionFactor[]                      │ │
│  │  isLoading / isSubmitting: boolean              │ │
│  │                                                  │ │
│  │  Thunks:                                        │ │
│  │   - fetchTodaySummary()                         │ │
│  │   - fetchEntries(params?)                       │ │
│  │   - addEntry(data)                              │ │
│  │   - deleteEntry(id)                             │ │
│  │   - fetchCategories()                           │ │
│  │   - fetchFactors(categorySlug?)                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ gamificationSlice ────────────────────────────┐ │
│  │  xp: XPData | null                              │ │
│  │  streak: StreakData | null                       │ │
│  │  badges: Badge[]                                │ │
│  │  leaderboard: LeaderboardData | null            │ │
│  │                                                  │ │
│  │  Thunks:                                        │ │
│  │   - fetchGamificationStatus()                   │ │
│  │   - fetchBadges()                               │ │
│  │   - fetchLeaderboard()                          │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 6. API MİMARİSİ

### 6.1 Endpoint Haritası

```
/api/v1/
│
├── auth/                        # Kimlik Doğrulama
│   ├── POST   register/         # Yeni kullanıcı kaydı
│   ├── POST   token/            # JWT token al (login)
│   ├── POST   token/refresh/    # Token yenile
│   └── GET    me/               # Mevcut kullanıcı bilgisi
│
├── emissions/                   # Emisyon Yönetimi
│   ├── GET    categories/       # Kategori listesi (Public)
│   ├── GET    factors/          # Faktör listesi (Public)
│   │          ?category__slug=transport
│   ├── GET    entries/          # Kullanıcı girişleri
│   │          ?date=2026-03-05
│   │          ?factor__category__slug=food
│   ├── POST   entries/          # Yeni giriş ekle
│   ├── GET    entries/{id}/     # Giriş detayı
│   ├── PATCH  entries/{id}/     # Giriş güncelle
│   ├── DELETE entries/{id}/     # Giriş sil
│   └── GET    today/            # Bugünün özeti
│
├── analytics/                   # Analitik
│   ├── GET    weekly/           # Haftalık veri
│   ├── GET    trend/            # Trend analizi
│   └── GET    budget/           # Aylık bütçe durumu
│
├── gamification/                # Oyunlaştırma
│   ├── GET    status/           # XP ve streak durumu
│   ├── GET    badges/           # Tüm rozetler
│   └── GET    leaderboard/      # Haftalık liderboard
│
├── ai/                          # AI Modülleri
│   ├── GET    carbon-dna/       # Karbon DNA profili
│   ├── GET    carbon-twin/      # Senaryo simülasyonu
│   ├── GET    time-projection/  # Gelecek projeksiyonu
│   └── GET    carbon-memory/    # Eksik gün tahmini
│
├── market/                      # Karbon Pazarı
│   ├── GET    wallet/           # GCC bakiye
│   ├── GET    transactions/     # İşlem geçmişi
│   ├── GET    contracts/        # Akıllı sözleşmeler
│   └── POST   contracts/{id}/join/  # Sözleşmeye katıl
│
└── docs/                        # API Dokümantasyonu
    ├── schema/                  # OpenAPI 3.0 şema
    ├── swagger/                 # Swagger UI
    └── redoc/                   # ReDoc UI
```

### 6.2 Kimlik Doğrulama Akışı

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                               │
     │  POST /auth/token/                            │
     │  { email, password }                          │
     ├──────────────────────────────────────────────►│
     │                                               │
     │  { access: "eyJ...", refresh: "eyJ..." }      │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │  SecureStore.setItem('accessToken', access)   │
     │  SecureStore.setItem('refreshToken', refresh) │
     │                                               │
     │  GET /emissions/entries/                      │
     │  Authorization: Bearer eyJ...                 │
     ├──────────────────────────────────────────────►│
     │                                               │
     │  200 OK { results: [...] }                    │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │  (1 saat sonra token süresi dolduğunda)       │
     │                                               │
     │  GET /emissions/entries/                      │
     │  Authorization: Bearer eyJ... (expired)       │
     ├──────────────────────────────────────────────►│
     │                                               │
     │  401 Unauthorized                             │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │  [Axios Interceptor otomatik olarak:]          │
     │  POST /auth/token/refresh/                    │
     │  { refresh: "eyJ..." }                        │
     ├──────────────────────────────────────────────►│
     │                                               │
     │  { access: "yeni_eyJ...", refresh: "yeni.." } │
     │◄──────────────────────────────────────────────┤
     │                                               │
     │  [Orijinal istek tekrar denenir]              │
     │  GET /emissions/entries/                      │
     │  Authorization: Bearer yeni_eyJ...            │
     ├──────────────────────────────────────────────►│
     │                                               │
     │  200 OK { results: [...] }                    │
     │◄──────────────────────────────────────────────┤
```

### 6.3 JWT Token Yapılandırması

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':     timedelta(hours=1),    # Access token: 1 saat
    'REFRESH_TOKEN_LIFETIME':    timedelta(days=30),     # Refresh token: 30 gün
    'ROTATE_REFRESH_TOKENS':     True,                   # Her yenilemede yeni refresh
    'BLACKLIST_AFTER_ROTATION':  True,                   # Eski refresh blacklist
    'AUTH_HEADER_TYPES':         ('Bearer',),
}
```

---

## 7. TEMA SİSTEMİ

### 7.1 Renk Paleti

```
YEŞIL PALETİ (Ana Tema)
┌────────┬─────────┬─────────────────────────────────────┐
│ Token  │ HEX     │ Kullanım                            │
├────────┼─────────┼─────────────────────────────────────┤
│ g900   │ #0D3B1E │ En koyu yeşil                       │
│ g800   │ #1B5E20 │ Koyu başlıklar, shadow rengi        │
│ g700   │ #2E7D32 │ Birincil butonlar, linkler          │
│ g600   │ #388E3C │ Aktif border                        │
│ g500   │ #4CAF50 │ Drawer header, FAB, ana vurgu       │
│ g400   │ #66BB6A │ FAB aktif, ikincil vurgu            │
│ g300   │ #81C784 │ Hafif vurgu                         │
│ g200   │ #A5D6A7 │ Drawer e-posta, alt vurgu           │
│ g100   │ #C8E6C9 │ Highlight arkaplan                  │
│ g50    │ #E8F5E9 │ Seçili rol arkaplan                 │
└────────┴─────────┴─────────────────────────────────────┘

KATEGORİ RENKLERİ
┌──────────┬─────────┬──────────────────┐
│ Kategori │ HEX     │ Emoji           │
├──────────┼─────────┼──────────────────┤
│ Ulaşım   │ #FF9800 │ 🚗              │
│ Enerji   │ #FFEE58 │ ⚡              │
│ Beslenme │ #66BB6A │ 🍽️              │
│ Atık     │ #26A69A │ ♻️              │
│ Su       │ #42A5F5 │ 💧              │
│ Dijital  │ #AB47BC │ 💻              │
└──────────┴─────────┴──────────────────┘

GAMİFİCATION TIER RENKLERİ
┌──────────┬─────────┐
│ Bronz    │ #CD7F32 │
│ Gümüş    │ #C0C0C0 │
│ Altın    │ #FFD700 │
│ Platin   │ #E5E4E2 │
└──────────┴─────────┘
```

### 7.2 Tipografi Sistemi

```
Font Aileleri:
  - Display:  Fraunces 700 Bold  (Başlıklar)
  - Body:     DM Sans 400/500/700 (Gövde metni)
  - Mono:     Space Mono 400      (Sayılar, kod)

Boyut Skalası:
  xs:   11px   →  İpuçları, hint metinleri
  sm:   13px   →  Etiketler, alt başlıklar
  base: 15px   →  Genel gövde metni
  md:   17px   →  Alt başlıklar
  lg:   20px   →  Bölüm başlıkları
  xl:   24px   →  Selamlama başlığı
  2xl:  28px   →  Sayfa başlıkları
  3xl:  34px   →  Hero başlıklar
  4xl:  40px   →  Büyük sayılar
```

---

## 8. GAMİFİCATION SİSTEMİ

### 8.1 XP ve Seviye Sistemi

```
SEVİYE EŞİKLERİ
┌────────┬─────────────┬──────────────────────┐
│ Seviye │ Gereken XP  │ Toplam Artış         │
├────────┼─────────────┼──────────────────────┤
│   1    │      0      │ Başlangıç            │
│   2    │    100      │ +100                 │
│   3    │    250      │ +150                 │
│   4    │    500      │ +250                 │
│   5    │   1000      │ +500                 │
│   6    │   2000      │ +1000                │
│   7    │   4000      │ +2000                │
│   8    │   7000      │ +3000                │
│   9    │  11000      │ +4000                │
│  10    │  16000      │ +5000                │
│  11    │  25000      │ +9000 (Max)          │
└────────┴─────────────┴──────────────────────┘

XP KAZANIM KAYNAKLARI
┌────────────────────┬─────────┐
│ Aksiyon            │ XP      │
├────────────────────┼─────────┤
│ Emisyon girişi     │ +10     │
│ Günlük hedef       │ +50     │
│ İlk giriş          │ +100    │
│ Seri bonusu        │ Değişken│
│ Rozet kazanımı     │ Değişken│
│ Haftalık liderboard│ Değişken│
└────────────────────┴─────────┘
```

### 8.2 Rozet Sistemi

```
ROZET TETİKLEYİCİLERİ
┌───────────────────┬────────────────────────────────┐
│ Tetikleyici       │ Açıklama                       │
├───────────────────┼────────────────────────────────┤
│ entry_count       │ Belirli sayıda giriş yapma     │
│ streak_days       │ Belirli gün serisi tutturma    │
│ goal_achieved     │ Günlük hedef tutturma sayısı   │
│ co2_saved         │ CO2 tasarrufu miktarı          │
│ category_mastery  │ Belirli kategoride uzmanlık    │
│ leaderboard_top   │ Liderboard'da ilk sıralara çıkma│
│ first_entry       │ İlk emisyon girişi             │
│ weekly_champion   │ Haftalık şampiyon olma         │
│ special           │ Özel etkinlik rozetleri        │
└───────────────────┴────────────────────────────────┘

TIER HİYERARŞİSİ
  🥉 Bronz    →  Başlangıç rozetleri (50 XP)
  🥈 Gümüş    →  Orta seviye rozetler
  🥇 Altın    →  İleri seviye rozetler
  💎 Platin   →  Uzmanlık rozetleri
```

### 8.3 Seri (Streak) Sistemi

```
Kurallar:
  - Her gün en az 1 emisyon girişi yapıldığında seri artar
  - Ardışık günlerde giriş yapılmazsa seri sıfırlanır
  - Aynı gün birden fazla giriş seriyi bir kez artırır
  - En uzun seri (longest_streak) her zaman saklanır
  - Celery Beat ile gece kontrolü yapılır
```

---

## 9. AI / ML MODÜLLERİ

### 9.1 Modül Genel Bakışı

```
┌───────────────────────────────────────────────────────────────┐
│                    AI/ML SERVİSLERİ                           │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │  KARBON DNA     │  │  KARBON İKİZİ   │                    │
│  │                 │  │                 │                    │
│  │  Son 30 günün   │  │  5 farklı       │                    │
│  │  verilerinden   │  │  senaryo ile    │                    │
│  │  kullanıcıya    │  │  "ya şöyle      │                    │
│  │  özel karbon    │  │  yapsaydın?"    │                    │
│  │  profili çıkarır│  │  simülasyonu    │                    │
│  │                 │  │                 │                    │
│  │  Referans:      │  │  Çarpanlar:     │                    │
│  │  IPCC değerleri │  │  transport:0.30 │                    │
│  │                 │  │  food: 0.45     │                    │
│  │  Çıktı:         │  │  energy: 0.15   │                    │
│  │  - 6 skor       │  │  digital: 0.50  │                    │
│  │  - Profil tipi  │  │  waste: 0.20    │                    │
│  │  - DNA sekansı  │  │                 │                    │
│  └─────────────────┘  └─────────────────┘                    │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                    │
│  │ ZAMAN MAKİNESİ  │  │ KARBON HAFIZA   │                    │
│  │                 │  │    (K-NN)       │                    │
│  │  Haftalık        │  │                 │                    │
│  │  verilerle       │  │  Son 60 günde   │                    │
│  │  Linear          │  │  veri girilmemiş│                    │
│  │  Regression      │  │  günleri K-NN   │                    │
│  │  kullanarak      │  │  algoritması    │                    │
│  │  10 yıllık       │  │  ile tahmin     │                    │
│  │  projeksiyon     │  │  eder           │                    │
│  │                 │  │                 │                    │
│  │  3 Senaryo:      │  │  Ağırlıklar:    │                    │
│  │  - Gerçekçi      │  │  Gün benzerliği │                    │
│  │  - İyimser(%5↓)  │  │  %60 + Zaman    │                    │
│  │  - Kötümser(%3↑) │  │  yakınlığı %40  │                    │
│  └─────────────────┘  └─────────────────┘                    │
└───────────────────────────────────────────────────────────────┘
```

### 9.2 Kullanılan Kütüphaneler
- **scikit-learn**: `LinearRegression` (Zaman Makinesi projeksiyonu)
- **numpy**: `np.std`, `np.array` (istatistiksel hesaplamalar, K-NN)
- **pandas**: Veri işleme (implicitly through Django ORM)

---

## 10. KARBON KREDİ PAZARI

### 10.1 GCC (Green Carbon Credit) Sistemi

```
┌───────────────────────────────────────────────────────────┐
│                  KARBON KREDİ PAZARI                      │
│                                                           │
│  ┌─ CarbonCredit (Cüzdan) ────────────────────────────┐ │
│  │  Kullanıcı başına 1 adet sanal cüzdan               │ │
│  │  Bakiye: GCC (Green Carbon Credit)                  │ │
│  │  İşlemler: Kazanım / Harcama / Transfer             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─ SmartContract (Akıllı Sözleşme) ──────────────────┐ │
│  │  Grup karbon taahhüdü sözleşmesi                    │ │
│  │                                                      │ │
│  │  Akış:                                               │ │
│  │  1. Oluşturucu sözleşme tanımlar                    │ │
│  │     - Hedef CO2 azaltım yüzdesi                     │ │
│  │     - Süre (gün)                                    │ │
│  │     - Max katılımcı                                 │ │
│  │     - Ödül (XP/katılımcı)                           │ │
│  │  2. Katılımcılar katılır                            │ │
│  │     - Katılım anında baseline CO2 kaydedilir        │ │
│  │  3. Süre sonunda kontrol                            │ │
│  │     - Hedef tutturulmuşsa → Ödül dağıtılır          │ │
│  │     - Tutturulamamışsa → Başarısız                   │ │
│  │                                                      │ │
│  │  Durumlar: open → active → completed/failed          │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

---

## 11. GÜVENLİK MİMARİSİ

### 11.1 Güvenlik Katmanları

```
1. KİMLİK DOĞRULAMA
   ├── JWT Bearer Token (SimpleJWT)
   ├── Access Token: 1 saat ömür
   ├── Refresh Token: 30 gün ömür (rotasyonlu)
   ├── Blacklist: Eski refresh token'lar blacklist edilir
   └── SecureStore: Token'lar cihazda güvenli depolanır

2. YETKİLENDİRME
   ├── IsAuthenticated: Tüm korumalı endpoint'ler
   ├── AllowAny: Kategori ve faktör listesi (public)
   └── Kullanıcı izolasyonu: Her kullanıcı sadece kendi verisini görür

3. HIZLANDIRMA (Rate Limiting)
   ├── Anonim: 20 istek/dakika
   └── Kullanıcı: 200 istek/dakika

4. CORS
   ├── Development: Tüm origin'lere izin
   └── Production: Beyaz liste (localhost:3000, 8082, 19006)

5. VERİ VALİDASYONU
   ├── Üniversite domain kontrolü (edu.tr)
   ├── Gelecek tarih girişi engeli
   ├── Minimum miktar kontrolü (0.001)
   └── Şifre politikası (Django validators)

6. MIDDLEWARE
   ├── SecurityMiddleware
   ├── WhiteNoise (static file güvenliği)
   ├── CorsMiddleware
   ├── CsrfViewMiddleware
   └── XFrameOptionsMiddleware
```

---

## 12. PERFORMANS VE ÖLÇEKLENEBİLİRLİK

### 12.1 Optimizasyonlar

```
BACKEND:
  - select_related():     N+1 sorgu önleme (factor__category)
  - Veritabanı indeksleri: [user, date], [user, -created_at]
  - Sayfalama:            20 kayıt/sayfa (PageNumberPagination)
  - Caching:              LocMemCache (geliştirme), Redis (prod)
  - Asenkron işleme:      Celery ile gamification arka planda
  - Throttling:           DDoS koruması
  - WhiteNoise:           Statik dosya sıkıştırma

FRONTEND:
  - useFocusEffect:       Sadece ekran görünür olduğunda veri çek
  - Redux memoization:    useSelector ile gereksiz render önleme
  - RefreshControl:       Pull-to-refresh ile kullanıcı kontrollü yenileme
  - Axios interceptor:    Otomatik token yenileme (kullanıcı farkında olmadan)
  - Queue mekanizması:    Çoklu 401 isteklerinde tek refresh
```

---

## 13. PROJE ÇALIŞTIRMA

### 13.1 Docker ile (Production)

```bash
# Tüm servisleri başlat
docker-compose up -d

# Veritabanı migration
docker-compose exec backend python manage.py migrate

# Emisyon faktörlerini yükle
docker-compose exec backend python manage.py seed_emission_factors

# Admin kullanıcı oluştur
docker-compose exec backend python manage.py createsuperuser
```

### 13.2 Docker'sız (Development)

```bash
# Backend
cd backend
pip install -r requirements.txt
echo DEBUG=True > .env
python manage.py migrate
python manage.py seed_emission_factors
python manage.py createsuperuser
python manage.py runserver 8000

# Frontend
cd frontend
npm install
npx expo start --web --port 8081
```

---

## 14. SONUÇ

GreenCampus, modern web/mobil teknolojileri ve yapay zeka algoritmalarını birleştirerek üniversite öğrencilerinin karbon ayak izini takip etmelerini sağlayan kapsamlı bir platformdur. Modüler Django backend mimarisi, Redux ile yönetilen React Native frontend'i, 4 farklı AI/ML modülü, gamification sistemi ve sanal karbon kredi pazarı ile sürdürülebilirlik bilincini oyunlaştırma yoluyla artırmayı hedefler.

---

*Bu döküman, projenin tam kaynak kodundan otomatik olarak oluşturulmuştur.*
*Son güncelleme: Mart 2026*
