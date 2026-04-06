#!/bin/bash
# ============================================
# BlitzO! - Sunucu Kurulum Scripti
# Ubuntu 20.04+ için
# ============================================

echo "⚡ BlitzO! Sunucu Kurulumu Başlıyor..."
echo ""

# --------------------------------------------
# 1. Sistem Güncelleme
# --------------------------------------------
echo "📦 Sistem güncelleniyor..."
apt update && apt upgrade -y

# --------------------------------------------
# 2. Gerekli Araçları Kur
# --------------------------------------------
echo "🔧 Gerekli araçlar kuruluyor..."
apt install -y curl git

# --------------------------------------------
# 3. Node.js 18 Kurulumu
# --------------------------------------------
echo "🟢 Node.js 18 kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo "✅ Node.js sürümü: $(node -v)"
echo "✅ npm sürümü: $(npm -v)"

# --------------------------------------------
# 4. PM2 Kurulumu
# --------------------------------------------
echo "🚀 PM2 kuruluyor..."
npm install -g pm2

# --------------------------------------------
# 5. Nginx Kurulumu
# --------------------------------------------
echo "🌐 Nginx kuruluyor..."
apt install -y nginx

# --------------------------------------------
# 6. Certbot (SSL) Kurulumu
# --------------------------------------------
echo "🔒 Certbot kuruluyor..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "✅ Temel kurulum tamamlandı!"
echo ""
echo "Şimdi şu adımları takip et:"
echo ""
echo "1. DNS ayarını yap (domain sağlayıcında A kaydı ekle)"
echo "2. Projeyi yükle:"
echo "   mkdir -p /var/www/blitzo"
echo "   cd /var/www/blitzo"
echo "   git clone https://github.com/BlitzHan/BlitzO.git ."
echo "   cd server && npm install"
echo "   cd ../client && npm install && npm run build"
echo ""
echo "3. Backend başlat:"
echo "   cd /var/www/blitzo/server"
echo "   pm2 start index.js --name blitzo"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo "4. Nginx ayarla (DEPLOY.md dosyasına bak)"
echo ""
echo "5. SSL kur:"
echo "   certbot --nginx -d blitzo.senindomain.com"
