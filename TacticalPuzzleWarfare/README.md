# Rün Savaşları (Rune Warfare)

Karanlık fantazi temalı, taktiksel bir "eşleştir-3" (match-3) mobil RPG'si.
Expo + React Native ile yazıldı, Expo Go üzerinden doğrudan oynanabilir.

Bu proje, ekli Stitch tasarım taslağındaki görsel dili (obsidyen/pirinç
karanlık fantazi arayüzü, 5 elementli rün sistemi, kahraman/loncalar,
sefer haritası, mağaza, kasa ve görev ekranları) temel alıp bunun üzerine
**gerçekten oynanabilir, uçtan uca bir oyun döngüsü** kurar:

- 6x7'lik gerçek bir eşleştir-3 tahtası (satır/sütun kırıcı, 3x3 alan
  bombası, prizma/gökkuşağı taşı gibi özel taşlar ve komboları dahil)
- 5 elementli rün sistemi (Ateş, Kutsal, Doğa, Demir, Gölge) ve
  üstünlük/zayıflık ilişkileri
- 10 farklı kahraman, her biri kendi yeteneği ve rolüyle (tank, mage,
  support, rogue, warrior)
- Kahraman seviyelendirme, kırıntı toplama, tek ekipman/kalıntı slotu
- 5 bölüm x 6 sefer = 30 sefer içeren bir kampanya haritası, her bölümün
  kendi patronu
- Enerji sistemi, altın/elmas ekonomisi, günlük/haftalık görevler
- Bronz/Gümüş/Altın/Kadim Mühür kasaları ve ödül açma ekranı
- Kalıcı ilerleme (AsyncStorage ile cihazda saklanır)

> Not: Mağazadaki "satın alma" butonları gerçek bir ödeme başlatmaz —
> bu çevrimdışı, tek oyunculu bir demo oyundur ve anında sanal para ekler.

## Çalıştırma

```bash
npm install
npx expo start
```

Terminaldeki QR kodu telefonunuzda **Expo Go** uygulamasıyla okutun
(iOS/Android). Aynı Wi-Fi ağında olduğunuzdan emin olun.

Diğer komutlar:

```bash
npx tsc --noEmit     # TypeScript tip kontrolü
npx expo-doctor      # bağımlılık/konfigürasyon kontrolü
```

## Proje Yapısı

```
src/
  app/            expo-router ekranları (dosya tabanlı yönlendirme)
    (tabs)/       Sefer, Kahramanlar, Mağaza, Görevler, Profil sekmeleri
    battle/       Savaş ekranı (eşleştir-3 + patron dövüşü)
    victory/      Zafer / Yenilgi ekranı
    hero/         Kahraman detay ve donatma ekranı
    chest/        Kasa açma / ödül ekranı
  components/     Yeniden kullanılabilir arayüz bileşenleri
    battle/       Savaş tahtası, rün taşı, kahraman yetenek slotu
  data/           Statik oyun verisi (kahramanlar, seferler, ekipman, ...)
  game/           Saf, framework'ten bağımsız eşleştir-3 motoru ve savaş mantığı
  store/          Zustand + AsyncStorage ile kalıcı oyun durumu
  theme/          Renk paleti, tipografi, görsel varlıklar
assets/images/    Orijinal Stitch tasarımından alınan gerçek sanat eserleri
```

## Notlar

- Görsel sanat eserlerinin bir kısmı (uygulama simgesi, komutan portresi,
  kasa görselleri, rün ikonları, efsanevi kalıntı kartları) orijinal
  Stitch tasarım paketinden alınmıştır.
- Oyun dengesi (hasar, altın/elmas miktarları, XP eğrisi) makul bir
  ilerleme hissi için ayarlanmıştır; sert bir ekonomi optimizasyonu
  hedeflenmemiştir.
