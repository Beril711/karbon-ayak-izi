"""
python manage.py seed_emission_factors

Tüm temel emisyon kategorilerini ve faktörlerini veritabanına ekler.
Kaynak: IPCC 2021, IEA 2023, Türkiye ÇEVRE ve ŞEHİRCİLİK Bakanlığı verilerine dayalı.
"""
from django.core.management.base import BaseCommand
from apps.emissions.models import EmissionCategory, EmissionFactor


CATEGORIES = [
    {'slug': 'transport', 'name': 'Transport',  'name_tr': 'Ulaşım',        'icon': '🚗', 'color': '#FF9800', 'order': 1},
    {'slug': 'energy',    'name': 'Energy',     'name_tr': 'Enerji',         'icon': '⚡', 'color': '#FFEE58', 'order': 2},
    {'slug': 'food',      'name': 'Food',       'name_tr': 'Beslenme',       'icon': '🍽️', 'color': '#66BB6A', 'order': 3},
    {'slug': 'waste',     'name': 'Waste',      'name_tr': 'Atık',           'icon': '♻️', 'color': '#26A69A', 'order': 4},
    {'slug': 'water',     'name': 'Water',      'name_tr': 'Su',             'icon': '💧', 'color': '#42A5F5', 'order': 5},
    {'slug': 'digital',   'name': 'Digital',    'name_tr': 'Dijital',        'icon': '💻', 'color': '#AB47BC', 'order': 6},
]

FACTORS = {
    'transport': [
        {'name': 'Car (petrol)',      'name_tr': 'Otomobil (Benzinli)',    'co2_per_unit': 0.171,   'unit': 'km'},
        {'name': 'Car (diesel)',      'name_tr': 'Otomobil (Dizel)',       'co2_per_unit': 0.168,   'unit': 'km'},
        {'name': 'Car (electric)',    'name_tr': 'Otomobil (Elektrikli)',  'co2_per_unit': 0.053,   'unit': 'km'},
        {'name': 'Motorcycle',        'name_tr': 'Motosiklet',             'co2_per_unit': 0.114,   'unit': 'km'},
        {'name': 'City bus',          'name_tr': 'Şehir Otobüsü',         'co2_per_unit': 0.089,   'unit': 'km'},
        {'name': 'Metro/Subway',      'name_tr': 'Metro',                  'co2_per_unit': 0.028,   'unit': 'km'},
        {'name': 'Train',             'name_tr': 'Tren',                   'co2_per_unit': 0.041,   'unit': 'km'},
        {'name': 'Domestic flight',   'name_tr': 'Yurtiçi Uçuş',          'co2_per_unit': 0.255,   'unit': 'km'},
        {'name': 'International flight','name_tr':'Yurtdışı Uçuş',        'co2_per_unit': 0.195,   'unit': 'km'},
        {'name': 'Bicycle',           'name_tr': 'Bisiklet',               'co2_per_unit': 0.0,     'unit': 'km'},
        {'name': 'Walking',           'name_tr': 'Yürüyüş',               'co2_per_unit': 0.0,     'unit': 'km'},
        {'name': 'Taxi/Rideshare',    'name_tr': 'Taksi/Ride-share',       'co2_per_unit': 0.149,   'unit': 'km'},
    ],
    'energy': [
        {'name': 'Electricity (TR grid)', 'name_tr': 'Elektrik (TR Şebekesi)', 'co2_per_unit': 0.420, 'unit': 'kWh'},
        {'name': 'Natural gas',           'name_tr': 'Doğalgaz',               'co2_per_unit': 2.034, 'unit': 'kg'},
        {'name': 'Coal heating',          'name_tr': 'Kömür Isıtma',           'co2_per_unit': 2.860, 'unit': 'kg'},
        {'name': 'Solar energy',          'name_tr': 'Güneş Enerjisi',         'co2_per_unit': 0.048, 'unit': 'kWh'},
        {'name': 'Air conditioning',      'name_tr': 'Klima (1 saat)',          'co2_per_unit': 0.630, 'unit': 'hour'},
    ],
    'food': [
        {'name': 'Beef',              'name_tr': 'Sığır Eti',              'co2_per_unit': 27.0,  'unit': 'kg'},
        {'name': 'Lamb/Mutton',       'name_tr': 'Kuzu/Koyun Eti',        'co2_per_unit': 39.2,  'unit': 'kg'},
        {'name': 'Pork',              'name_tr': 'Domuz Eti',              'co2_per_unit': 12.1,  'unit': 'kg'},
        {'name': 'Chicken',           'name_tr': 'Tavuk',                  'co2_per_unit': 6.9,   'unit': 'kg'},
        {'name': 'Fish',              'name_tr': 'Balık',                  'co2_per_unit': 6.1,   'unit': 'kg'},
        {'name': 'Eggs',              'name_tr': 'Yumurta',                'co2_per_unit': 4.5,   'unit': 'kg'},
        {'name': 'Milk',              'name_tr': 'Süt',                    'co2_per_unit': 3.2,   'unit': 'litre'},
        {'name': 'Cheese',            'name_tr': 'Peynir',                 'co2_per_unit': 13.5,  'unit': 'kg'},
        {'name': 'Vegetables',        'name_tr': 'Sebze',                  'co2_per_unit': 2.0,   'unit': 'kg'},
        {'name': 'Fruits',            'name_tr': 'Meyve',                  'co2_per_unit': 1.1,   'unit': 'kg'},
        {'name': 'Rice',              'name_tr': 'Pirinç',                 'co2_per_unit': 4.5,   'unit': 'kg'},
        {'name': 'Bread/Wheat',       'name_tr': 'Ekmek/Buğday',          'co2_per_unit': 1.4,   'unit': 'kg'},
        {'name': 'Coffee',            'name_tr': 'Kahve',                  'co2_per_unit': 17.0,  'unit': 'kg'},
        {'name': 'Tea',               'name_tr': 'Çay',                    'co2_per_unit': 3.3,   'unit': 'kg'},
    ],
    'waste': [
        {'name': 'Mixed waste',       'name_tr': 'Karışık Atık',           'co2_per_unit': 0.587, 'unit': 'kg'},
        {'name': 'Organic waste',     'name_tr': 'Organik Atık',           'co2_per_unit': 0.670, 'unit': 'kg'},
        {'name': 'Paper recycled',    'name_tr': 'Kağıt Geri Dönüşümü',   'co2_per_unit': -0.900,'unit': 'kg'},
        {'name': 'Plastic recycled',  'name_tr': 'Plastik Geri Dönüşümü', 'co2_per_unit': -0.500,'unit': 'kg'},
        {'name': 'Glass recycled',    'name_tr': 'Cam Geri Dönüşümü',     'co2_per_unit': -0.314,'unit': 'kg'},
    ],
    'water': [
        {'name': 'Tap water',         'name_tr': 'Musluk Suyu',            'co2_per_unit': 0.000344, 'unit': 'litre'},
        {'name': 'Hot shower',        'name_tr': 'Sıcak Duş (1 dk)',      'co2_per_unit': 0.025,    'unit': 'minute'},
        {'name': 'Bottled water',     'name_tr': 'Şişe Su (0.5L)',        'co2_per_unit': 0.053,    'unit': 'piece'},
        {'name': 'Dishwasher',        'name_tr': 'Bulaşık Makinesi',      'co2_per_unit': 0.756,    'unit': 'piece'},
        {'name': 'Washing machine',   'name_tr': 'Çamaşır Makinesi',      'co2_per_unit': 0.600,    'unit': 'piece'},
    ],
    'digital': [
        {'name': 'Streaming video',   'name_tr': 'Video İzleme (1 saat)', 'co2_per_unit': 0.036,  'unit': 'hour'},
        {'name': 'Video call',        'name_tr': 'Video Görüşme (1 saat)','co2_per_unit': 0.014,  'unit': 'hour'},
        {'name': 'Email',             'name_tr': 'E-posta',               'co2_per_unit': 0.004,  'unit': 'piece'},
        {'name': 'Web browsing',      'name_tr': 'Web Gezintisi (1 saat)','co2_per_unit': 0.012,  'unit': 'hour'},
        {'name': 'AI query',          'name_tr': 'Yapay Zeka Sorgusu',    'co2_per_unit': 0.003,  'unit': 'piece'},
        {'name': 'Cloud storage (GB)','name_tr': 'Bulut Depolama (GB/ay)','co2_per_unit': 0.007,  'unit': 'gb'},
        {'name': 'Social media',      'name_tr': 'Sosyal Medya (1 saat)', 'co2_per_unit': 0.009,  'unit': 'hour'},
        {'name': 'Cryptocurrency',    'name_tr': 'Kripto Para İşlemi',    'co2_per_unit': 0.600,  'unit': 'piece'},
    ],
}


class Command(BaseCommand):
    help = 'Temel emisyon faktörlerini veritabanına ekler'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Emisyon faktörleri yükleniyor...\n')

        # Kategoriler
        cat_map = {}
        for cat_data in CATEGORIES:
            cat, created = EmissionCategory.objects.update_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            cat_map[cat_data['slug']] = cat
            status = '✅ Oluşturuldu' if created else '🔄 Güncellendi'
            self.stdout.write(f'  {status}: {cat.name_tr}')

        # Faktörler
        total = 0
        for slug, factors in FACTORS.items():
            cat = cat_map[slug]
            for f in factors:
                EmissionFactor.objects.update_or_create(
                    category=cat, name=f['name'],
                    defaults={
                        'name_tr':      f['name_tr'],
                        'co2_per_unit': f['co2_per_unit'],
                        'unit':         f['unit'],
                        'source':       'IPCC AR6, IEA 2023, Çevre Bakanlığı TR',
                    }
                )
                total += 1

        self.stdout.write(self.style.SUCCESS(f'\n✅ Toplam {total} emisyon faktörü yüklendi!'))
