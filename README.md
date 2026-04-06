# ⚡ BlitzO!

> Gerçek zamanlı, çok oyunculu online kart oyunu.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black.svg)](https://socket.io/)

---

## 🎮 Özellikler

- **Oda Sistemi** — Oda oluştur, şifre kor, arkadaşlarını davet et
- **2-10 Oyuncu** — Geniş oyuncu desteği
- **Gerçek Zamanlı** — Socket.io ile anlık oyun akışı
- **Şimşek Temalı Tasarım** — Altın ve koyu tonlarda göz alıcı arayüz
- **Otomatik Puanlama** — Her el sonunda puanlar otomatik hesaplanır
- **LAN Desteği** — Aynı ağda olan cihazlar kolayca bağlanabilir
- **Responsive** — Mobil ve masaüstü uyumlu

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- npm

### Kurulum

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### Çalıştırma

```bash
# macOS — çift tıkla
./start.command

# Manuel
cd server && npm run dev    # Backend: localhost:3000
cd client && npm run dev    # Frontend: localhost:5173
```

Tarayıcıda **http://localhost:5173** adresini aç.

---

## 🛠 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | Node.js, Express, Socket.IO |
| Frontend | React 18, Vite, React Router |
| Deploy | VPS, Nginx, PM2, Let's Encrypt |

---

## 🎯 Oyun Akışı

1. **Oda Oluştur** — Bir isim ve şifre belirle
2. **Arkadaşlarını Davet Et** — 6 haneli oda kodunu paylaş
3. **Oyun Başlasın** — En az 2 oyuncu hazır olduğunda başlat
4. **Kartlarını Oyna** — Renk veya sayı eşleştirerek kartlarını bitir
5. **Puanları Topla** — Her el sonunda kalan kartların puanı kazananın hanesine yazılır

---

## 📁 Proje Yapısı

```
BlitzO/
├── server/
│   ├── index.js              # Express + Socket.IO
│   ├── game/
│   │   ├── Deck.js           # 108 kartlık deste
│   │   ├── Game.js           # Oyun motoru
│   │   └── RoomManager.js    # Oda yönetimi
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/            # Home, Lobby, Game, Scoreboard
│   │   ├── components/       # Card, ColorPicker
│   │   └── context/          # SocketContext
│   └── package.json
├── start.command             # macOS başlatıcı
├── DEPLOY.md                 # Deploy rehberi
└── README.md
```

---

## 🌐 Deploy

Detaylı rehber için **DEPLOY.md** dosyasına bak.

```bash
# Kısaca
cd client && npm run build
cd ../server && npm install
pm2 start index.js --name blitzo
```

**Nginx** WebSocket upgrade desteği ile reverse proxy olarak yapılandırılmalı.  
**SSL** için Let's Encrypt kullan.

---

## 📜 Lisans

MIT

---

<p align="center">
  ⚡ BlitzO! — Kartlarını oyna, şimşek gibi çak!
</p>
