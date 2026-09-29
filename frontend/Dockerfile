# Multi-stage Dockerfile for Next.js Frontend using Bun
# Ultra-fast builds & lean runtime footprint

FROM oven/bun:1.4.2-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* bun.lockb* bun.lock* ./
RUN bun install --frozen-lockfile || bun install

FROM oven/bun:1.4.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=1430

RUN bun run build

FROM oven/bun:1.4.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=1430 \
    HOSTNAME="0.0.0.0"

# Copy standalone Next.js server & static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 1430

CMD ["bun", "run", "server.js"]
