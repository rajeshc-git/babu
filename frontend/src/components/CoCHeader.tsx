"use client";

import React, { useState, useEffect, useRef } from "react";
import { CoCElixirBar, CoCGreenResourceBar } from "./CoCButtons";
import { playCoCClick, toggleMute } from "@/lib/sound";
import { Volume2, VolumeX, Music, Shield } from "lucide-react";

interface CoCHeaderProps {
  elixir: number;
  flames: number;
  stars: number;
  serverStats?: {
    memoryAllocKb: number;
    goVersion: string;
    serverUptime: string;
  } | null;
  onOpenInfo?: () => void;
  onToggleMenu?: () => void;
  isMenuOpen?: boolean;
}

export function CoCHeader({ elixir, flames, stars, serverStats, onOpenInfo, onToggleMenu, isMenuOpen }: CoCHeaderProps) {
  const [muted, setMuted] = useState(false);
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleBgm = () => {
    playCoCClick(1.2);
    if (!audioRef.current) {
      const audio = new Audio("/Assets/ambient.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      audio.onplay = () => setBgmPlaying(true);
      audio.onpause = () => setBgmPlaying(false);
      audioRef.current = audio;
    }

    if (bgmPlaying) {
      audioRef.current.pause();
      setBgmPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.error) {
        audioRef.current.src = "/Assets/ambient.mp3";
      }
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setBgmPlaying(true))
          .catch((err) => {
            console.warn("Ambient BGM play blocked or failed:", err);
            setBgmPlaying(false);
          });
      }
    }
  };

  const handleToggleSound = () => {
    const isNowMuted = toggleMute();
    setMuted(isNowMuted);
    playCoCClick(1.0);
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: isMobile ? "6px 8px" : "10px 16px",
        paddingTop: isMobile ? "calc(env(safe-area-inset-top, 0px) + 6px)" : "10px",
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: isMobile ? "6px" : "12px",
        background: "linear-gradient(180deg, rgba(20, 36, 12, 0.95) 0%, rgba(20, 36, 12, 0.75) 85%, transparent 100%)",
        borderBottom: "2px solid rgba(255, 215, 0, 0.15)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Left: On Mobile -> Hamburger Menu Button; On Desktop -> Player Profile / Town Hall 6 Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {/* Mobile Hamburger Button in Top-Left */}
        <div className="coc-header-mobile-menu">
          <button
            type="button"
            className={`hamburger-btn ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => {
              playCoCClick(1.0);
              onToggleMenu?.();
            }}
            aria-label="Menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        {/* Desktop Town Hall 6 Badge */}
        <div
          className="coc-header-townhall-badge"
          onClick={onOpenInfo}
          title="Sanctuary Level 6 Memorial"
          style={{
            position: "relative",
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "linear-gradient(180deg, #3d72ff 0%, #1742b8 100%)",
            border: "3px solid #0f2468",
            borderBottom: "4px solid #081540",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.4)",
            touchAction: "manipulation",
          }}
        >
          {/* Level Star Number */}
          <div
            className="coc-text-shadow"
            style={{
              fontSize: "24px",
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            6
          </div>
          {/* Small star on bottom right */}
          <div
            style={{
              position: "absolute",
              bottom: "-3px",
              right: "-3px",
              background: "#ffcc00",
              border: "1.5px solid #000",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#000",
              fontWeight: 900,
            }}
          >
            ⭐
          </div>
        </div>

        {/* Shrine Name & Lifespan - Hidden on screens <= 820px to prevent HUD overlap */}
        <div className="coc-header-desktop-title">
          <div
            className="coc-gold-text"
            style={{
              fontSize: "18px",
              letterSpacing: "0.5px",
            }}
          >
            SHYAMAL CHOUDHURI
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: "#aef085",
              fontWeight: 600,
            }}
          >
            <span>🕊️</span>
            <span>1972 — 2026</span>
          </div>
        </div>
      </div>

      {/* Center: Clash of Clans Resource Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "nowrap",
          justifyContent: "center",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Purple Elixir Bar (Dynamic Homage Score) */}
        <CoCElixirBar value={elixir} max={3000} />

        {/* Green Life / Diya Flames Bar (Real Live Supabase Diyas) */}
        <CoCGreenResourceBar value={flames} max={300} />

        {/* Gold Star Tributes Bar for Desktop */}
        <div
          className="coc-resource-bar coc-star-chip-desktop"
          style={{ width: "140px" }}
          title={`Stars of Honor: ${stars}`}
        >
          <div
            className="coc-fill-green"
            style={{
              width: `${Math.min(100, Math.max(15, (stars / 50) * 100))}%`,
              background: "linear-gradient(180deg, #ffe066 0%, #f5a623 50%, #b86200 100%)",
            }}
          >
            <div className="coc-fill-highlight" />
          </div>
          <div className="coc-resource-num">{stars.toLocaleString()}</div>
          <div
            style={{
              position: "absolute",
              right: "-6px",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #fff176 0%, #fbc02d 60%, #f57f17 100%)",
              border: "2.5px solid #2e1a00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 3px 6px rgba(0,0,0,0.6)",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            ⭐
          </div>
        </div>

        {/* Mobile Gold Star Chip */}
        <div
          className="coc-star-chip-mobile"
          style={{
            alignItems: "center",
            gap: "2px",
            background: "linear-gradient(180deg, rgba(40, 25, 10, 0.95) 0%, rgba(20, 12, 5, 0.95) 100%)",
            border: "2px solid #ffcc00",
            borderRadius: "999px",
            padding: "2px 6px",
            height: "26px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
            flexShrink: 0,
          }}
          title={`Stars of Honor: ${stars}`}
        >
          <span style={{ fontSize: "12px" }}>⭐</span>
          <span style={{
            fontFamily: "var(--coc-font-gaming)",
            fontSize: "11px",
            color: "#ffd700",
            WebkitFontSmoothing: "antialiased",
            paintOrder: "stroke fill",
            WebkitTextStroke: "0.55px #000000",
            textShadow: "0 1px 2px rgba(0,0,0,0.9)",
          }}>
            {stars}
          </span>
        </div>
      </div>

      {/* Right: Audio Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "5px" : "10px", flexShrink: 0 }}>
        {/* Ambient BGM toggle */}
        <button
          onClick={handleToggleBgm}
          title={bgmPlaying ? "Pause Sanctuary Music" : "Play Sanctuary Music"}
          style={{
            width: isMobile ? "32px" : "38px",
            height: isMobile ? "32px" : "38px",
            borderRadius: isMobile ? "8px" : "10px",
            background: bgmPlaying
              ? "linear-gradient(180deg, #9ae234 0%, #468612 100%)"
              : "linear-gradient(180deg, #444 0%, #222 100%)",
            border: "2.5px solid #141c10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            boxShadow: "0 3px 0 #112803",
            touchAction: "manipulation",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          <Music size={isMobile ? 14 : 18} />
        </button>

        {/* Sound SFX toggle */}
        <button
          onClick={handleToggleSound}
          title={muted ? "Unmute UI Sounds" : "Mute UI Sounds"}
          style={{
            width: isMobile ? "32px" : "38px",
            height: isMobile ? "32px" : "38px",
            borderRadius: isMobile ? "8px" : "10px",
            background: !muted
              ? "linear-gradient(180deg, #ffab33 0%, #bc3508 100%)"
              : "linear-gradient(180deg, #444 0%, #222 100%)",
            border: "2.5px solid #141c10",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            boxShadow: "0 3px 0 #3b0b01",
            touchAction: "manipulation",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          {muted ? <VolumeX size={isMobile ? 14 : 18} /> : <Volume2 size={isMobile ? 14 : 18} />}
        </button>
      </div>
    </header>
  );
}
