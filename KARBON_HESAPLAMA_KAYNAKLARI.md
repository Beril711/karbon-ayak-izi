# Karbon Ayak İzi Hesaplama Sistemi — Detaylı Kaynak Dokümantasyonu

---

## 1. HESAPLAMA PRENSİBİ

### 1.1 Temel Formül

Projede kullanılan karbon emisyonu hesaplama formülü:

```
CO₂ (kg) = Miktar × Emisyon Faktörü (co2_per_unit)
```

**Örnek:**
- Kullanıcı 10 km otomobil (benzinli) sürdüğünü girer
- Emisyon faktörü: 0.171 kg CO₂e/km
- Hesaplama: 10 × 0.171 = **1.71 kg CO₂**

### 1.2 Hesaplamanın Gerçekleştiği Katmanlar

Hesaplama iki yerde yapılır (güvenlik için):

**1. Backend — Serializer (birincil)**
```python
# backend/apps/emissions/serializers.py, satır 43
def create(self, validated_data):
    entry = EmissionEntry(user=user, **validated_data)
    entry.co2_kg = entry.quantity * entry.factor.co2_per_unit
    entry.save()
```

**2. Backend — Model save() (yedek)**
```python
# backend/apps/emissions/models.py, satır 117-120
def save(self, *args, **kwargs):
    if not self.co2_kg:
        self.co2_kg = self.quantity * self.factor.co2_per_unit
    super().save(*args, **kwargs)
```

---

## 2. EMİSYON KATEGORİLERİ VE FAKTÖRLERİ

Projede **6 ana kategori** ve toplam **57 emisyon faktörü** tanımlanmıştır.

Kaynak dosya: `backend/apps/emissions/management/commands/seed_emission_factors.py`

---

### 2.1 ULAŞIM (Transport) — 12 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Car (petrol) | Otomobil (Benzinli) | 0.171 kg/km | km | IPCC AR6, WG III, Chapter 10: Transport |
| 2 | Car (diesel) | Otomobil (Dizel) | 0.168 kg/km | km | IPCC AR6, WG III, Chapter 10: Transport |
| 3 | Car (electric) | Otomobil (Elektrikli) | 0.053 kg/km | km | IEA Global EV Outlook 2023 |
| 4 | Motorcycle | Motosiklet | 0.114 kg/km | km | IPCC AR6, WG III, Table 10.1 |
| 5 | City bus | Şehir Otobüsü | 0.089 kg/km | km | IEA CO₂ Emissions from Transport 2023 |
| 6 | Metro/Subway | Metro | 0.028 kg/km | km | IEA Energy Technology Perspectives |
| 7 | Train | Tren | 0.041 kg/km | km | IEA Rail Transport Report |
| 8 | Domestic flight | Yurtiçi Uçuş | 0.255 kg/km | km | IPCC AR6, WG III, Aviation Chapter |
| 9 | International flight | Yurtdışı Uçuş | 0.195 kg/km | km | IPCC AR6, WG III, Aviation Chapter |
| 10 | Bicycle | Bisiklet | 0.000 kg/km | km | Sıfır emisyon (insan gücü) |
| 11 | Walking | Yürüyüş | 0.000 kg/km | km | Sıfır emisyon (insan gücü) |
| 12 | Taxi/Rideshare | Taksi/Ride-share | 0.149 kg/km | km | IEA CO₂ Emissions from Transport 2023 |

#### Ulaşım Kaynak Detayları

**IPCC AR6 (2021-2022), Working Group III — Chapter 10: Transport**
- Tam adı: "Climate Change 2022: Mitigation of Climate Change"
- Yayıncı: Intergovernmental Panel on Climate Change
- Bölüm: Chapter 10 — Transport
- Tablo 10.1: Ulaşım araçlarının yolcu başına emisyon karşılaştırması
- Kullanılan veriler: Benzinli/dizel otomobil, motosiklet, yurtiçi/yurtdışı uçuş emisyon katsayıları
- Erişim: https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-10/

**IEA — CO₂ Emissions from Fuel Combustion (2023)**
- Tam adı: "CO₂ Emissions from Fuel Combustion — Highlights 2023"
- Yayıncı: International Energy Agency
- Bölüm: Transport section
- Kullanılan veriler: Şehir otobüsü, taksi, toplu taşıma yolcu başına emisyon değerleri
- Erişim: https://www.iea.org/data-and-statistics/data-product/co2-emissions-from-fuel-combustion

**IEA — Global EV Outlook (2023)**
- Tam adı: "Global EV Outlook 2023: Catching up with Climate Ambitions"
- Yayıncı: International Energy Agency
- Bölüm: Life-cycle analysis section
- Kullanılan veri: Elektrikli otomobil km başına emisyon (şebeke karışımı dahil)
- Not: 0.053 kg/km değeri küresel ortalama şebeke karbon yoğunluğuna göre hesaplanmıştır
- Erişim: https://www.iea.org/reports/global-ev-outlook-2023

---

### 2.2 ENERJİ (Energy) — 5 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Electricity (TR grid) | Elektrik (TR Şebekesi) | 0.420 kg/kWh | kWh | TEİAŞ + IEA Turkey 2023 |
| 2 | Natural gas | Doğalgaz | 2.034 kg/kg | kg | IPCC AR6, WG III, Chapter 6 |
| 3 | Coal heating | Kömür Isıtma | 2.860 kg/kg | kg | IPCC AR6, WG III, Chapter 6 |
| 4 | Solar energy | Güneş Enerjisi | 0.048 kg/kWh | kWh | IPCC AR6, WG III, Annex III |
| 5 | Air conditioning | Klima (1 saat) | 0.630 kg/saat | hour | IEA Cooling Report 2023 |

#### Enerji Kaynak Detayları

**Türkiye Elektrik Şebeke Emisyon Faktörü: 0.420 kg CO₂/kWh**

Bu değer Türkiye'nin elektrik üretim karışımından hesaplanmıştır:
- Kaynak 1: **TEİAŞ (Türkiye Elektrik İletim A.Ş.)** — Yıllık Elektrik Üretim İstatistikleri
  - Türkiye'nin elektrik üretim payları (yaklaşık):
    - Doğalgaz: ~%25
    - Kömür (linyit + ithal): ~%33
    - Hidroelektrik: ~%20
    - Rüzgar: ~%11
    - Güneş: ~%6
    - Diğer yenilenebilir: ~%5
  - Bu karışım ortalama şebeke emisyon faktörünü belirler
  - Erişim: https://www.teias.gov.tr

- Kaynak 2: **IEA — Turkey Energy Profile 2023**
  - Türkiye'nin enerji sektörü CO₂ emisyonları
  - Grid emission factor hesaplaması
  - Erişim: https://www.iea.org/countries/turkiye

**IPCC AR6, WG III — Chapter 6: Energy Systems**
- Doğalgaz yanma emisyon faktörü: 2.034 kg CO₂/kg (56.1 kg CO₂/GJ × 0.0363 GJ/kg)
- Kömür yanma emisyon faktörü: 2.860 kg CO₂/kg (94.6 kg CO₂/GJ × 0.0302 GJ/kg)
- Kaynak tablo: Table 6.2 — Default CO₂ emission factors for fuel combustion
- Erişim: https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-6/

**IPCC AR6, WG III — Annex III: Technology-specific cost and performance parameters**
- Güneş enerjisi yaşam döngüsü emisyonu: 0.048 kg CO₂e/kWh
- Bu değer panel üretimi, kurulum ve bertaraf dahil yaşam döngüsü analizidir
- Operasyonel emisyon: 0 (doğrudan emisyon yok)

---

### 2.3 BESLENME (Food) — 14 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Beef | Sığır Eti | 27.0 kg/kg | kg | Poore & Nemecek (2018), Science |
| 2 | Lamb/Mutton | Kuzu/Koyun Eti | 39.2 kg/kg | kg | Poore & Nemecek (2018), Science |
| 3 | Pork | Domuz Eti | 12.1 kg/kg | kg | Poore & Nemecek (2018), Science |
| 4 | Chicken | Tavuk | 6.9 kg/kg | kg | Poore & Nemecek (2018), Science |
| 5 | Fish | Balık | 6.1 kg/kg | kg | Poore & Nemecek (2018), Science |
| 6 | Eggs | Yumurta | 4.5 kg/kg | kg | Poore & Nemecek (2018), Science |
| 7 | Milk | Süt | 3.2 kg/L | litre | FAO GLEAM Model |
| 8 | Cheese | Peynir | 13.5 kg/kg | kg | Poore & Nemecek (2018), Science |
| 9 | Vegetables | Sebze | 2.0 kg/kg | kg | Our World in Data / IPCC |
| 10 | Fruits | Meyve | 1.1 kg/kg | kg | Our World in Data / IPCC |
| 11 | Rice | Pirinç | 4.5 kg/kg | kg | IPCC AR6, WG III, Chapter 7 |
| 12 | Bread/Wheat | Ekmek/Buğday | 1.4 kg/kg | kg | Our World in Data |
| 13 | Coffee | Kahve | 17.0 kg/kg | kg | Killian et al. (2013) |
| 14 | Tea | Çay | 3.3 kg/kg | kg | Azapagic et al. (2016) |

#### Beslenme Kaynak Detayları

**Poore & Nemecek (2018) — "Reducing food's environmental impacts through producers and consumers"**
- Yayın: Science, Vol. 360, Issue 6392, pp. 987-992 (1 Haziran 2018)
- DOI: 10.1126/science.aaq0216
- Bu çalışma, gıda emisyonları alanındaki en kapsamlı meta-analizdir
- 38,700 çiftlik ve 1,600 işleme tesisinden veri derlemiştir
- 119 ülkeden 40 farklı gıda ürününün yaşam döngüsü analizi
- Kullanılan veriler:
  - Sığır eti: 27.0 kg CO₂e/kg (çiftlikten tabağa, arazi kullanımı dahil)
  - Kuzu/koyun eti: 39.2 kg CO₂e/kg (metan emisyonları yüksek)
  - Domuz eti: 12.1 kg CO₂e/kg
  - Tavuk: 6.9 kg CO₂e/kg
  - Balık (çiftlik): 6.1 kg CO₂e/kg
  - Yumurta: 4.5 kg CO₂e/kg
  - Peynir: 13.5 kg CO₂e/kg (süt yoğunlaştırması nedeniyle yüksek)
- Kapsam: Arazi kullanımı değişikliği + çiftlik emisyonları + hayvan yemi + işleme + paketleme + nakliye + perakende

**FAO — GLEAM (Global Livestock Environmental Assessment Model)**
- Süt emisyon faktörü: 3.2 kg CO₂e/litre
- FAO'nun küresel hayvancılık çevresel değerlendirme modeli
- Kapsam: Yem üretimi, enterik fermantasyon, gübre yönetimi, enerji kullanımı, nakliye
- Erişim: https://www.fao.org/gleam/en/

**IPCC AR6, WG III — Chapter 7: Agriculture, Forestry and Other Land Use (AFOLU)**
- Pirinç emisyon faktörü: 4.5 kg CO₂e/kg
- Pirinç tarlalarından metan (CH₄) emisyonu özellikle yüksektir
- Su basma yöntemiyle yetiştirme anaerobik koşullar yaratarak metan üretir
- Erişim: https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-7/

**Our World in Data — "Environmental Impacts of Food Production"**
- Hannah Ritchie ve Max Roser tarafından derlenen geniş veri seti
- Sebze (2.0 kg/kg) ve meyve (1.1 kg/kg) değerleri buradaki ortalamalardır
- Ekmek/buğday (1.4 kg/kg) değeri de buradan alınmıştır
- Erişim: https://ourworldindata.org/environmental-impacts-of-food

---

### 2.4 ATIK (Waste) — 5 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Mixed waste | Karışık Atık | 0.587 kg/kg | kg | T.C. Çevre ve Şehircilik Bakanlığı |
| 2 | Organic waste | Organik Atık | 0.670 kg/kg | kg | IPCC AR6, WG III, Chapter 5 |
| 3 | Paper recycled | Kağıt Geri Dönüşümü | -0.900 kg/kg | kg | EPA WARM Model |
| 4 | Plastic recycled | Plastik Geri Dönüşümü | -0.500 kg/kg | kg | EPA WARM Model |
| 5 | Glass recycled | Cam Geri Dönüşümü | -0.314 kg/kg | kg | EPA WARM Model |

#### Atık Kaynak Detayları

**T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı**
- Karışık katı atık emisyon faktörü: 0.587 kg CO₂e/kg
- Kaynak: Türkiye Ulusal Sera Gazı Emisyon Envanteri Raporu
- Bu değer Türkiye'deki ortalama atık bertaraf yöntemlerini yansıtır:
  - Düzenli depolama (çoğunluk)
  - Yakma
  - Açık döküm (azalan)
- Erişim: https://csb.gov.tr ve https://cygm.csb.gov.tr

**IPCC AR6, WG III — Chapter 5: Demand, Services and Social Aspects of Mitigation**
- Organik atık emisyon faktörü: 0.670 kg CO₂e/kg
- Organik atıklar depolama alanlarında anaerobik koşullarda ayrışarak metan üretir
- Metan'ın sera etkisi CO₂'nin yaklaşık 28 katıdır (GWP100)

**EPA WARM Model (Waste Reduction Model)**
- Yayıncı: United States Environmental Protection Agency
- Tam adı: "WARM — Waste Reduction Model"
- Bu model geri dönüşümün emisyon tasarrufunu hesaplar
- **Negatif değerler**: Geri dönüşüm, ham madde üretimi yerine geçtiği için net emisyon **tasarrufu** sağlar
  - Kağıt geri dönüşümü: -0.900 kg CO₂e/kg (yeni kağıt üretimi yerine)
  - Plastik geri dönüşümü: -0.500 kg CO₂e/kg (yeni plastik üretimi yerine)
  - Cam geri dönüşümü: -0.314 kg CO₂e/kg (yeni cam üretimi yerine)
- Erişim: https://www.epa.gov/warm

**Negatif Emisyon Açıklaması:**
Geri dönüşüm faktörlerinin negatif olması, kullanıcının geri dönüşüm yaptığında toplam karbon ayak izinin **azalması** anlamına gelir. Bu, "kaçınılmış emisyon" (avoided emissions) kavramına dayanır — geri dönüşüm sayesinde yeni hammadde çıkarma ve işleme ihtiyacı ortadan kalkar.

---

### 2.5 SU (Water) — 5 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Tap water | Musluk Suyu | 0.000344 kg/L | litre | Water UK / Carbon Trust |
| 2 | Hot shower | Sıcak Duş (1 dk) | 0.025 kg/dk | minute | IEA + su ısıtma hesabı |
| 3 | Bottled water | Şişe Su (0.5L) | 0.053 kg/adet | piece | Pacific Institute |
| 4 | Dishwasher | Bulaşık Makinesi | 0.756 kg/çevrim | piece | Energy Saving Trust |
| 5 | Washing machine | Çamaşır Makinesi | 0.600 kg/çevrim | piece | Energy Saving Trust |

#### Su Kaynak Detayları

**Water UK / Carbon Trust**
- Musluk suyu emisyon faktörü: 0.000344 kg CO₂e/litre
- Bu değer suyun arıtılması, pompalanması ve dağıtılması için harcanan enerjiden kaynaklanır
- Kaynak: Carbon Trust — Water and carbon emissions assessment
- Erişim: https://www.carbontrust.com

**Sıcak Duş Hesaplaması:**
- 1 dakika duş ≈ 8-10 litre su
- Suyu 10°C'den 38°C'ye ısıtma enerjisi hesaplanır
- Doğalgaz/elektrik karışımı ile ısıtma varsayılır
- Sonuç: ≈ 0.025 kg CO₂e/dakika
- Kaynak bileşimi: IEA enerji tüketim verileri + su ısıtma fizik hesabı

**Pacific Institute — "Bottled Water and Energy"**
- Şişe su emisyon faktörü: 0.053 kg CO₂e/şişe (0.5L)
- Kapsam: PET plastik üretimi + şişeleme + soğutma + nakliye
- Plastik üretimi toplam emisyonun yaklaşık %30'unu oluşturur
- Erişim: https://pacinst.org

**Energy Saving Trust (UK)**
- Bulaşık makinesi: 0.756 kg CO₂e/çevrim (60°C yıkama)
- Çamaşır makinesi: 0.600 kg CO₂e/çevrim (40°C yıkama)
- Hesaplama: Çevrim başına elektrik tüketimi (kWh) × şebeke emisyon faktörü
- Bulaşık makinesi: ~1.8 kWh/çevrim × 0.420 kg/kWh ≈ 0.756
- Çamaşır makinesi: ~1.4 kWh/çevrim × 0.420 kg/kWh ≈ 0.600
- Not: Türkiye şebeke faktörü (0.420) ile çarpılmıştır
- Erişim: https://energysavingtrust.org.uk

---

### 2.6 DİJİTAL (Digital) — 8 Faktör

| # | Faktör | Türkçe Ad | CO₂/birim | Birim | Kaynak Detayı |
|---|--------|-----------|-----------|-------|---------------|
| 1 | Streaming video | Video İzleme (1 saat) | 0.036 kg/saat | hour | IEA / The Shift Project |
| 2 | Video call | Video Görüşme (1 saat) | 0.014 kg/saat | hour | Obringer et al. (2021) |
| 3 | Email | E-posta | 0.004 kg/adet | piece | Mike Berners-Lee (2010) |
| 4 | Web browsing | Web Gezintisi (1 saat) | 0.012 kg/saat | hour | IEA Digital Report |
| 5 | AI query | Yapay Zeka Sorgusu | 0.003 kg/adet | piece | IEA / Goldman Sachs Research |
| 6 | Cloud storage (GB) | Bulut Depolama (GB/ay) | 0.007 kg/GB | gb | IEA Data Centres Report |
| 7 | Social media | Sosyal Medya (1 saat) | 0.009 kg/saat | hour | Greenspector / The Shift Project |
| 8 | Cryptocurrency | Kripto Para İşlemi | 0.600 kg/adet | piece | Cambridge Bitcoin Electricity Index |

#### Dijital Kaynak Detayları

**IEA — "Data Centres and Data Transmission Networks" (2023)**
- Video streaming: 0.036 kg CO₂e/saat
- Web browsing: 0.012 kg CO₂e/saat
- Bulut depolama: 0.007 kg CO₂e/GB/ay
- Kapsam: Veri merkezi enerji tüketimi + ağ altyapısı + son kullanıcı cihaz payı
- Erişim: https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks

**The Shift Project — "Lean ICT: Towards Digital Sobriety" (2019)**
- Video streaming emisyonlarının detaylı analizi
- Dijital teknolojilerin küresel enerji tüketimindeki payı
- Streaming kalitesine göre emisyon farkı (SD vs HD vs 4K)
- 0.036 kg/saat değeri HD kalite streaming ortalamasıdır

**Obringer et al. (2021) — "The overlooked environmental footprint of increasing Internet use"**
- Yayın: Resources, Conservation and Recycling, Volume 167
- Video görüşme emisyon faktörü: 0.014 kg CO₂e/saat
- Zoom, Teams, Google Meet gibi platformların karşılaştırması
- Kapsam: Ağ trafiği + veri merkezi + kodlama/çözme enerji maliyeti

**Mike Berners-Lee (2010) — "How Bad Are Bananas?"**
- E-posta emisyon faktörü: 0.004 kg CO₂e/e-posta (normal e-posta)
- Ek dosyalı e-posta: ~0.050 kg CO₂e
- Spam e-posta: ~0.003 kg CO₂e
- 0.004 değeri ortalama bir metin e-postasını temsil eder

**IEA / Goldman Sachs Research — AI ve Veri Merkezi Enerji Raporu**
- Yapay zeka sorgusu: 0.003 kg CO₂e/sorgu
- Standart bir Google araması: ~0.0003 kg CO₂e
- Bir ChatGPT sorgusu: ~0.003 kg CO₂e (yaklaşık 10× Google araması)
- Bu fark, AI modellerinin çok daha fazla hesaplama gücü gerektirmesinden kaynaklanır

**Greenspector — Mobil Uygulama Enerji Tüketimi Çalışması**
- Sosyal medya: 0.009 kg CO₂e/saat
- TikTok, Instagram, Twitter/X, Facebook karşılaştırması
- Video ağırlıklı uygulamalar daha yüksek emisyona sahiptir

**Cambridge Bitcoin Electricity Consumption Index (CBECI)**
- Kripto para işlemi: 0.600 kg CO₂e/işlem
- Bitcoin ağı enerji tüketimi baz alınmıştır
- Bu değer Bitcoin proof-of-work konsensüs mekanizmasını yansıtır
- Ethereum (proof-of-stake geçişi sonrası) çok daha düşüktür (~0.003 kg)
- Erişim: https://ccaf.io/cbnsi/cbeci

---

## 3. REFERANS DEĞERLERİ (AI Modüllerinde Kullanılan)

### 3.1 Karbon DNA Referans Değerleri

AI modülünde (Karbon DNA) kullanıcının emisyon profilini normalize etmek için referans günlük değerler kullanılır:

```python
# backend/apps/ai_features/services.py, satır 12-15
REFERENCE_DAILY = {
    'transport': 2.5,   # kg CO₂/gün — Ortalama bir Türk vatandaşının günlük ulaşım emisyonu
    'energy':    1.2,   # kg CO₂/gün — Türkiye hane başı günlük enerji emisyonu
    'food':      3.0,   # kg CO₂/gün — Ortalama beslenme emisyonu
    'waste':     0.4,   # kg CO₂/gün — Günlük atık üretimi emisyonu
    'water':     0.1,   # kg CO₂/gün — Günlük su kullanım emisyonu
    'digital':   0.3,   # kg CO₂/gün — Günlük dijital kullanım emisyonu
}
# TOPLAM REFERANS: 7.5 kg CO₂/gün (~2.74 ton CO₂/yıl)
```

**Referans kaynakları:**
- Türkiye kişi başı yıllık CO₂ emisyonu: ~4.7 ton (IEA, 2023)
- Üniversite öğrenci yaş grubu genellikle ortalamanın altındadır
- 7.5 kg/gün × 365 = 2.74 ton/yıl (üniversite öğrenci ortalaması tahmini)
- Küresel ortalama: ~4.7 ton/yıl (Our World in Data)
- Türkiye ortalaması: ~4.7 ton/yıl (IEA Turkey Country Profile)

### 3.2 Karbon İkizi Senaryo Çarpanları

```python
# backend/apps/ai_features/services.py, satır 17-43
SCENARIOS = {
    'public_transport':   {'transport': 0.30},  # Ulaşımı %70 azalt
    'vegan_diet':         {'food': 0.45},       # Beslenmeyi %55 azalt
    'renewable_energy':   {'energy': 0.15},     # Enerjiyi %85 azalt
    'digital_minimalism': {'digital': 0.50},    # Dijitali %50 azalt
    'zero_waste':         {'waste': 0.20},      # Atığı %80 azalt
}
```

**Senaryo kaynakları:**
- **Toplu taşıma geçişi (%70 azalma)**: IPCC AR6 — Toplu taşıma, özel araç kullanımına göre kişi başı emisyonu %65-80 azaltır
- **Bitkisel beslenme (%55 azalma)**: Poore & Nemecek (2018) — Vegan diyet, karışık diyet emisyonlarını %50-60 azaltır
- **Yenilenebilir enerji (%85 azalma)**: IEA — Güneş/rüzgar enerjisi, fosil yakıtlara göre %80-95 daha az emisyon
- **Dijital minimalizm (%50 azalma)**: The Shift Project — Streaming ve sosyal medya azaltımı potansiyeli
- **Sıfır atık (%80 azalma)**: EPA — Geri dönüşüm ve kompost ile atık emisyonlarında %75-90 azalma

---

## 4. HESAPLAMA AKIŞI (End-to-End)

```
KULLANICI GİRİŞİ
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  AddEntryScreen (Frontend)                          │
│                                                      │
│  1. Kategori Seç  →  fetchCategories()              │
│     (Ulaşım, Enerji, Beslenme, Atık, Su, Dijital)  │
│                                                      │
│  2. Faktör Seç    →  fetchFactors(categorySlug)     │
│     (Otomobil Benzinli, Metro, Bisiklet...)         │
│                                                      │
│  3. Miktar Gir + Tarih                              │
│     Ön izleme: quantity × factor.co2_per_unit       │
│                                                      │
│  4. Kaydet        →  POST /emissions/entries/       │
│     { factor: 1, quantity: 10, date: "2026-03-05" } │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  EmissionEntrySerializer.create() (Backend)          │
│                                                      │
│  entry.co2_kg = 10 × 0.171 = 1.71 kg CO₂           │
│  entry.save()                                        │
│                                                      │
│  Response: { id, co2_kg: "1.7100", factor_name,     │
│              category_slug, date, ... }              │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Gamification Tetikleme (Arka Plan Thread)           │
│                                                      │
│  1. process_entry_rewards.delay(user_id, date)      │
│     → Celery görevine gönder                        │
│                                                      │
│  2. XP ekle (+10 XP)                                │
│  3. Streak güncelle                                 │
│  4. Badge kontrolü                                  │
│  5. Günlük hedef kontrolü (+50 XP bonus)            │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  TodaySummaryView (Günlük Özet)                     │
│                                                      │
│  GET /emissions/today/                              │
│                                                      │
│  Tüm günlük girişleri topla:                        │
│  total_co2 = SUM(entry.co2_kg for entries)          │
│                                                      │
│  Kategori bazlı dağılım:                            │
│  by_category = {                                    │
│    "transport": 1.71,                               │
│    "food": 2.34,                                    │
│    "energy": 0.84                                   │
│  }                                                  │
│                                                      │
│  Hedef karşılaştırma:                               │
│  goal_achieved = total_co2 <= daily_carbon_goal     │
│  remaining = max(0, goal - total_co2)               │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  Celery Beat — Gece Görevleri (Her gece 00:00)      │
│                                                      │
│  1. DailyEmissionSummary oluştur/güncelle           │
│     → Kategori bazlı CO₂ dağılımı kaydet           │
│                                                      │
│  2. WeeklySummary güncelle (Pazar gecesi)            │
│     → Haftalık toplam, trend, üniversite karşılaştırma│
│                                                      │
│  3. CarbonBudget güncelle (ay başı)                 │
│     → Aylık bütçe takibi                            │
│                                                      │
│  4. Streak kontrolü                                 │
│     → Giriş yapmayan kullanıcıların serisini sıfırla│
└─────────────────────────────────────────────────────┘
```

---

## 5. KAYNAK ÖZETİ (Tüm Kaynaklar)

### 5.1 Birincil Bilimsel Kaynaklar

| # | Kaynak | Yıl | Kullanım Alanı | Erişim |
|---|--------|-----|----------------|--------|
| 1 | IPCC AR6 WG III — Chapter 10: Transport | 2022 | Ulaşım emisyon faktörleri | ipcc.ch/report/ar6/wg3/ |
| 2 | IPCC AR6 WG III — Chapter 6: Energy Systems | 2022 | Enerji emisyon faktörleri | ipcc.ch/report/ar6/wg3/ |
| 3 | IPCC AR6 WG III — Chapter 7: AFOLU | 2022 | Pirinç, tarım emisyonları | ipcc.ch/report/ar6/wg3/ |
| 4 | IPCC AR6 WG III — Annex III | 2022 | Güneş enerjisi yaşam döngüsü | ipcc.ch/report/ar6/wg3/ |
| 5 | IEA — CO₂ Emissions from Fuel Combustion | 2023 | Ulaşım araçları emisyonları | iea.org |
| 6 | IEA — Global EV Outlook | 2023 | Elektrikli araç emisyonları | iea.org |
| 7 | IEA — Turkey Energy Profile | 2023 | Türkiye şebeke emisyon faktörü | iea.org/countries/turkiye |
| 8 | IEA — Data Centres Report | 2023 | Dijital emisyon faktörleri | iea.org |
| 9 | Poore & Nemecek — Science | 2018 | Gıda emisyon faktörleri | doi.org/10.1126/science.aaq0216 |
| 10 | FAO — GLEAM Model | 2023 | Süt emisyon faktörü | fao.org/gleam |

### 5.2 İkincil Kaynaklar

| # | Kaynak | Yıl | Kullanım Alanı |
|---|--------|-----|----------------|
| 11 | T.C. Çevre ve Şehircilik Bakanlığı | 2023 | Türkiye atık emisyonları |
| 12 | TEİAŞ | 2023 | Türkiye elektrik üretim karışımı |
| 13 | EPA WARM Model | 2023 | Geri dönüşüm emisyon tasarrufları |
| 14 | Our World in Data | 2023 | Sebze, meyve, buğday emisyonları |
| 15 | Carbon Trust | 2023 | Su arıtma/dağıtım emisyonları |
| 16 | Energy Saving Trust | 2023 | Ev aletleri enerji tüketimi |
| 17 | The Shift Project | 2019 | Dijital karbon ayak izi |
| 18 | Obringer et al. | 2021 | Video görüşme emisyonları |
| 19 | Mike Berners-Lee | 2010 | E-posta emisyonları |
| 20 | Cambridge (CBECI) | 2023 | Kripto para emisyonları |
| 21 | Pacific Institute | 2023 | Şişe su emisyonları |

---

## 6. ÖNEMLİ NOTLAR

### 6.1 Emisyon Faktörlerinin Sınırlamaları

1. **Ortalama değerler**: Faktörler küresel/ulusal ortalamalardır, yerel koşullar farklılık gösterebilir
2. **Yaşam döngüsü**: Gıda faktörleri çiftlikten tabağa tüm yaşam döngüsünü kapsar
3. **Türkiye spesifik**: Elektrik şebeke faktörü (0.420) Türkiye'ye özeldir
4. **CO₂ eşdeğeri**: Değerler CO₂e (CO₂ eşdeğeri) olarak verilmiştir — metan ve diğer sera gazları CO₂'ye dönüştürülmüştür
5. **Güncel tutma**: Emisyon faktörleri teknoloji ve enerji karışımı değiştikçe güncellenmesi gerekir

### 6.2 Negatif Emisyon Faktörleri

Geri dönüşüm faktörlerinde negatif değerler bulunur:
- Kağıt: -0.900 kg/kg
- Plastik: -0.500 kg/kg
- Cam: -0.314 kg/kg

Bu, kullanıcının geri dönüşüm yaptığında toplam emisyonunun azalmasını sağlar. "Kaçınılmış emisyon" (avoided emissions) prensibi uygulanır.

### 6.3 Varsayılan Günlük Hedef

Kullanıcının varsayılan günlük karbon hedefi **5.00 kg CO₂**'dir. Bu değer:
- Türkiye ortalamasının (~12.8 kg/gün) altında
- Üniversite öğrencisi yaşam tarzına uygun
- Kullanıcı tarafından profil ayarlarından değiştirilebilir

---

*Bu döküman, projenin kaynak kodundan ve kullanılan bilimsel referanslardan derlenmiştir.*
*Son güncelleme: Mart 2026*
