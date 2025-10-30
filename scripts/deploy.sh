#!/bin/bash

echo "🔨 Building hybrid app (static frontend + Node.js API)..."

# Build với hybrid mode
npm run build

echo "📦 Build completed!"

echo "🚀 To deploy:"
echo "1. Upload folder '.output' lên hosting"
echo "2. Chạy: node .output/server/index.mjs"
echo "3. Truy cập domain của bạn"

echo "📁 Structure after build:"
echo "- .output/public/ : Static files (HTML, CSS, JS)"
echo "- .output/server/ : Node.js API server"
echo ""
echo "⚠️  Remember to upload database files to server/db/"