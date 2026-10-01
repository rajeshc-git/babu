# ==============================================================================
# All-In-One Production Dockerfile for Shyamal Choudhuri Memorial Sanctuary
# Includes: Native Go Microservice + Bun Next.js Standalone Production Server
# Total RAM footprint: ~58MB | Architecture: linux/amd64
# ==============================================================================

# --- Stage 1: Build Native Go Backend Binary ---
FROM golang:alpine AS go-builder
WORKDIR /backend
RUN apk --no-cache add git
COPY backend/go.mod ./
RUN go mod download || true
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /backend/babu-server main.go

# --- Stage 2: Install Node/Bun Dependencies ---
FROM oven/bun:1.4.2-alpine AS bun-deps
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* frontend/bun.lockb* frontend/bun.lock* ./
RUN bun install --frozen-lockfile || bun install

# --- Stage 3: Build Next.js Production Standalone Frontend ---
FROM oven/bun:1.4.2-alpine AS frontend-builder
WORKDIR /frontend
COPY --from=bun-deps /frontend/node_modules ./node_modules
COPY frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=1430

RUN bun run build

# --- Stage 4: Ultra-Lean Production Runner ---
FROM oven/bun:1.4.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=1430 \
    BACKEND_PORT=8530 \
    BACKEND_URL=http://127.0.0.1:8530 \
    HOSTNAME="0.0.0.0"

# 1. Copy Go Backend Binary and Static Data
COPY --from=go-builder /backend/babu-server /app/babu-server
COPY --from=go-builder /backend/data /app/data

# 2. Copy Next.js Standalone Production Server & Public Assets
COPY --from=frontend-builder /frontend/public /app/public
COPY --from=frontend-builder /frontend/.next/standalone /app/
COPY --from=frontend-builder /frontend/.next/static /app/.next/static

# 3. Copy Assets directly into the container
COPY Assets /app/Assets
COPY Assets /app/public/Assets

# 3. Create lightweight entrypoint launcher
RUN printf '#!/bin/sh\n\
echo "⚡ Starting Native Go Microservice on port 8530..."\n\
PORT=8530 /app/babu-server &\n\
GO_PID=$!\n\
echo "🎮 Starting Next.js Production UI on port 1430..."\n\
bun run /app/server.js &\n\
BUN_PID=$!\n\
trap "kill -TERM $GO_PID $BUN_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM\n\
wait\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 1430

CMD ["/app/entrypoint.sh"]
