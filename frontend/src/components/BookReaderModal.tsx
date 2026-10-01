"use client";

import React, { useState, useRef, useEffect } from "react";
import { MemoryItem } from "./ThreeBookshelf";
import { playCoCClick, playElixirCollect, playDiyaChime, playGemStar } from "@/lib/sound";
import confetti from "canvas-confetti";
import { Play, Pause, Volume2, X, Sparkles, Flame, Bookmark, ArrowLeft } from "lucide-react";

// Simple mobile detection hook
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

interface BookReaderModalProps {
  memory: MemoryItem | null;
  onClose: () => void;
  onTribute: (memoryId: string, type: "elixir" | "flame" | "star", amount?: number) => void;
}

export function BookReaderModal({ memory, onClose, onTribute }: BookReaderModalProps) {
  const isMobile = useIsMobile();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [offeredElixir, setOfferedElixir] = useState(0);
  const [litDiya, setLitDiya] = useState(false);
  const [starred, setStarred] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset audio state when memory changes
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setOfferedElixir(0);
    setLitDiya(false);
    setStarred(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [memory]);

  if (!memory) return null;

  const handleToggleVoice = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlayingAudio(true))
          .catch((err) => console.warn("Audio play error:", err));
      }
    }
    playCoCClick(1.2);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const handleOfferElixir = (e: React.MouseEvent) => {
    playElixirCollect();
    setOfferedElixir((prev) => prev + 50);
    onTribute(memory.id, "elixir", 50);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 40,
      spread: 75,
      startVelocity: 30,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#ff70f8", "#db26d8", "#9e119b", "#ffffff", "#ffb3f9"],
      shapes: ["circle"],
      scalar: 1.2,
    });
  };

  const handleLightFlame = (e: React.MouseEvent) => {
    playDiyaChime();
    setLitDiya(true);
    onTribute(memory.id, "flame", 1);
    import("@/lib/supabase").then(({ insertSupabaseDiya }) => {
      insertSupabaseDiya(`Memory: ${memory.title}`);
    }).catch(() => {});

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 45,
      spread: 80,
      startVelocity: 35,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#ff9900", "#ff5500", "#ffd700", "#ffcc00", "#fff3cc"],
      shapes: ["circle", "square"],
      scalar: 1.1,
    });
  };

  const handleStarAward = (e: React.MouseEvent) => {
    playGemStar();
    setStarred(true);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 50,
      spread: 85,
      startVelocity: 35,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ["#ffd700", "#ffaa00", "#ffffff", "#e06522", "#fff59d"],
      shapes: ["star", "circle"],
      scalar: 1.2,
    });
    onTribute(memory.id, "star", 1);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        backgroundColor: "rgba(10, 18, 8, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "0" : "20px",
        overflowY: "auto",
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playCoCClick(0.9);
          onClose();
        }
      }}
    >
      {/* The Open Hardbound Grimoire */}
      <div
        className="parchment-sheet"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isMobile ? "100%" : "960px",
          maxHeight: isMobile ? "100dvh" : "auto",
          borderRadius: isMobile ? "0" : "20px",
          border: isMobile ? "none" : "8px solid #3d2415",
          boxShadow: isMobile ? "none" : "0 20px 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(100, 65, 30, 0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: isMobile ? "auto" : "hidden",
          WebkitOverflowScrolling: "touch",
          height: isMobile ? "100dvh" : "auto",
        }}
      >
        {/* Leather Spine Header */}
        <div
          style={{
            background: "linear-gradient(180deg, #4d2b17 0%, #2f180a 100%)",
            borderBottom: "4px solid #1a0c05",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Bookmark color="#ffd700" size={20} />
            <span
              className="coc-gold-text"
              style={{ fontSize: "16px", letterSpacing: "1px" }}
            >
              MEMOIR BOOK: {memory.era}
            </span>
          </div>

          <button
            onClick={() => {
              playCoCClick(0.9);
              onClose();
            }}
            className="coc-modal-close"
            title="Return to Shelf"
          >
            ✕
          </button>
        </div>

        {/* 2-Column Book Interior (Responsive: Stacks on mobile) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
            padding: isMobile ? "16px" : "28px",
            gap: isMobile ? "16px" : "28px",
            color: "#2a1e17",
          }}
        >
          {/* Left Page: Archival Portrait & Spoken Voice Note */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              borderRight: "1px dashed rgba(80, 50, 20, 0.25)",
              paddingRight: "14px",
            }}
          >
            {/* Gilded Picture Frame - Uncropped Portrait View */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: isMobile ? "220px" : "320px",
                borderRadius: "14px",
                overflow: "hidden",
                border: isMobile ? "4px solid #d4af37" : "6px solid #d4af37",
                boxShadow: "0 8px 24px rgba(0,0,0,0.45), inset 0 0 20px rgba(0,0,0,0.5)",
                backgroundColor: "#160d07",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Blurred backdrop layer to fill frame gracefully */}
              <img
                src={memory.imagePath || "/Assets/Image/Rajesh Father.png"}
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Assets/Image/Rajesh Father.png";
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                  filter: "blur(22px) brightness(0.35)",
                  transform: "scale(1.2)",
                }}
              />
              {/* Foreground uncropped photograph preserving full face and head */}
              <img
                src={memory.imagePath || "/Assets/Image/Rajesh Father.png"}
                alt={memory.title || "Memoir Portrait"}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/Assets/Image/Rajesh Father.png";
                }}
                style={{
                  position: "relative",
                  zIndex: 2,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "8px",
                  zIndex: 3,
                  background: "rgba(30, 15, 5, 0.88)",
                  border: "1.5px solid #d4af37",
                  borderRadius: "6px",
                  padding: "3px 10px",
                  fontSize: "12px",
                  color: "#ffd700",
                  fontFamily: "var(--coc-font-gaming)",
                }}
              >
                📅 {memory.date || "Recent"}
              </div>
            </div>

            {/* Spoken Voice Recording Player (if available) */}
            {memory.audioPath ? (
              <div
                style={{
                  background: "linear-gradient(180deg, #ebe0c8 0%, #ded0b4 100%)",
                  border: "2.5px solid #8c6843",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
                }}
              >
                <audio
                  ref={audioRef}
                  src={encodeURI(memory.audioPath)}
                  playsInline
                  preload="auto"
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={handleAudioEnded}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Volume2 size={18} color="#6e3e14" />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#4a2a0c" }}>
                      Spoken Audio Recording of Shyamal Choudhuri
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#7a5430", fontWeight: 600 }}>
                    {isPlayingAudio ? "Playing Voice Note..." : "Tap to Listen"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={handleToggleVoice}
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "linear-gradient(180deg, #ff9b26 0%, #b83307 100%)",
                      border: "2.5px solid #2b0e04",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
                      flexShrink: 0,
                    }}
                  >
                    {isPlayingAudio ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
                  </button>

                  {/* Audio Progress Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: "10px",
                      backgroundColor: "#bcab90",
                      borderRadius: "999px",
                      overflow: "hidden",
                      border: "1px solid #73593d",
                    }}
                  >
                    <div
                      style={{
                        width: `${audioProgress}%`,
                        height: "100%",
                        backgroundColor: "#c2541a",
                        transition: "width 0.1s linear",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: "12px",
                  color: "#6b5443",
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "8px",
                }}
              >
                Preserved with love
              </div>
            )}

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(memory.tags || ["Memoir", "Tribute"]).map((t) => (
                <span
                  key={t}
                  style={{
                    background: "rgba(100, 65, 30, 0.12)",
                    border: "1px solid rgba(100, 65, 30, 0.25)",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#5b3720",
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right Page: Life Narrative, Quotes & CoC Tributes */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              {/* Chapter Title */}
              <h2
                style={{
                  fontFamily: "var(--coc-font-serif)",
                  fontSize: "24px",
                  color: "#3d2010",
                  fontWeight: 800,
                  marginBottom: "12px",
                  lineHeight: "1.25",
                }}
              >
                {memory.title}
              </h2>

              {/* Story Excerpt & Body */}
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.65",
                  color: "#3a2d24",
                  marginBottom: "18px",
                }}
              >
                {memory.story}
              </p>

              {/* Sacred Quote Callout */}
              {memory.quote && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 240, 200, 0.6) 0%, rgba(240, 215, 160, 0.6) 100%)",
                    borderLeft: "4px solid #b8860b",
                    padding: "12px 16px",
                    borderRadius: "0 10px 10px 0",
                    fontStyle: "italic",
                    fontSize: "14px",
                    color: "#4a2d12",
                    marginBottom: "20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  &ldquo;{memory.quote}&rdquo;
                  <div style={{ marginTop: "4px", fontSize: "11px", fontWeight: 700, fontStyle: "normal", color: "#8a581e" }}>
                    — Shyamal Choudhuri
                  </div>
                </div>
              )}
            </div>

            {/* Clash of Clans Tribute Actions Area */}
            <div
              style={{
                background: "linear-gradient(180deg, #3a2213 0%, #201108 100%)",
                border: "3px solid #5a361c",
                borderRadius: "16px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                color: "#ffffff",
                boxShadow: "0 6px 14px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                <span className="coc-text-shadow" style={{ color: "#ffd700" }}>
                  OFFER TRIBUTES
                </span>
                <span style={{ fontSize: "11px", color: "#a5f57a" }}>
                  Sacred Family Homage
                </span>
              </div>

              {/* Tribute Buttons Row (100% Dynamic, No Mock Data) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {/* 1. Offer Elixir (+50) */}
                <button
                  onClick={handleOfferElixir}
                  className="coc-btn-base coc-btn-wide-orange"
                  style={{
                    padding: "8px 6px",
                    fontSize: "12px",
                    borderRadius: "12px",
                  }}
                  title="Offer 50 Sacred Elixir"
                >
                  <div className="coc-btn-gloss" />
                  <span style={{ fontSize: "14px" }}>🧪 +50</span>
                  <span style={{ fontSize: "10px", marginTop: "1px" }}>
                    {offeredElixir > 0 ? `+${offeredElixir} Sent` : "Offer Elixir"}
                  </span>
                </button>

                {/* 2. Light Diya Flame */}
                <button
                  onClick={handleLightFlame}
                  className="coc-btn-base coc-btn-wide-green"
                  style={{
                    padding: "8px 6px",
                    fontSize: "12px",
                    borderRadius: "12px",
                  }}
                  title="Light a Sacred Diya"
                >
                  <div className="coc-btn-gloss" />
                  <span style={{ fontSize: "14px" }}>🪔 Diya</span>
                  <span style={{ fontSize: "10px", marginTop: "1px" }}>
                    {litDiya ? "Flame Lit ✨" : "Light Flame"}
                  </span>
                </button>

                {/* 3. Award Star */}
                <button
                  onClick={handleStarAward}
                  className="coc-btn-base coc-btn-wide-orange"
                  style={{
                    padding: "8px 6px",
                    fontSize: "12px",
                    borderRadius: "12px",
                    background: "linear-gradient(180deg, #ffcf29 0%, #e59400 100%)",
                    borderColor: "#593600",
                  }}
                  title="Send Prayer of Remembrance"
                >
                  <div className="coc-btn-gloss" />
                  <span style={{ fontSize: "14px" }}>⭐ Star</span>
                  <span style={{ fontSize: "10px", marginTop: "1px" }}>
                    {starred ? "Prayer Sent 🙏" : "Send Prayer"}
                  </span>
                </button>
              </div>

              {/* Close / Return to Shelf Button */}
              <button
                onClick={() => {
                  playCoCClick(1.0);
                  onClose();
                }}
                className="coc-btn-base"
                style={{
                  width: "100%",
                  height: "38px",
                  background: "linear-gradient(180deg, #5b3720 0%, #3e2212 100%)",
                  border: "2px solid #231208",
                  borderRadius: "10px",
                  color: "#ffdf40",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <ArrowLeft size={16} />
                <span>Return Book to Bookshelf</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
