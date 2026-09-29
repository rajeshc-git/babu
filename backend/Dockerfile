# Multi-stage ultra-lightweight Dockerfile for Go Microservice
# Optimized for 1GB RAM / 1GB Disk Linux VPS

FROM golang:alpine AS builder
WORKDIR /app

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod ./
RUN go mod download

COPY main.go ./
COPY data/ ./data/

# Compile static binary stripped of debug symbols (-s -w) for smallest size (<15MB)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o babu-server main.go

# Production scratch/alpine container
FROM alpine:latest
WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata curl

COPY --from=builder /app/babu-server /app/babu-server
COPY --from=builder /app/data /app/data

ENV PORT=8530 \
    GITHUB_REPO=rajeshc-git/babu \
    GITHUB_BRANCH=main

EXPOSE 8530

HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8530/api/health || exit 1

CMD ["/app/babu-server"]
