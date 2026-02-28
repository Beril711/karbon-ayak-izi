# GreenCampus Backend — Kurulum Rehberi

## Önkoşullar (Bilgisayarında Kurulu Olması Gerekenler)

| Program | Versiyon | İndirme |
|---------|----------|---------|
| Python  | 3.11+    | https://python.org |
| Docker Desktop | Son sürüm | https://docker.com/products/docker-desktop |
| Git     | Herhangi | https://git-scm.com |

> Docker Desktop'ı kurunca PostgreSQL ve Redis için ayrıca bir şey kurman gerekmez.

---

## 1. Projeyi Aç

ZIP'i bir klasöre çıkart. Terminali aç, `backend` klasörüne gir:

```bash
cd green-campus/backend
```

---

## 2. .env Dosyası Oluştur

```bash
# Windows
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

`.env` dosyasını bir metin editörüyle aç, şu satırı düzenle:

```
SECRET_KEY=buraya-rastgele-uzun-bir-yazi-yaz-mesela-greencampus2026xyz
DEBUG=True
DATABASE_URL=postgres://gcuser:gcpassword@localhost:5432/greencampus
REDIS_URL=redis://localhost:6379/0
ALLOWED_UNIVERSITY_DOMAINS=ahievran.edu.tr,edu.tr
```

Diğer satırları şimdilik olduğu gibi bırak.

---

## 3. PostgreSQL ve Redis'i Başlat (Docker ile)

```bash
# green-campus/ ana klasöründe çalıştır (docker-compose.yml'nin olduğu yer)
cd ..
docker-compose up -d db redis
```

Çalışıp çalışmadığını kontrol et:

```bash
docker ps
```

Şunu görmelisin:
```
greencampus_db      ... Up
greencampus_redis   ... Up
```

---

## 4. Python Sanal Ortamı Kur

```bash
cd backend

# Sanal ortam oluştur
python -m venv venv

# Aktif et
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# Aktif olduğunda terminal satırının başında (venv) yazar
```

---

## 5. Paketleri Yükle

```bash
pip install -r requirements.txt
```

> Bu işlem 2-3 dakika sürebilir, internet bağlantısı gerekli.

---

## 6. manage.py Dosyasını Oluştur

`backend/` klasöründe `manage.py` dosyası yoksa oluştur:

```bash
# Bu komutu backend/ klasöründe çalıştır
python -c "
content = '''#!/usr/bin/env python
import os, sys
def main():
    os.environ.setdefault(\"DJANGO_SETTINGS_MODULE\", \"config.settings\")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(\"Django kurulamadı.\") from exc
    execute_from_command_line(sys.argv)
if __name__ == \"__main__\":
    main()
'''
open('manage.py', 'w').write(content)
print('manage.py oluşturuldu')
"
```

---

## 7. Veritabanı Tablolarını Oluştur

```bash
python manage.py migrate
```

Şunu görmelisin:
```
Applying users.0001_initial... OK
Applying emissions.0001_initial... OK
...
```

---

## 8. Örnek Verileri Yükle (Emisyon Faktörleri)

```bash
python manage.py seed_emission_factors
```

Şunu görmelisin:
```
✅ Oluşturuldu: Ulaşım
✅ Oluşturuldu: Enerji
...
✅ Toplam 49 emisyon faktörü yüklendi!
```

---

## 9. Yönetici Hesabı Oluştur

```bash
python manage.py createsuperuser
```

Soruları cevapla:
- Email: `admin@ahievran.edu.tr`
- Ad: `Admin`
- Soyad: `Admin`
- Şifre: istediğin bir şifre (en az 8 karakter)

---

## 10. Sunucuyu Başlat

```bash
python manage.py runserver
```

Şunu görmelisin:
```
Starting development server at http://127.0.0.1:8000/
```

---

## Çalışıp Çalışmadığını Test Et

Tarayıcında şu adresleri aç:

| Adres | Ne Gösterir |
|-------|-------------|
| http://localhost:8000/health/ | `{"status": "healthy"}` |
| http://localhost:8000/api/docs/ | Swagger — tüm API endpoint'leri |
| http://localhost:8000/admin/ | Django yönetim paneli |

---

## Sık Karşılaşılan Hatalar

### "could not connect to server" hatası
Docker çalışmıyor. Docker Desktop'ı aç, sonra tekrar dene:
```bash
docker-compose up -d db redis
```

### "No module named 'config'" hatası
`backend/` klasöründe değilsin. Doğru klasöre geç:
```bash
cd green-campus/backend
```

### "relation does not exist" hatası
Migration çalışmamış. Tekrar dene:
```bash
python manage.py migrate
```

### Port 8000 kullanımda hatası
Başka bir uygulama 8000 portunu kullanıyor:
```bash
python manage.py runserver 8001
# Sonra http://localhost:8001 kullan
```

---

## Celery Başlatma (Opsiyonel — Bildirimler için)

Backend çalışırken **ayrı bir terminal** aç:

```bash
cd green-campus/backend
source venv/bin/activate   # veya Windows: venv\Scripts\activate
celery -A config worker --loglevel=info
```

---

## Günlük Kullanım

Her gün çalışmaya başlarken:

```bash
# 1. Docker'ı başlat (sadece bir kere)
docker-compose up -d db redis

# 2. Sanal ortamı aktif et
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# 3. Sunucuyu başlat
cd backend
python manage.py runserver
```
