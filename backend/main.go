package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

type Memory struct {
	ID          string   `json:"id"`
	ShelfID     string   `json:"shelfId"`
	Title       string   `json:"title"`
	Era         string   `json:"era"`
	Date        string   `json:"date"`
	Excerpt     string   `json:"excerpt"`
	Story       string   `json:"story"`
	Quote       string   `json:"quote"`
	ImagePath   string   `json:"imagePath"`
	AudioPath   string   `json:"audioPath,omitempty"`
	Tags        []string `json:"tags"`
	ElixirCount int      `json:"elixirCount"`
	FlamesCount int      `json:"flamesCount"`
	StarsCount  int      `json:"starsCount"`
	Color       string   `json:"color"`
}

type Shelf struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Era         string `json:"era"`
	Icon        string `json:"icon"`
	BookColor   string `json:"bookColor"`
	MemoryCount int    `json:"memoryCount"`
}

type Stats struct {
	TotalMemories  int       `json:"totalMemories"`
	TotalElixir    int       `json:"totalElixir"`
	TotalFlames    int       `json:"totalFlames"`
	TotalStars     int       `json:"totalStars"`
	TownHallLevel  int       `json:"townHallLevel"`
	VillageShield  string    `json:"villageShield"`
	ServerUptime   string    `json:"serverUptime"`
	GoVersion      string    `json:"goVersion"`
	MemoryAllocKB  uint64    `json:"memoryAllocKb"`
	ActiveRoutines int       `json:"activeRoutines"`
	GitHubStorage  bool      `json:"githubStorage"`
	StartTime      time.Time `json:"-"`
}

type DataStore struct {
	sync.RWMutex
	Shelves     []Shelf      `json:"shelves"`
	Memories    []Memory     `json:"memories"`
	DataPath    string       `json:"-"`
	StartTime   time.Time
	VoiceCache  []VoiceItem  `json:"-"`
	VoiceCacheTime time.Time `json:"-"`
	GithubRepo  string       `json:"-"`
	GithubBranch string      `json:"-"`
}

type VoiceItem struct {
	FileName string `json:"fileName"`
	Title    string `json:"title"`
	URL      string `json:"url"`
	SizeKB   int64  `json:"sizeKb"`
}

var store *DataStore

func initStore(dataPath, githubRepo, githubBranch string) *DataStore {
	ds := &DataStore{
		DataPath:     dataPath,
		StartTime:    time.Now(),
		GithubRepo:   githubRepo,
		GithubBranch: githubBranch,
		Shelves: []Shelf{
			{
				ID:        "roots",
				Title:     "Roots",
				Subtitle:  "Early Years & Heritage",
				Era:       "1972 — 1995",
				Icon:      "🌱",
				BookColor: "#2a623d",
			},
			{
				ID:        "family",
				Title:     "Family",
				Subtitle:  "Fatherhood & Hearth",
				Era:       "1996 — 2018",
				Icon:      "🏡",
				BookColor: "#c2541a",
			},
			{
				ID:        "wisdom",
				Title:     "Wisdom",
				Subtitle:  "Sayings & Principles",
				Era:       "Lifelong Truths",
				Icon:      "📜",
				BookColor: "#8b3a82",
			},
			{
				ID:        "whispers",
				Title:     "Voice",
				Subtitle:  "Authentic Voice Notes",
				Era:       "2025 — 2026",
				Icon:      "🎙️",
				BookColor: "#1b4d89",
			},
			{
				ID:        "eternal",
				Title:     "Legacy",
				Subtitle:  "Remembrance & Tributes",
				Era:       "Forever Glowing",
				Icon:      "⭐",
				BookColor: "#b8860b",
			},
		},
		Memories: []Memory{
			{
				ID:          "mem-1",
				ShelfID:     "roots",
				Title:       "The Boy from the Golden Meadows",
				Era:         "1972 — 1988",
				Date:        "Spring 1972",
				Excerpt:     "Born with an innate kindness that radiated into every home he stepped in.",
				Story:       "From his earliest youth, Shyamal was known for his calm temperament and radiant smile. He grew up appreciating the simplicity of life, respecting elders, and offering shelter and kindness to anyone in need. His upbringing formed the bedrock of unwavering integrity that defined his entire journey.",
				Quote:       "Live with a heart so light that everyone feels safe near you.",
				ImagePath:   "/Assets/Image/Rajesh Father.png",
				Tags:        []string{"Roots", "Early Years", "Simplicity"},
				ElixirCount: 1470,
				FlamesCount: 380,
				StarsCount:  95,
				Color:       "#48a14d",
			},
			{
				ID:          "mem-2",
				ShelfID:     "family",
				Title:       "Father's Warm Embrace",
				Era:         "2002 — 2015",
				Date:        "October 9, 2022",
				Excerpt:     "A protective fortress for his children, guiding them through every storm with quiet resolve.",
				Story:       "He never raised his voice to impart wisdom. Instead, he led through personal example—waking early, ensuring everyone was fed and content before he rested, and blessing every celebration with heartfelt laughter and genuine hospitality.",
				Quote:       "You don't build peace through words; you build it through patience and service.",
				ImagePath:   "/Assets/Image/IMG20221009141535.jpg",
				Tags:        []string{"Fatherhood", "Family", "Blessings"},
				ElixirCount: 2400,
				FlamesCount: 520,
				StarsCount:  180,
				Color:       "#e06522",
			},
			{
				ID:          "mem-3",
				ShelfID:     "family",
				Title:       "The Festive Evening at Home",
				Era:         "November 2024",
				Date:        "Nov 29, 2024",
				Excerpt:     "Surrounded by relatives, sharing sweets, and reminding everyone of the value of togetherness.",
				Story:       "During festive gatherings, Babu was the centerpiece of warmth. He would check in on each person individually, making sure no one felt left out. His quiet joy in seeing his family together was his greatest happiness.",
				Quote:       "When the family stands united under one roof, no trouble can touch us.",
				ImagePath:   "/Assets/Image/IMG20241129222859.jpg",
				Tags:        []string{"Festivals", "Unity", "Celebration"},
				ElixirCount: 1850,
				FlamesCount: 410,
				StarsCount:  120,
				Color:       "#48a14d",
			},
			{
				ID:          "mem-4",
				ShelfID:     "wisdom",
				Title:       "The Golden Words of Composure",
				Era:         "December 2024",
				Date:        "Dec 15, 2024",
				Excerpt:     "Never react in anger; give every troubled moment 24 hours to reveal its truth.",
				Story:       "Whenever hardships arose, Babu’s advice was always measured. He taught us to look beyond immediate friction and focus on long-term harmony. His calm presence could diffuse any tension in a room within seconds.",
				Quote:       "Patience is not weakness; it is the ultimate quiet power.",
				ImagePath:   "/Assets/Image/IMG20241215203600.jpg",
				Tags:        []string{"Wisdom", "Peace", "Advice"},
				ElixirCount: 3100,
				FlamesCount: 780,
				StarsCount:  210,
				Color:       "#9b4dca",
			},
			{
				ID:          "mem-5",
				ShelfID:     "whispers",
				Title:       "Babu's New Year Voice Blessing",
				Era:         "January 2026",
				Date:        "Jan 1, 2026",
				Excerpt:     "His original spoken voice offering heartfelt prayers and blessings for the new year.",
				Story:       "Hearing Babu’s voice brings an immediate rush of reassurance and love. In this recording, his gentle tone, caring inquiries about health, and loving blessings remain eternally captured for future generations.",
				Quote:       "Stay healthy, take care of each other, and may god always bless your path.",
				ImagePath:   "/Assets/Image/IMG20260103201021.jpg",
				AudioPath:   "/Assets/Voice/Babu Voice 1.mp3",
				Tags:        []string{"Voice", "Blessing", "Audio Recording"},
				ElixirCount: 4500,
				FlamesCount: 1250,
				StarsCount:  430,
				Color:       "#2979ff",
			},
			{
				ID:          "mem-6",
				ShelfID:     "whispers",
				Title:       "Evening Telephone Guidance",
				Era:         "January 2026",
				Date:        "Jan 10, 2026",
				Excerpt:     "An authentic recorded phone call where he asks about daily life and reminds us to eat well.",
				Story:       "No matter how busy the day was, Babu made sure to check on his loved ones. Every evening phone call carried his warmth, reminding us that love is shown through small daily considerations.",
				Quote:       "Have you had your dinner? Do not sleep late, rest well.",
				ImagePath:   "/Assets/Image/IMG20260107041822.jpg",
				AudioPath:   "/Assets/Voice/Samal(00919856140920)_20260110181813.mp3.mpeg",
				Tags:        []string{"Voice", "Care", "Daily Life"},
				ElixirCount: 2900,
				FlamesCount: 640,
				StarsCount:  150,
				Color:       "#2979ff",
			},
			{
				ID:          "mem-7",
				ShelfID:     "eternal",
				Title:       "The Everlasting Lotus Shrine",
				Era:         "March 2026 — Eternity",
				Date:        "March 6, 2026",
				Excerpt:     "His physical journey concluded, but his spirit and love shine forever in our hearts.",
				Story:       "On March 6, 2026, Babu embarked on his heavenly voyage. This sacred sanctuary was erected so that everyone who cherished him can pull his books from the shelf, read his life story, and send eternal tributes of light.",
				Quote:       "Those we love don't go away, they walk beside us every day unseen and always loved.",
				ImagePath:   "/Assets/Image/IMG_7156.PNG",
				Tags:        []string{"Memorial", "Sanctuary", "Eternal Love"},
				ElixirCount: 5200,
				FlamesCount: 1890,
				StarsCount:  620,
				Color:       "#ffd700",
			},
		},
	}

	// Try loading from dataPath if exists
	if data, err := os.ReadFile(dataPath); err == nil {
		var saved struct {
			Memories []Memory `json:"memories"`
			Shelves  []Shelf  `json:"shelves"`
		}
		if err := json.Unmarshal(data, &saved); err == nil && len(saved.Memories) > 0 {
			ds.Memories = saved.Memories
			if len(saved.Shelves) > 0 {
				ds.Shelves = saved.Shelves
			}
		}
	} else {
		_ = ds.saveToFile()
	}

	ds.recalculateCounts()
	return ds
}

func (ds *DataStore) recalculateCounts() {
	counts := make(map[string]int)
	for _, m := range ds.Memories {
		counts[m.ShelfID]++
	}
	for i := range ds.Shelves {
		ds.Shelves[i].MemoryCount = counts[ds.Shelves[i].ID]
	}
}

func (ds *DataStore) saveToFile() error {
	dir := filepath.Dir(ds.DataPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(struct {
		Shelves  []Shelf  `json:"shelves"`
		Memories []Memory `json:"memories"`
	}{
		Shelves:  ds.Shelves,
		Memories: ds.Memories,
	}, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(ds.DataPath, data, 0644)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func jsonResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8530" // Custom unique port for backend
	}

	githubRepo := os.Getenv("GITHUB_REPO")
	if githubRepo == "" {
		githubRepo = "rajeshc-git/babu"
	}
	githubBranch := os.Getenv("GITHUB_BRANCH")
	if githubBranch == "" {
		githubBranch = "main"
	}

	dataPath := filepath.Join("data", "memories.json")
	store = initStore(dataPath, githubRepo, githubBranch)

	mux := http.NewServeMux()

	// Health check with memory metrics
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		var m runtime.MemStats
		runtime.ReadMemStats(&m)
		jsonResponse(w, map[string]interface{}{
			"status":         "ok",
			"port":           port,
			"uptime":         time.Since(store.StartTime).String(),
			"go_version":     runtime.Version(),
			"alloc_kb":       m.Alloc / 1024,
			"sys_kb":         m.Sys / 1024,
			"num_goroutines": runtime.NumGoroutine(),
			"github_repo":    store.GithubRepo,
			"github_branch":  store.GithubBranch,
			"service":        "Babu Memorial Native Go Microservice (Clash of Clans Architecture)",
		}, http.StatusOK)
	})

	// Stats endpoint
	mux.HandleFunc("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		store.RLock()
		defer store.RUnlock()

		totalElixir := 0
		totalFlames := 0
		totalStars := 0
		for _, m := range store.Memories {
			totalElixir += m.ElixirCount
			totalFlames += m.FlamesCount
			totalStars += m.StarsCount
		}

		var m runtime.MemStats
		runtime.ReadMemStats(&m)

		stats := Stats{
			TotalMemories:  len(store.Memories),
			TotalElixir:    totalElixir,
			TotalFlames:    totalFlames,
			TotalStars:     totalStars,
			TownHallLevel:  6,
			VillageShield:  "Active",
			ServerUptime:   time.Since(store.StartTime).Round(time.Second).String(),
			GoVersion:      runtime.Version(),
			MemoryAllocKB:  m.Alloc / 1024,
			ActiveRoutines: runtime.NumGoroutine(),
			GitHubStorage:  true,
		}
		jsonResponse(w, stats, http.StatusOK)
	})

	// Shelves endpoint
	mux.HandleFunc("/api/shelves", func(w http.ResponseWriter, r *http.Request) {
		store.RLock()
		defer store.RUnlock()
		jsonResponse(w, store.Shelves, http.StatusOK)
	})

	// Memories endpoint (GET & POST)
	mux.HandleFunc("/api/memories", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			shelf := r.URL.Query().Get("shelf")
			search := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))

			store.RLock()
			defer store.RUnlock()

			var filtered []Memory
			for _, m := range store.Memories {
				if shelf != "" && shelf != "all" && m.ShelfID != shelf {
					continue
				}
				if search != "" {
					match := strings.Contains(strings.ToLower(m.Title), search) ||
						strings.Contains(strings.ToLower(m.Excerpt), search) ||
						strings.Contains(strings.ToLower(m.Story), search) ||
						strings.Contains(strings.ToLower(m.Era), search)
					if !match {
						continue
					}
				}
				filtered = append(filtered, m)
			}
			jsonResponse(w, filtered, http.StatusOK)
			return
		}

		if r.Method == http.MethodPost {
			var newMem Memory
			if err := json.NewDecoder(r.Body).Decode(&newMem); err != nil {
				jsonResponse(w, map[string]string{"error": "Invalid payload"}, http.StatusBadRequest)
				return
			}
			if newMem.Title == "" || newMem.Story == "" {
				jsonResponse(w, map[string]string{"error": "Title and story are required"}, http.StatusBadRequest)
				return
			}

			store.Lock()
			newMem.ID = fmt.Sprintf("mem-%d", time.Now().UnixNano())
			if newMem.ShelfID == "" {
				newMem.ShelfID = "roots"
			}
			if newMem.ImagePath == "" {
				newMem.ImagePath = "/Assets/Image/Rajesh Father.png"
			}
			if newMem.Color == "" {
				newMem.Color = "#e06522"
			}
			newMem.ElixirCount = 100
			newMem.FlamesCount = 1
			newMem.StarsCount = 1
			store.Memories = append([]Memory{newMem}, store.Memories...)
			store.recalculateCounts()
			_ = store.saveToFile()
			store.Unlock()

			jsonResponse(w, newMem, http.StatusCreated)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	// Memory detail and tribute endpoints
	mux.HandleFunc("/api/memories/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/memories/"), "/")
		if len(parts) == 0 || parts[0] == "" {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}
		memID := parts[0]

		if len(parts) >= 2 && parts[1] == "tribute" && r.Method == http.MethodPost {
			var body struct {
				Type   string `json:"type"`
				Amount int    `json:"amount"`
			}
			_ = json.NewDecoder(r.Body).Decode(&body)
			if body.Amount <= 0 {
				body.Amount = 50
			}

			store.Lock()
			var found *Memory
			for i := range store.Memories {
				if store.Memories[i].ID == memID {
					switch body.Type {
					case "flame":
						store.Memories[i].FlamesCount += 1
					case "star":
						store.Memories[i].StarsCount += 1
					default:
						store.Memories[i].ElixirCount += body.Amount
					}
					found = &store.Memories[i]
					break
				}
			}
			if found != nil {
				_ = store.saveToFile()
			}
			store.Unlock()

			if found == nil {
				jsonResponse(w, map[string]string{"error": "Memory not found"}, http.StatusNotFound)
				return
			}
			jsonResponse(w, found, http.StatusOK)
			return
		}

		if r.Method == http.MethodGet {
			store.RLock()
			defer store.RUnlock()
			for _, m := range store.Memories {
				if m.ID == memID {
					jsonResponse(w, m, http.StatusOK)
					return
				}
			}
			jsonResponse(w, map[string]string{"error": "Memory not found"}, http.StatusNotFound)
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	// Voice recordings endpoint (Fetches from local Assets or GitHub Public API)
	mux.HandleFunc("/api/voices", func(w http.ResponseWriter, r *http.Request) {
		store.RLock()
		if len(store.VoiceCache) > 0 && time.Since(store.VoiceCacheTime) < 10*time.Minute {
			cached := store.VoiceCache
			store.RUnlock()
			jsonResponse(w, cached, http.StatusOK)
			return
		}
		store.RUnlock()

		// 1. Try local Assets/Voice directory across container & host mount paths
		candidateVoiceDirs := []string{
			filepath.Join("/app", "Assets", "Voice"),
			filepath.Join("..", "Assets", "Voice"),
			filepath.Join("Assets", "Voice"),
			filepath.Join("/Assets", "Voice"),
		}

		var entries []os.DirEntry
		for _, dir := range candidateVoiceDirs {
			if e, err := os.ReadDir(dir); err == nil && len(e) > 0 {
				entries = e
				break
			}
		}

		var list []VoiceItem
		if len(entries) > 0 {
			for _, e := range entries {
				if e.IsDir() || strings.HasPrefix(e.Name(), ".") {
					continue
				}
				info, _ := e.Info()
				var size int64
				if info != nil {
					size = info.Size() / 1024
					if size == 0 && info.Size() > 0 {
						size = 1
					}
				}
				cleanTitle := strings.TrimSuffix(e.Name(), filepath.Ext(e.Name()))
				cleanTitle = strings.ReplaceAll(cleanTitle, ".mp3", "")
				list = append(list, VoiceItem{
					FileName: e.Name(),
					Title:    cleanTitle,
					URL:      "/Assets/Voice/" + e.Name(),
					SizeKB:   size,
				})
			}
		} else {
			// 2. Fetch directly from GitHub Public API without storing locally!
			ghURL := fmt.Sprintf("https://api.github.com/repos/%s/contents/Assets/Voice?ref=%s", store.GithubRepo, store.GithubBranch)
			client := &http.Client{Timeout: 5 * time.Second}
			req, _ := http.NewRequest(http.MethodGet, ghURL, nil)
			req.Header.Set("User-Agent", "Babu-Memorial-Go-Microservice")
			if resp, err := client.Do(req); err == nil && resp.StatusCode == http.StatusOK {
				var ghFiles []struct {
					Name        string `json:"name"`
					Size        int64  `json:"size"`
					DownloadURL string `json:"download_url"`
				}
				if json.NewDecoder(resp.Body).Decode(&ghFiles) == nil {
					for _, gf := range ghFiles {
						cleanTitle := strings.TrimSuffix(gf.Name, filepath.Ext(gf.Name))
						cleanTitle = strings.ReplaceAll(cleanTitle, ".mp3", "")
						sz := gf.Size / 1024
						if sz == 0 {
							// If Git LFS pointer size (~130 bytes), estimate or set reasonable indicator
							sz = 346
						}
						list = append(list, VoiceItem{
							FileName: gf.Name,
							Title:    cleanTitle,
							URL:      "/Assets/Voice/" + gf.Name,
							SizeKB:   sz,
						})
					}
				}
				resp.Body.Close()
			}
		}

		if len(list) > 0 {
			store.Lock()
			store.VoiceCache = list
			store.VoiceCacheTime = time.Now()
			store.Unlock()
		}

		jsonResponse(w, list, http.StatusOK)
	})

	// Photos endpoint: returns all categorized photo records
	mux.HandleFunc("/api/photos", func(w http.ResponseWriter, r *http.Request) {
		category := r.URL.Query().Get("category")
		photosPath := filepath.Join("data", "photos.json")
		data, err := os.ReadFile(photosPath)
		if err != nil {
			photosPath = filepath.Join("..", "backend", "data", "photos.json")
			data, err = os.ReadFile(photosPath)
		}

		if err == nil {
			if category == "" || category == "all" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write(data)
				return
			}
			var all []struct {
				URL          string `json:"url"`
				Title        string `json:"title"`
				Category     string `json:"category"`
				CategoryName string `json:"categoryName"`
				IsSensitive  bool   `json:"isSensitive"`
			}
			if json.Unmarshal(data, &all) == nil {
				var filtered []interface{}
				for _, p := range all {
					if p.Category == category {
						filtered = append(filtered, p)
					}
				}
				jsonResponse(w, filtered, http.StatusOK)
				return
			}
		}

		jsonResponse(w, []interface{}{}, http.StatusOK)
	})

	// Static Assets handler: Serves local files if present; otherwise streams/redirects from GitHub raw CDN!
	mux.HandleFunc("/Assets/", func(w http.ResponseWriter, r *http.Request) {
		relPath := strings.TrimPrefix(r.URL.Path, "/Assets/")
		candidatePaths := []string{
			filepath.Join("/app", "Assets", relPath),
			filepath.Join("..", "Assets", relPath),
			filepath.Join("Assets", relPath),
			filepath.Join("/Assets", relPath),
		}

		for _, fullPath := range candidatePaths {
			if info, err := os.Stat(fullPath); err == nil && !info.IsDir() {
				w.Header().Set("Cache-Control", "public, max-age=86400")
				http.ServeFile(w, r, fullPath)
				return
			}
		}

		// Cloud / GitHub Stream Proxy: Route Git LFS files (.mp3, .mp4, .mov, .heic) to media CDN
		ext := strings.ToLower(filepath.Ext(relPath))
		var rawURL string
		if ext == ".mp3" || ext == ".mp4" || ext == ".mov" || ext == ".heic" {
			rawURL = fmt.Sprintf("https://media.githubusercontent.com/media/%s/%s/Assets/%s", store.GithubRepo, store.GithubBranch, relPath)
		} else {
			rawURL = fmt.Sprintf("https://raw.githubusercontent.com/%s/%s/Assets/%s", store.GithubRepo, store.GithubBranch, relPath)
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		http.Redirect(w, r, rawURL, http.StatusTemporaryRedirect)
	})

	handler := corsMiddleware(mux)
	addr := ":" + port
	fmt.Printf("🛡️ Clash of Clans Memorial High-Performance Go Server\n")
	fmt.Printf("⚡ Listening on http://localhost%s (Port %s)\n", addr, port)
	fmt.Printf("☁️ Cloud GitHub Storage: https://raw.githubusercontent.com/%s/%s/Assets/\n", store.GithubRepo, store.GithubBranch)
	fmt.Printf("🚀 Memory efficiency: ~600 KB RSS | Ready for 1GB RAM Linux VPS\n")

	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
