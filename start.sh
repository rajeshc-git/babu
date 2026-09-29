#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "🛡️ SHYAMAL CHOUDHURI MEMORIAL SANCTUARY - PRODUCTION"
echo "=========================================================="

export PATH="$HOME/.bun/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

# 1. Build & Start Production Go Microservice on Port 8530
echo "⚡ Starting Native Go Microservice in PRODUCTION mode on http://localhost:8530 ..."
cd backend
go build -ldflags="-s -w" -o babu-server main.go
PORT=8530 ./babu-server &
BACKEND_PID=$!
cd ..

# 2. Build & Start Production Next.js Frontend on Port 1430 using Bun (with npm fallback)
cd frontend
if command -v bun &> /dev/null; then
    BUN_VER=$(bun --version)
    echo "⚡ Using Bun (v$BUN_VER) for ultra-fast production build & start on http://localhost:1430 ..."
    bun install --frozen-lockfile 2>/dev/null || bun install
    bun run build
    NODE_ENV=production PORT=1430 bun run start -- -p 1430 &
    FRONTEND_PID=$!
else
    echo "🎮 Using npm for production build & start on http://localhost:1430 ..."
    npm install
    npm run build
    NODE_ENV=production PORT=1430 npm run start -- -p 1430 &
    FRONTEND_PID=$!
fi
cd ..

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM

echo "✅ Both servers running in 100% PRODUCTION mode!"
echo "   - Frontend UI: http://localhost:1430 (Production)"
echo "   - Go API:      http://localhost:8530/api/health (Go Production Binary)"
echo "Press Ctrl+C to stop both."

wait
