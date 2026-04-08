# BlitzO! Proje Özeti (AI Bağlam Dosyası)

Bu dosya, yeni bir AI sohbeti başlatıldığında projenin mevcut durumunu, mimarisini ve son güncellemeleri hızlıca kavraman için hazırlanmıştır.

## 🎯 Proje Nedir?
**BlitzO!**, Node.js (Socket.IO) backend ve React (Vite) frontend kullanılarak geliştirilmiş, gerçek zamanlı, çok oyunculu, şimşek temalı bir online UNO oyunudur.

## 🛠️ Teknoloji Yığını
- **Frontend:** React 18, Vite, React Router DOM, Socket.IO Client, Vanilla CSS (Mobil öncelikli responsive tasarım).
- **Backend:** Node.js, Express, Socket.IO (Gerçek zamanlı oyun motoru).
- **Sunucu / Deploy:** Ubuntu VPS, Nginx, PM2, Git.

## 📁 Mimari ve Temel Dosyalar
- `server/index.js`: Socket.IO sunucusunu başlatır, client'tan gelen olayları (oda kurma, katılma, kart oynama) dinler ve `RoomManager` ile iletişim kurar.
- `server/game/Game.js`: Oyunun ana kurallarını, sıra takibini, kart oynama/çekme mantığını ve cezaları barındırır.
- `server/game/Deck.js`: 108 kartlık UNO destesini (renkler, numaralar, özel kartlar ve wild kartlar) oluşturur.
- `server/game/RoomManager.js`: Aktif odaları ve oyun oturumlarını yönetir.
- `client/src/context/SocketContext.jsx`: Frontend tarafındaki tüm socket olaylarını yönetir ve bileşenlere state olarak dağıtır.
- `client/src/pages/Game.jsx` & `Game.css`: Oyun ekranı. Kartların dizilimi, oynama işlemleri, rakiplerin elleri ve sıranın kimde olduğunu gösteren bildirimler burada yer alır.

## ✨ Güncel Durum ve Son Eklenen Özellikler (v1.2)
Son güncellemelerle birlikte projeye dahil edilen ve stabil çalışan temel özellikler şunlardır:

1. **Mobil Görünüm İyileştirmesi:** Mobilden oynayanlar için kartların grid yerine yatay eksende üst üste binerek dizildiği (overlapping fan layout) ve kaydırılabilir bir el (hand) tasarımı eklendi.
2. **Sıra Göstergesi (Turn Popup):** Oyun oynanırken sıra değiştiğinde ekranın ortasında belirip kaybolan büyük bir popup eklendi.
   - Sıra oyuncudaysa: `SIRA SENDE!`
   - Sıra rakipteyse: `SIRA: [OYUNCU_ADI]` mesajı çıkar.
3. **Çift Kart Çekme / Lag Koruması:** `Game.js` içerisine `hasDrawnThisTurn` mantığı eklendi. Oyuncular aynı el içinde bağlantı gecikmesi veya çift tıklama yüzünden yanlışlıkla birden fazla kez kart çekemez. Ayrıca oynanabilir kart çekip pas geçmek isteyenler desteye tekrar tıklayarak sırasını devredebilir.
4. **Sonsuz Döngü Koruması:** Elindeki kartları sıralarken `NaN` (örn. yeni çekilen ve rengi seçilmemiş Wild kartlar) dönmesi sonucu oyunun donmasına (Infinite Loop) neden olan `useMemo` içindeki sıralama bug'ı çözüldü.
5. **Arayüz:** "BlitzO!" logosunun sürekli yanıp sönmesi gibi dikkat dağıtan animasyonlar kaldırıldı. Projenin güncel UI versiyonu `v1.2` olarak ana sayfa ve oyun içi başlıklara eklendi.

## 🚀 Yeni Bir Göreve Başlarken Dikkat Edilecekler
- **Stil Kuralları:** Vanilla CSS kullanılmaktadır, Tailwind vb. framework'ler yoktur. Değişiklikleri `Game.css` gibi dosyalara doğrudan eklemelisin.
- **Güvenlik / Bug Önleme:** State'lere bağlı `useEffect` ve `useMemo` kullanımlarında (özellikle Socket.io üzerinden gelen verilerle tetiklenenlerde) sonsuz döngü (infinite loop) oluşmamasına azami dikkat et.
- **Deployment:** Uygulamanın en güncel halini sunucuya yayına almak için sunucu terminalinde `git pull` -> `npm run build` (client) -> `pm2 restart blitzo` akışı kullanılır.