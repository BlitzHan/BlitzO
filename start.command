#!/bin/bash

echo "⚡ BlitzO! Başlatılıyor..."
echo ""

PROJECT_DIR="/Users/yildirimcitys/Desktop/BlitzO"

lsof -i :3000 -t 2>/dev/null | xargs kill -9 2>/dev/null
lsof -i :5173 -t 2>/dev/null | xargs kill -9 2>/dev/null

echo "📦 Backend başlatılıyor (port: 3000)..."
cd "$PROJECT_DIR/server" && node index.js &

sleep 2

echo "🎨 Frontend başlatılıyor (port: 5173)..."
cd "$PROJECT_DIR/client" && npm run dev &

sleep 3

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "bilinmiyor")

echo ""
echo "✅ BlitzO! çalışıyor!"
echo ""
echo "🌐 Bu bilgisayarda: http://localhost:5173"
echo "🌐 Diğer cihazlardan: http://$LOCAL_IP:5173"
echo ""
echo "Durdurmak için: Ctrl+C veya pencereyi kapat"
echo "---"

wait
