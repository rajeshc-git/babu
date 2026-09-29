# 🛡️ Babu Memorial Sanctuary — Clash of Clans 3D Living Archive

> *"A life that touched so many hearts can never be forgotten. His physical journey concluded on March 6, 2026, but his love, gentle wisdom, and quiet strength shine eternally."*

An interactive **Clash of Clans GUI-inspired** 3D memorial sanctuary and living archive honoring **Shyamal Choudhury (Babu 1972 — 2026)**. Built with an optimized **Next.js frontend** and an ultra-lean, low-resource **Native Go (Golang) microservice backend**.

---

## ⚡ 1GB VPS & Low-Resource Architecture

This application was engineered specifically to run flawlessly on low-spec cloud VPS instances (e.g. **1 GB RAM & 1 GB Storage**):

| Service | Unique Port | Active RAM Usage | CPU Idle | Storage Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **babu-frontend** | `1430` | **~32 MB** | `0.00%` | Next.js Standalone Runner |
| **babu-backend** | `8530` | **~10 MB** | `0.00%` | Single compiled native Go binary |
| **Media Assets** | N/A | **0 MB Disk** | `0.00%` | **Direct GitHub Public CDN Stream** |
| **Total Stack** | `1430` & `8530` | **~43 MB Total** | `0.00%` | **>95% of 1GB VPS RAM remains free!** |

### ☁️ Zero-Disk GitHub Public Assets Engine
Instead of filling your server's storage with gigabytes of photos, audio recordings, and videos:
- The Go backend communicates directly with GitHub's Public REST API (`https://api.github.com/repos/rajeshc-git/babu/contents/Assets/...`).
- Audio files (including 100+ voice recordings of Babu) and photos stream directly via GitHub's high-speed global CDN (`raw.githubusercontent.com`).
- Eliminates media storage overhead completely from your VPS.

---

## 🐳 1-Command Docker Deployment

Deploy the entire stack with zero configuration:

```bash
docker compose up -d --build
```

- **Frontend App**: [http://localhost:1430](http://localhost:1430)
- **Go API & Telemetry**: [http://localhost:8530/api/health](http://localhost:8530/api/health)

To view real-time resource consumption on your server:
```bash
docker stats babu-frontend babu-backend
```

To stop containers:
```bash
docker compose down
```

---

## 🚀 Running Directly on Host (Without Docker)

You can also run both services directly with custom unique ports:

```bash
./start.sh
```

- Frontend runs on: `http://localhost:1430`
- Go Backend runs on: `http://localhost:8530`

---

## 🎮 Clash of Clans GUI & Feature Highlights

1. **Iconic 3D Bevel Buttons** (Exact replica of reference GUI):
   - **Orange Attack/Action Button**: 3D extruded cartoon button with gradient and drop shadow.
   - **Green Collect/Upgrade Button**: 3D lime-to-forest gradient button with bevel edge.
   - **Speech Bubble Button**: Opens Clan Tributes & Condolences Drawer.
   - **Info Gear Button**: Opens Sanctuary Codex & Town Hall 16 statistics.
2. **Resource HUD**:
   - **Purple Elixir Bar**: Rounded dark container, glass highlight, and 3D purple elixir droplet bulb.
   - **Green Life / Dark Elixir Bar**: Rounded progress bar with 3D green life droplet bulb.
   - **Stars of Honor Bar**: Golden coin & star tribute counter.
   - **Town Hall 16 Badge**: Level 16 star emblem with active sanctuary shield status.
3. **Interactive 3D Bookshelf & Drawer (Three.js)**:
   - Mahogany library shelves holding hardbound volumes across different eras of Babu's life.
   - Hovering or touching pulls a volume forward from the shelf with golden aura.
   - Clicking a book flies it into center screen and opens the antique tome.
   - Left Page: Archival portrait + real audio player for Babu's recorded voice with waveforms.
   - Right Page: Life wisdom narrative, memorable quotes, and live tribute actions (`+50 Elixir`, `Flame`, `Star`).
   - Adaptive 2.5D CSS Drawer Grid fallback toggle for older mobile devices.
4. **Web Audio Synthesizer**:
   - Zero-latency tactile sounds synthesized via Web Audio API: bouncy wooden clicks, bubbly elixir pops, gem chimes, and book slide swooshes.
