"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { playCoCClick } from "@/lib/sound";
import {
  Film,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Search,
  Clapperboard,
  Sparkles,
  ListVideo,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface CinemaFilm {
  id: string;
  title: string;
  year?: string;
  size: string;
  url: string;
  category: string;
  description: string;
  poster?: string;
  themeGradient: string;
  icon: string;
  accentColor: string;
}

export const CINEMA_FILMS: CinemaFilm[] = [
  {
    id: "memorial-legacy",
    title: "Babu: A Life of Gentle Smiles & Eternal Legacy",
    year: "Memorial",
    size: "Local Video",
    url: "/Assets/Video/WhatsApp Video 2026-03-14 at 3.45.57 PM.mp4",
    category: "Sacred Memorial",
    description: "Archival family video footage capturing the enduring spirit, warmth, and laughter of Shyamal Choudhuri.",
    poster: "/Assets/Image/Rajesh Father.png",
    themeGradient: "linear-gradient(135deg, #ffd700 0%, #d97706 50%, #78350f 100%)",
    icon: "🕊️",
    accentColor: "#ffd700",
  },
  {
    id: "3idiots",
    title: "3 Idiots",
    year: "2009",
    size: "2.0 GB",
    url: "https://cinekwok.com/films/india/3idiots.mp4",
    category: "Classic Cinema",
    description: "Two friends search for their long lost companion who inspired them to think differently.",
    themeGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0c4a6e 100%)",
    icon: "🎓",
    accentColor: "#38bdf8",
  },
  {
    id: "jab-tak-hai-jaan",
    title: "Jab Tak Hai Jaan",
    year: "2012",
    size: "2.2 GB",
    url: "https://cinekwok.com/films/india/Jab-Tak-Hai-Jaan2012.mp4",
    category: "Romance & Drama",
    description: "An army bomb disposal expert encounters love and fate across London and Kashmir.",
    themeGradient: "linear-gradient(135deg, #e11d48 0%, #be123c 50%, #881337 100%)",
    icon: "❤️",
    accentColor: "#fb7185",
  },
  {
    id: "manikarnika",
    title: "Manikarnika: The Queen of Jhansi",
    year: "2019",
    size: "1.5 GB",
    url: "https://cinekwok.com/films/india/Manikarnika%20The%20Queen%20of%20Jhansi2019.mp4",
    category: "Historical Epic",
    description: "The story of Rani Lakshmibai, one of the leading figures of the Indian Rebellion of 1857.",
    themeGradient: "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #7c2d12 100%)",
    icon: "⚔️",
    accentColor: "#fb923c",
  },
  {
    id: "sui-dhaaga",
    title: "Sui Dhaaga: Made in India",
    year: "2018",
    size: "446 MB",
    url: "https://cinekwok.com/films/india/Sui%20Dhaaga%20%20Made%20in%20India.mp4",
    category: "Inspirational Drama",
    description: "A heartwarming journey of a small-town couple finding self-reliance through tailoring.",
    themeGradient: "linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #312e81 100%)",
    icon: "🧵",
    accentColor: "#818cf8",
  },
  {
    id: "bajirao-mastani",
    title: "Bajirao Mastani",
    year: "2015",
    size: "1.3 GB",
    url: "https://cinekwok.com/films/india/bajiraomastani2015.mp4",
    category: "Historical Romance",
    description: "The epic tale of the Maratha Peshwa Bajirao and his second wife, warrior princess Mastani.",
    themeGradient: "linear-gradient(135deg, #ca8a04 0%, #a16207 50%, #713f12 100%)",
    icon: "👑",
    accentColor: "#facc15",
  },
  {
    id: "bombay-talkies",
    title: "Bombay Talkies",
    year: "2013",
    size: "1.0 GB",
    url: "https://cinekwok.com/films/india/bombaytalkies2013.mp4",
    category: "Anthology",
    description: "An anthology celebrating 100 years of Indian cinema directed by four visionary filmmakers.",
    themeGradient: "linear-gradient(135deg, #9333ea 0%, #7e22ce 50%, #581c87 100%)",
    icon: "🎞️",
    accentColor: "#c084fc",
  },
  {
    id: "dangal",
    title: "Dangal",
    year: "2016",
    size: "729 MB",
    url: "https://cinekwok.com/films/india/dangal2016.mp4",
    category: "Biographical Sports",
    description: "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita for Commonwealth Gold.",
    themeGradient: "linear-gradient(135deg, #d97706 0%, #b45309 50%, #78350f 100%)",
    icon: "🤼",
    accentColor: "#fbbf24",
  },
  {
    id: "ev-2012",
    title: "English Vinglish",
    year: "2012",
    size: "621 MB",
    url: "https://cinekwok.com/films/india/ev2012.mp4",
    category: "Heartwarming Drama",
    description: "A quiet, sweet-tempered housewife enrolls in an English-speaking course to gain self-respect.",
    themeGradient: "linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)",
    icon: "☕",
    accentColor: "#34d399",
  },
  {
    id: "hindi-medium",
    title: "Hindi Medium",
    year: "2017",
    size: "1.5 GB",
    url: "https://cinekwok.com/films/india/hindi%20%20medium2017.mp4",
    category: "Social Comedy",
    description: "A couple struggles to get their daughter admitted into an English-medium private school.",
    themeGradient: "linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)",
    icon: "📚",
    accentColor: "#4ade80",
  },
  {
    id: "india-add-oil",
    title: "India Add Oil",
    year: "2017",
    size: "1.1 GB",
    url: "https://cinekwok.com/films/india/indiaaddoil.mp4",
    category: "Cinema Feature",
    description: "Feature presentation from the Asian cinematic archives.",
    themeGradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%)",
    icon: "🌏",
    accentColor: "#2dd4bf",
  },
  {
    id: "kaakka-muttai",
    title: "Kaakka Muttai (The Crow's Egg)",
    year: "2014",
    size: "557 MB",
    url: "https://cinekwok.com/films/india/kaakkaamuttai2014.mp4",
    category: "Critically Acclaimed",
    description: "Two young slum kids embark on an ambitious quest to taste their first pizza slice.",
    themeGradient: "linear-gradient(135deg, #c026d3 0%, #a21caf 50%, #701a75 100%)",
    icon: "🍕",
    accentColor: "#e879f9",
  },
  {
    id: "kakamiss",
    title: "Kakamiss",
    year: "2018",
    size: "482 MB",
    url: "https://cinekwok.com/films/india/kakamiss2018.mp4",
    category: "Cinema Feature",
    description: "Engaging cinematic narrative of family and resilience.",
    themeGradient: "linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)",
    icon: "🎭",
    accentColor: "#94a3b8",
  },
  {
    id: "lucknow-central",
    title: "Lucknow Central",
    year: "2017",
    size: "153 MB",
    url: "https://cinekwok.com/films/india/lucknow%20%20central.mp4",
    category: "Musical Thriller",
    description: "A framed musician forms a jail band with fellow prisoners to execute an audacious prison break.",
    themeGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
    icon: "🎸",
    accentColor: "#f87171",
  },
  {
    id: "munna-bhai-mbbs",
    title: "Munna Bhai M.B.B.S.",
    year: "2003",
    size: "1.1 GB",
    url: "https://cinekwok.com/films/india/munnabahaimbbs2003.mp4",
    category: "Cult Comedy",
    description: "A lovable Mumbai underworld don enrolls in medical college to fulfill his father's dream.",
    themeGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)",
    icon: "🩺",
    accentColor: "#fbbf24",
  },
  {
    id: "newton",
    title: "Newton",
    year: "2017",
    size: "1.3 GB",
    url: "https://cinekwok.com/films/india/newton2017.mp4",
    category: "Political Drama",
    description: "A rookie government clerk is sent on election duty to a conflict-ridden jungle outpost.",
    themeGradient: "linear-gradient(135deg, #65a30d 0%, #4d7c0f 50%, #365314 100%)",
    icon: "🗳️",
    accentColor: "#a3e635",
  },
  {
    id: "padmaavat",
    title: "Padmaavat",
    year: "2018",
    size: "2.4 GB",
    url: "https://cinekwok.com/films/india/padmaavat2018.mp4",
    category: "Period Epic",
    description: "The historic defense of Chittorgarh and Queen Padmavati against the siege of Alauddin Khilji.",
    themeGradient: "linear-gradient(135deg, #be185d 0%, #9d174d 50%, #700732 100%)",
    icon: "🏰",
    accentColor: "#f472b6",
  },
  {
    id: "padman",
    title: "Pad Man",
    year: "2018",
    size: "704 MB",
    url: "https://cinekwok.com/films/india/padman2018.mp4",
    category: "Biographical Drama",
    description: "Inspired by the life of Arunachalam Muruganantham, who revolutionized low-cost sanitary pads in rural India.",
    themeGradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)",
    icon: "🌟",
    accentColor: "#22d3ee",
  },
  {
    id: "unknown-death",
    title: "Unknown Death",
    year: "2018",
    size: "1.4 GB",
    url: "https://cinekwok.com/films/india/unknowndeath.mp4",
    category: "Mystery Thriller",
    description: "A gripping suspense investigation into an unsolved mysterious disappearance.",
    themeGradient: "linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)",
    icon: "🔍",
    accentColor: "#9ca3af",
  },
];

interface VideoSanctumProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoSanctum({ isOpen, onClose }: VideoSanctumProps) {
  // Default to Babu Memorial Legacy Video
  const [selectedFilm, setSelectedFilm] = useState<CinemaFilm>(CINEMA_FILMS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile & screen changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format seconds to H:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Reset & load when switching film
  const handleSelectFilm = (film: CinemaFilm) => {
    playCoCClick(1.1);
    setSelectedFilm(film);
    setShowPlaylistDrawer(false);
    setCurrentTime(0);
    setDuration(0);
    setBufferedPercent(0);
    setIsBuffering(true);

    if (videoRef.current) {
      videoRef.current.src = film.url;
      videoRef.current.load();
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsBuffering(false);
          });
      }
    }
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    playCoCClick(1.0);
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      setIsBuffering(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            setIsBuffering(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  }, []);

  // Handle auto-hide controls
  const handleUserActivity = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying]);

  // Video time & buffer updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0 && videoRef.current.duration > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedPercent((bufferedEnd / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsBuffering(false);
  };

  // Seek on progress bar
  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const targetRatio = clickX / rect.width;
    const targetTime = targetRatio * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Quick 10-second skip
  const handleSkip = (seconds: number) => {
    playCoCClick(1.1);
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  // Toggle Fullscreen & Landscape for mobile/tablets
  const toggleFullscreen = async () => {
    playCoCClick(1.2);
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        if (playerContainerRef.current.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          await (playerContainerRef.current as any).webkitRequestFullscreen();
        }
        setIsFullscreen(true);
        if (screen.orientation && (screen.orientation as any).lock) {
          (screen.orientation as any).lock("landscape").catch(() => {});
        }
      } catch {}
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      } catch {}
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Toggle Mute
  const toggleMute = () => {
    playCoCClick(1.0);
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Filtered films for search
  const filteredFilms = CINEMA_FILMS.filter(
    (f) =>
      searchQuery.trim() === "" ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.year && f.year.includes(searchQuery))
  );

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isFullscreen ? "0" : isMobile ? "6px" : "12px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFullscreen) {
          playCoCClick(0.9);
          if (videoRef.current) videoRef.current.pause();
          onClose();
        }
      }}
    >
      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: isFullscreen ? "100%" : "1060px",
          height: isFullscreen ? "100vh" : isMobile ? "96dvh" : "90vh",
          maxHeight: isFullscreen ? "100vh" : isMobile ? "100dvh" : "920px",
          display: "flex",
          flexDirection: "column",
          borderRadius: isFullscreen ? "0" : isMobile ? "16px" : "20px",
          border: isFullscreen ? "none" : isMobile ? "3px solid #3c2415" : "4px solid #3c2415",
          background: "linear-gradient(180deg, #2b170a 0%, #150a04 100%)",
          overflow: "hidden",
        }}
      >
        {/* Header (Hidden in Fullscreen) */}
        {!isFullscreen && (
          <div
            className="coc-modal-header"
            style={{
              padding: isMobile ? "8px 12px" : "10px 16px",
              flexShrink: 0,
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "10px", minWidth: 0, flex: 1 }}>
              <Clapperboard color="#ffd700" size={isMobile ? 18 : 22} style={{ flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <span
                  className="coc-gold-text"
                  style={{
                    fontSize: isMobile ? "13.5px" : "16px",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                >
                  CINEMA SANCTUM
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
              {isMobile && (
                <button
                  onClick={() => {
                    playCoCClick(1.1);
                    setShowPlaylistDrawer(!showPlaylistDrawer);
                  }}
                  className={`coc-btn-pill ${showPlaylistDrawer ? "coc-btn-pill-orange" : "coc-btn-pill-blue"}`}
                  style={{
                    height: "30px",
                    padding: "0 10px",
                    fontSize: "11px",
                    borderRadius: "8px",
                    gap: "5px",
                    color: "#ffffff",
                    fontWeight: 700,
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.95)",
                  }}
                >
                  <div className="coc-btn-gloss" />
                  <ListVideo size={13} color="#ffffff" />
                  <span style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>
                    {showPlaylistDrawer ? "Player" : `Films (${CINEMA_FILMS.length})`}
                  </span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playCoCClick(0.9);
                  if (videoRef.current) videoRef.current.pause();
                  onClose();
                }}
                className="coc-modal-close"
                style={{ width: isMobile ? "30px" : "34px", height: isMobile ? "30px" : "34px", fontSize: "14px" }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: isFullscreen ? "column" : isMobile ? "column" : "row",
            overflow: "hidden",
            position: "relative",
            minHeight: 0,
          }}
        >
          {/* Left/Top: YouTube Style Video Player */}
          <div
            ref={playerContainerRef}
            onMouseMove={handleUserActivity}
            onTouchStart={handleUserActivity}
            style={{
              flex: isFullscreen ? 1 : isMobile ? (showPlaylistDrawer ? "0 0 200px" : "1 1 auto") : 1,
              position: "relative",
              backgroundColor: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              userSelect: "none",
              minHeight: isMobile && !showPlaylistDrawer ? "220px" : "unset",
            }}
          >
            {/* Dynamic CSS Movie Card Placeholder (When video is not playing) */}
            {!isPlaying && !isBuffering && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: selectedFilm.themeGradient,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: isMobile ? "12px" : "24px",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                {/* Background Pattern */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: isMobile ? "18px 18px" : "24px 24px",
                    opacity: 0.5,
                  }}
                />

                {/* Movie Badge Card */}
                <div
                  style={{
                    position: "relative",
                    background: "rgba(10, 5, 2, 0.8)",
                    border: `2.5px solid ${selectedFilm.accentColor}`,
                    borderRadius: isMobile ? "14px" : "18px",
                    padding: isMobile ? "10px 14px" : "20px 28px",
                    textAlign: "center",
                    maxWidth: isMobile ? "92%" : "480px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.85), inset 0 2px 2px rgba(255,255,255,0.2)",
                  }}
                >
                  <div style={{ fontSize: isMobile ? "28px" : "40px", marginBottom: "4px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}>
                    {selectedFilm.icon}
                  </div>
                  <div
                    className="coc-gold-text"
                    style={{
                      fontSize: isMobile ? "15px" : "20px",
                      lineHeight: 1.2,
                      marginBottom: "4px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {selectedFilm.title}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: isMobile ? "10.5px" : "12px", color: "#e2d1c0", marginBottom: "6px" }}>
                    {selectedFilm.year && <span>{selectedFilm.year}</span>}
                    <span>•</span>
                    <span style={{ color: "#aef085", fontWeight: 700 }}>{selectedFilm.size}</span>
                    <span>•</span>
                    <span style={{ color: selectedFilm.accentColor, fontWeight: 700 }}>{selectedFilm.category}</span>
                  </div>
                  {!isMobile && (
                    <p style={{ fontSize: "12px", color: "#c8b49e", lineHeight: "1.4", margin: 0 }}>
                      {selectedFilm.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src={selectedFilm.url}
              poster={selectedFilm.poster}
              playsInline
              // @ts-ignore
              webkit-playsinline="true"
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsBuffering(true)}
              onCanPlay={() => setIsBuffering(false)}
              onPlaying={() => {
                setIsPlaying(true);
                setIsBuffering(false);
              }}
              onLoadStart={() => setIsBuffering(true)}
              onSeeking={() => setIsBuffering(true)}
              onSeeked={() => setIsBuffering(false)}
              onEnded={() => {
                setIsPlaying(false);
                setIsBuffering(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                cursor: "pointer",
                position: "relative",
                zIndex: 1,
              }}
            />

            {/* Top Film Title Overlay (Visible on hover/touch) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: isMobile ? "8px 12px" : "16px 20px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: showControls ? 1 : 0,
                transition: "opacity 0.25s ease",
                pointerEvents: showControls ? "auto" : "none",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                <span
                  className="coc-gold-text"
                  style={{
                    fontSize: isMobile ? "13px" : "17px",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {selectedFilm.title}
                </span>
                <span style={{ fontSize: "10.5px", color: "#aef085", fontWeight: 700, flexShrink: 0 }}>
                  [{selectedFilm.size}]
                </span>
              </div>

              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="coc-modal-close"
                  style={{ width: "30px", height: "30px", fontSize: "14px", flexShrink: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Buffering Spinner Overlay */}
            {isBuffering && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0, 0, 0, 0.6)",
                  backdropFilter: "blur(4px)",
                  zIndex: 8,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: isMobile ? "42px" : "56px",
                    height: isMobile ? "42px" : "56px",
                    borderRadius: "50%",
                    border: "3.5px solid rgba(255, 215, 0, 0.2)",
                    borderTopColor: "#ffd700",
                    borderRightColor: "#ee5f15",
                    animation: "spin 0.8s linear infinite",
                    marginBottom: "8px",
                    boxShadow: "0 0 20px rgba(238, 95, 21, 0.8)",
                  }}
                />
                <span
                  className="coc-gold-text"
                  style={{ fontSize: isMobile ? "13px" : "15px", letterSpacing: "0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.9)" }}
                >
                  Buffering Stream...
                </span>
                <span style={{ fontSize: "10px", color: "#aef085", fontWeight: 700, marginTop: "2px" }}>
                  Direct HTTP Stream
                </span>
              </div>
            )}

            {/* Big Center Play / Pause Indicator */}
            {!isPlaying && !isBuffering && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                role="button"
                tabIndex={0}
                style={{
                  position: "absolute",
                  width: isMobile ? "58px" : "72px",
                  height: isMobile ? "58px" : "72px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(238, 95, 21, 0.95) 0%, rgba(188, 53, 8, 0.95) 100%)",
                  border: "3px solid #ffd700",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255, 215, 0, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                  transform: "scale(1)",
                  zIndex: 6,
                }}
              >
                <Play fill="#ffffff" color="#ffffff" size={isMobile ? 26 : 32} style={{ marginLeft: "3px" }} />
              </div>
            )}

            {/* YouTube Custom Controls Bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: isMobile ? "6px 10px 8px 10px" : "8px 16px 12px 16px",
                background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 65%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                gap: isMobile ? "4px" : "8px",
                opacity: showControls || !isPlaying ? 1 : 0,
                transition: "opacity 0.25s ease",
                pointerEvents: showControls || !isPlaying ? "auto" : "none",
                zIndex: 10,
              }}
            >
              {/* Scrub / Progress Bar */}
              <div
                ref={progressBarRef}
                onClick={handleSeek}
                onTouchStart={handleSeek}
                style={{
                  position: "relative",
                  width: "100%",
                  height: isMobile ? "6px" : "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                {/* Buffered Progress */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${bufferedPercent}%`,
                    backgroundColor: "rgba(255, 255, 255, 0.45)",
                    transition: "width 0.2s linear",
                  }}
                />
                {/* Played Progress */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #ffab33 0%, #ee5f15 100%)",
                    boxShadow: "0 0 8px rgba(238, 95, 21, 0.8)",
                  }}
                />
              </div>

              {/* Bottom Row Controls */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Left Controls: Play, Skip, Time */}
                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px" }}>
                  <button
                    onClick={togglePlay}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                    }}
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause size={isMobile ? 18 : 20} fill="#fff" /> : <Play size={isMobile ? 18 : 20} fill="#fff" />}
                  </button>

                  {/* 10s Rewind */}
                  <button
                    onClick={() => handleSkip(-10)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1px",
                      fontSize: isMobile ? "9px" : "10px",
                      fontWeight: 700,
                      opacity: 0.9,
                    }}
                    title="Rewind 10s"
                  >
                    <RotateCcw size={isMobile ? 14 : 16} />
                    <span>10s</span>
                  </button>

                  {/* 10s Forward */}
                  <button
                    onClick={() => handleSkip(10)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "1px",
                      fontSize: isMobile ? "9px" : "10px",
                      fontWeight: 700,
                      opacity: 0.9,
                    }}
                    title="Forward 10s"
                  >
                    <RotateCw size={isMobile ? 14 : 16} />
                    <span>10s</span>
                  </button>

                  {/* Volume Slider (Desktop only or tablet) */}
                  {!isMobile && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={toggleMute}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          padding: "2px",
                        }}
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{
                          width: "55px",
                          accentColor: "#ee5f15",
                          cursor: "pointer",
                          height: "4px",
                        }}
                      />
                    </div>
                  )}

                  {/* Time Display */}
                  <div
                    style={{
                      fontSize: isMobile ? "10.5px" : "12px",
                      color: "#ffffff",
                      fontFamily: "var(--coc-font-sans)",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                    }}
                  >
                    <span>{formatTime(currentTime)}</span>
                    <span style={{ opacity: 0.6, margin: "0 3px" }}>/</span>
                    <span style={{ opacity: 0.75 }}>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Right Controls: Fullscreen / Landscape */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={toggleFullscreen}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "4px",
                    }}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen / Landscape"}
                  >
                    {isFullscreen ? <Minimize size={isMobile ? 18 : 20} /> : <Maximize size={isMobile ? 18 : 20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right/Bottom: Film Catalog & Playlist Drawer */}
          {(!isFullscreen || showPlaylistDrawer) && (!isMobile || showPlaylistDrawer) && (
            <div
              style={{
                width: isFullscreen || isMobile ? "100%" : "340px",
                height: isMobile ? "auto" : "100%",
                flex: isMobile ? 1 : "unset",
                backgroundColor: "#1b0d05",
                borderLeft: isMobile ? "none" : "3px solid #5b3720",
                borderTop: isMobile ? "3px solid #5b3720" : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                flexShrink: 0,
                minHeight: 0,
              }}
            >
              {/* Search Film */}
              <div style={{ padding: isMobile ? "8px 10px" : "12px 14px", borderBottom: "2px solid #3d2010" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1.5px solid #5b3720",
                    borderRadius: "10px",
                    padding: isMobile ? "4px 8px" : "6px 10px",
                  }}
                >
                  <Search size={14} color="#ffd700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 19 cinema films..."
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: "12px",
                      width: "100%",
                      fontFamily: "var(--coc-font-sans)",
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "11px" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Films List */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: isMobile ? "6px" : "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "4px" : "6px",
                  minHeight: 0,
                }}
              >
                {filteredFilms.map((film, index) => {
                  const isSelected = selectedFilm.id === film.id;
                  return (
                    <div
                      key={film.id}
                      onClick={() => handleSelectFilm(film)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: isMobile ? "8px" : "10px",
                        padding: isMobile ? "8px 10px" : "10px 12px",
                        borderRadius: "12px",
                        background: isSelected
                          ? "linear-gradient(180deg, rgba(238, 95, 21, 0.35) 0%, rgba(188, 53, 8, 0.45) 100%)"
                          : "rgba(45, 25, 12, 0.35)",
                        border: isSelected ? "2px solid #ee5f15" : "1px solid rgba(91, 55, 32, 0.4)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Dynamic CSS Movie Badge Thumbnail */}
                      <div
                        style={{
                          width: isMobile ? "32px" : "38px",
                          height: isMobile ? "32px" : "38px",
                          borderRadius: "10px",
                          background: film.themeGradient,
                          border: isSelected ? "2px solid #ffd700" : "1.5px solid rgba(255, 255, 255, 0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: isMobile ? "14px" : "16px",
                          boxShadow: "0 3px 6px rgba(0,0,0,0.5)",
                          flexShrink: 0,
                        }}
                      >
                        {isSelected ? <Play size={isMobile ? 13 : 16} fill="#ffd700" color="#ffd700" /> : film.icon}
                      </div>

                      {/* Film Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? "12px" : "13px",
                            fontWeight: 700,
                            color: isSelected ? "#ffd700" : "#ffffff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {film.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "1px",
                            fontSize: isMobile ? "9.5px" : "10.5px",
                            color: "#cbb49c",
                          }}
                        >
                          {film.year && <span>{film.year}</span>}
                          <span>•</span>
                          <span style={{ color: "#aef085", fontWeight: 600 }}>{film.size}</span>
                          <span>•</span>
                          <span style={{ opacity: 0.8 }}>{film.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Film Note Footer */}
              <div
                style={{
                  padding: isMobile ? "8px 10px" : "10px 14px",
                  background: "rgba(0, 0, 0, 0.5)",
                  borderTop: "2px solid #3d2010",
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#d8be9f",
                  lineHeight: "1.35",
                }}
              >
                <div style={{ fontWeight: 700, color: "#ffd700", marginBottom: "2px" }}>
                  🎬 {selectedFilm.title}
                </div>
                <div>{selectedFilm.description}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
