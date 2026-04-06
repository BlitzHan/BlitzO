# BlitzO! - Deploy Rehberi

## Genel Bakış
BlitzO! Node.js + Socket.io backend ve React + Vite frontend ile geliştirilmiş gerçek zamanlı bir online Uno oyunudur.

**Hedef URL:** `blitzo.yildirimyigit.com`

---

## 1. VPS Hazırlığı

### Sunucuya bağlan
```bash
ssh root@<VPS_IP>
```

### Sistem güncelleme
```bash
apt update && apt upgrade -y
```

### Node.js kurulumu (v18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node -v  # v18.x.x olmalı
npm -v
```

### PM2 kurulumu
```bash
npm install -g pm2
```

### Nginx kurulumu
```bash
apt install -y nginx
```

### SSL için Certbot
```bash
apt install -y certbot python3-certbot-nginx
```

---

## 2. DNS Ayarı

Domain sağlayıcınızda aşağıdaki A kaydını oluşturun:

```
Tip:    A
Name:   blitzo
Value:  <VPS_IP_ADRESINIZ>
TTL:    300
```

DNS yayılımı 5-30 dakika sürebilir. Kontrol:
```bash
nslookup blitzo.yildirimyigit.com
```

---

## 3. Uygulama Kurulumu

### Proje dizini oluştur
```bash
mkdir -p /var/www/blitzo
cd /var/www/blitzo
```

### Projeyi yükle (git veya SCP ile)
```bash
# Git ile
git clone <repo_url> /var/www/blitzo
cd /var/www/blitzo

# Veya SCP ile
scp -r /local/path/BlitzO/* root@<VPS_IP>:/var/www/blitzo/
```

### Frontend build
```bash
cd /var/www/blitzO/client
npm install
npm run build
```

### Backend bağımlılıkları
```bash
cd /var/www/blitzO/server
npm install
```

---

## 4. PM2 ile Uygulama Başlatma

```bash
cd /var/www/blitzO/server
pm2 start index.js --name blitzo
pm2 startup
pm2 save
```

### PM2 komutları
```bash
pm2 status          # Durum kontrol
pm2 logs blitzo     # Logları görüntüle
pm2 restart blitzo  # Yeniden başlat
pm2 stop blitzo     # Durdur
pm2 monit           # Kaynak kullanımı
```

---

## 5. Nginx Reverse Proxy

### Site konfigürasyonu oluştur
```bash
nano /etc/nginx/sites-available/blitzo
```

### Konfigürasyon içeriği
```nginx
server {
    listen 80;
    server_name blitzo.yildirimyigit.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Siteyi aktif et
```bash
ln -s /etc/nginx/sites-available/blitzo /etc/nginx/sites-enabled/blitzo
nginx -t
systemctl reload nginx
```

---

## 6. SSL Sertifikası (Let's Encrypt)

```bash
certbot --nginx -d blitzo.yildirimyigit.com
```

Sertifika otomatik yenilenir. Manuel test:
```bash
certbot renew --dry-run
```

---

## 7. Güvenlik Duvarı

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

---

## 8. Ortam Değişkenleri (Opsiyonel)

`/var/www/blitzO/server/.env`:
```
PORT=3000
NODE_ENV=production
```

Frontend `.env` dosyası (`client/.env`):
```
VITE_SERVER_URL=https://blitzo.yildirimyigit.com
```

---

## 9. Güncelleme/Deploy Sonrası

```bash
cd /var/www/blitzO
git pull  # veya yeni dosyaları yükle

cd client && npm install && npm run build
cd ../server && npm install

pm2 restart blitzo
```

---

## 10. Sorun Giderme

### Uygulama başlamıyor
```bash
pm2 logs blitzo --lines 100
```

### Nginx hata logları
```bash
tail -f /var/log/nginx/error.log
```

### WebSocket bağlantı sorunu
- Nginx config'inde `proxy_set_header Upgrade` ve `Connection "upgrade"` olduğundan emin olun
- Firewall 80/443 portlarının açık olduğunu kontrol edin
- Tarayıcı console'unda WebSocket hata mesajlarını kontrol edin

### Port zaten kullanımda
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart blitzo
```

---

## Hızlı Kurulum Scripti

```bash
#!/bin/bash
set -e

echo "⚡ BlitzO! Kurulum Başlıyor..."

apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

mkdir -p /var/www/blitzo
# Proje dosyalarını kopyala

cd /var/www/blitzo/client && npm install && npm run build
cd ../server && npm install

pm2 start index.js --name blitzo
pm2 startup
pm2 save

cat > /etc/nginx/sites-available/blitzo << 'EOF'
server {
    listen 80;
    server_name blitzo.yildirimyigit.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/blitzo /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ Kurulum tamamlandı!"
echo "🔒 SSL için: certbot --nginx -d blitzo.yildirimyigit.com"
```
