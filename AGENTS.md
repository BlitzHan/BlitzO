# BlitzO! - Online Uno Oyunu

## Proje Tanımı
**BlitzO!** — `blitzo.yildirimyigit.com` adresinde çalışan, gerçek zamanlı, 2-10 kişilik online Uno kart oyunu. Şimşek temalı kart tasarımı, oda sistemi, şifre koruması ve otomatik puanlama içerir.

## Teknoloji Stack
- **Backend:** Node.js + Express + Socket.io
- **Frontend:** React 18 + Vite + React Router
- **Deploy:** VPS + Nginx reverse proxy + PM2 + Cloudflare Origin Certificate (Full SSL)

## Proje Yapısı
```
BlitzO/
├── server/
│   ├── index.js              # Express + Socket.io server (port 3000)
│   ├── game/
│   │   ├── Deck.js           # 108 kartlık Uno destesi
│   │   ├── Game.js           # Oyun motoru (kurallar, sıra, puanlama)
│   │   └── RoomManager.js    # Oda yönetimi (oluştur/katıl/temizle)
│   └── package.json
├── client/
│   ├── src/
│   │   ├── App.jsx           # Router + SocketProvider
│   │   ├── context/SocketContext.jsx  # Socket.io React context
│   │   ├── pages/
│   │   │   ├── Home.jsx      # Oda oluştur / katıl
│   │   │   ├── Lobby.jsx     # Oda lobisi
│   │   │   ├── Game.jsx      # Oyun ekranı
│   │   │   └── Scoreboard.jsx # Skor tablosu
│   │   ├── components/
│   │   │   ├── Card.jsx      # Şimşek temalı Uno kartı
│   │   │   └── ColorPicker.jsx # Wild kart renk seçici
│   │   └── index.css         # Global stiller + animasyonlar
│   ├── vite.config.js
│   └── package.json
├── start.command             # Çift tıkla başlatma (macOS)
├── DEPLOY.md                 # VPS deploy rehberi
├── AGENTS.md                 # Bu dosya
└── .gitignore
```

## Oyun Kuralları
- **Oyuncu:** 2-10 kişi
- **Başlangıç:** 7 kart dağıtılır
- **UNO cezası:** Son kartta UNO demezse 2 kart ceza — sıradaki oyuncu "CEZA VER" butonuna basarak uygular. Kimse fark etmezse cezasız devam.
- **Stacking:** YOK (official rules) — Draw2/WildDraw4 gelince mecburen çeker
- **Puanlama:** Number = yüz değeri, Special = 20, Wild = 50 → Kazananın skoruna eklenir
- **Oda süresi:** 30dk hareketsizlikte otomatik silinir
- **Draw2/WildDraw4:** Önce hedef oyuncu kartları çeker, sonra sırası atlanır

## Socket.io Events
| Client → Server | Server → Client |
|---|---|
| `createRoom` | `roomCreated` |
| `joinRoom` | `roomJoined`, `playerJoined` |
| `startGame` | `gameStarted`, `yourHand` |
| `playCard` | `cardPlayed`, `updateHand` |
| `drawCard` | `cardDrawn` |
| `callUno` | `unoCalled` |
| `penalizeUno` | `unoPenalized` |
| `startNewRound` | `gameStarted` (yeni el) |
| `leaveRoom` | `playerLeft`, `gameEnded` |
| `disconnect` | `playerLeft`, `gameEnded` |

## Önemli Detaylar
- **Socket bağlantısı:** `io('/')` — Vite proxy üzerinden bağlanır (LAN'da da çalışır)
- **Sıra göstergesi:** Header'da büyük "SIRA: [isim]" + opponent kartlarında "Şimdi Oynuyor" badge'i
- **Kart sıralaması:** Renk (Kırmızı→Mavi→Yeşil→Sarı→Wild) + tip (sayı→özel→wild) + değer
- **Kart çekme:** `isDrawing` state'i ile 1200ms debounce. `cardDrawn` event'inde `drawnCard` direkt hand'e eklenir (anında görünür). Animasyon efekti (shake + fly + ripple)
- **UNO ceza:** `pendingUnoPenalty` state'i server'da tutulur, sıradaki oyuncu `penalizeUno` event'i ile uygular. Kart oynama/çekme cezayı sıfırlamaz, sadece butonla uygulanır.
- **Draw4 cezası:** Önce hedef oyuncu 4 kart çeker, sonra sırası atlanır
- **Navigasyon:** BlitzO! logosu ve "Ana Sayfa" butonu ana sayfaya yönlendirir (`useNavigate`)

## Mobil Responsive
- Kartlar `flex-wrap` ile otomatik satırlara bölünür
- `.hand-row` + `flex-shrink: 1` ile kartlar ekrana sığar
- 768px altında: kartlar 50x75px, 480px altında: 44x66px
- `overflow: visible` ile kartlar taşmaz, wrap olur

## Geliştirme
```bash
# Başlatma (macOS çift tıklama)
./start.command

# Manuel
cd server && npm run dev    # Backend: localhost:3000
cd client && npm run dev    # Frontend: localhost:5173

# Build
cd client && npm run build  # dist/ klasörüne çıktı
```

## Deploy
Detaylar: `DEPLOY.md`
- DNS: `blitzo.yildirimyigit.com` → A record → `<VPS_IP>` (Cloudflare proxied)
- Nginx: WebSocket upgrade desteği ile reverse proxy
- SSL: Cloudflare Origin Certificate (Full mode)
- Sunucu: `ssh root@<VPS_IP>`
- Deploy path: `/var/www/blitzo`
