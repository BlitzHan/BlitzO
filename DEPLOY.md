# ⚡ BlitzO! — Sunucu Kurulum Rehberi

> Bu rehber, BlitzO! projesini kendi VPS sunucuna yükleyip online olarak oynaman için adım adım hazırlanmıştır.

---

## 📋 Ön Gereksinimler

- Ubuntu 20.04+ VPS sunucu
- Bir domain (örn: `senindomain.com`)
- SSH erişimi

> **Not:** Bu rehberdeki `blitzo.senindomain.com` ve `SUNUCU_IP` kısımlarını kendi bilgilerine göre değiştir.

---

## 1️⃣ Sunucuya Bağlan

```bash
ssh root@SUNUCU_IP
```

---

## 2️⃣ Gerekli Yazılımları Kur

```bash
# Sistem güncelle
apt update && apt upgrade -y

# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# PM2 (sürekli çalıştırma)
npm install -g pm2

# Nginx (reverse proxy)
apt install -y nginx

# SSL sertifikası
apt install -y certbot python3-certbot-nginx
```

Kontrol:
```bash
node -v   # v18.x.x olmalı
npm -v
pm2 -v
nginx -v
```

---

## 3️⃣ DNS Ayarı

Domain sağlayıcında (Cloudflare, GoDaddy, vs.) A kaydı ekle:

| Tip | Name | Value | TTL |
|-----|------|-------|-----|
| A | blitzo | SUNUCU_IP | 300 |

DNS yayılımı 5-30 dakika sürer. Kontrol:
```bash
nslookup blitzo.senindomain.com
```

---

## 4️⃣ Projeyi Sunucuya Yükle

```bash
# Dizin oluştur
mkdir -p /var/www/blitzo
cd /var/www/blitzo

# GitHub'dan çek
git clone https://github.com/BlitzHan/BlitzO.git .

# Bağımlılıkları yükle
cd server && npm install
cd ../client && npm install && npm run build
```

---

## 5️⃣ Backend'i Başlat

```bash
cd /var/www/blitzo/server
pm2 start index.js --name blitzo
pm2 startup
pm2 save
```

Kontrol:
```bash
pm2 status        # Çalışıyor mu?
pm2 logs blitzo   # Logları gör
```

---

## 6️⃣ Nginx Kurulumu

Konfigürasyon dosyası oluştur:

```bash
nano /etc/nginx/sites-available/blitzo
```

İçine yapıştır (`blitzo.senindomain.com` kısmını değiştir):

```nginx
server {
    listen 80;
    server_name blitzo.senindomain.com;

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
}
```

Aktif et:

```bash
ln -s /etc/nginx/sites-available/blitzo /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 7️⃣ SSL Sertifikası (HTTPS)

```bash
certbot --nginx -d blitzo.senindomain.com
```

- E-posta adresini gir
- Kuralları kabul et
- Otomatik yönlendirme sorusuna **2** (redirect) yaz

Sertifika otomatik yenilenir. Test:
```bash
certbot renew --dry-run
```

---

## 8️⃣ Güvenlik Duvarı

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

---

## ✅ Bitti!

Tarayıcıda **https://blitzo.senindomain.com** adresini aç.

---

## 🔄 Güncelleme Yapmak

```bash
cd /var/www/blitzo
git pull
cd client && npm install && npm run build
cd ../server && npm install
pm2 restart blitzo
```

---

## 🐛 Sorun Giderme

### Site açılmıyor
```bash
pm2 status            # Backend çalışıyor mu?
pm2 logs blitzo       # Hata var mı?
systemctl status nginx  # Nginx çalışıyor mu?
tail -f /var/log/nginx/error.log
```

### WebSocket bağlanmıyor
- Nginx config'inde `proxy_set_header Upgrade` ve `Connection "upgrade"` olduğundan emin ol
- Firewall 80/443 açık mı kontrol et

### Port 3000 dolu
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart blitzo
```

---

## 📞 Hızlı Komut Özeti

| İşlem | Komut |
|-------|-------|
| Başlat | `pm2 start /var/www/blitzo/server/index.js --name blitzo` |
| Durdur | `pm2 stop blitzo` |
| Yeniden başlat | `pm2 restart blitzo` |
| Loglar | `pm2 logs blitzo` |
| Güncelle | `cd /var/www/blitzo && git pull && cd client && npm run build && pm2 restart blitzo` |
| Nginx test | `nginx -t && systemctl reload nginx` |
| SSL yenile | `certbot renew` |
