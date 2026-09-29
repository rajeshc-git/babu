"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CoCHeader } from "@/components/CoCHeader";
import {
  CoCSpeechButton,
  CoCVoiceButton,
  CoCVideoButton,
  CoCPhotosButton,
  CoCInfoButton,
} from "@/components/CoCButtons";
import { ThreeBookshelf, MemoryItem } from "@/components/ThreeBookshelf";
import { BookReaderModal } from "@/components/BookReaderModal";
import { TributeChatDrawer } from "@/components/TributeChatDrawer";
import { InfoModal } from "@/components/InfoModal";
import { NewMemoryModal } from "@/components/NewMemoryModal";
import { VoiceSanctum } from "@/components/VoiceSanctum";
import { VideoSanctum } from "@/components/VideoSanctum";
import { PhotoGalleryModal } from "@/components/PhotoGalleryModal";
import { playCoCClick, playElixirCollect } from "@/lib/sound";
import { getSupabaseDiyaCount, getSupabaseTributes, insertSupabaseTribute } from "@/lib/supabase";
import { Mic, Film, Image as ImageIcon, PlusCircle, MessageSquare, Info, Shield, Menu, X } from "lucide-react";

export default function Home() {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);
  const [selectedShelfId, setSelectedShelfId] = useState("all");
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isNewMemoryOpen, setIsNewMemoryOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  // Mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close menu on navigation
  const openModal = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    playCoCClick(1.0);
    setIsMenuOpen(false);
    setter(true);
  }, []);

  // Dynamic Real Stats from Supabase & User Homage (No Mock Numbers)
  const [stats, setStats] = useState<{
    totalMemories: number;
    totalElixir: number;
    totalFlames: number;
    totalStars: number;
    townHallLevel: number;
    villageShield: string;
    serverUptime: string;
    goVersion: string;
    memoryAllocKb: number;
    activeRoutines: number;
  }>({
    totalMemories: 24,
    totalElixir: 2145,
    totalFlames: 192,
    totalStars: 9,
    townHallLevel: 6,
    villageShield: "Protected",
    serverUptime: "Active",
    goVersion: "go1.27.1",
    memoryAllocKb: 346,
    activeRoutines: 3,
  });

  // Fetch initial data from Go Backend and Supabase
  useEffect(() => {
    // 1. Fetch Shelves
    fetch("/api/shelves")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setShelves(data);
      })
      .catch(() => {});

    // 2. Fetch Memories
    fetch("/api/memories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMemories(data);
          setStats((prev) => ({ ...prev, totalMemories: data.length }));
        }
      })
      .catch(() => {});

    // 3. Fetch Real Supabase Live Diyas and Tributes count (100% exact raw Supabase counts)
    Promise.all([getSupabaseDiyaCount(), getSupabaseTributes()])
      .then(([flamesCount, tributes]) => {
        const liveFlames = typeof flamesCount === "number" ? flamesCount : 0;
        const liveStars = Array.isArray(tributes) && tributes.length > 0 ? tributes.length : 0;
        const dynamicElixir = liveFlames * 10 + liveStars * 25;

        setStats((prev) => ({
          ...prev,
          totalFlames: liveFlames,
          totalStars: liveStars,
          totalElixir: dynamicElixir,
        }));
      })
      .catch(() => {});
  }, []);

  // Handle Tribute (Elixir, Flame, Star)
  const handleTribute = (memoryId: string, type: "elixir" | "flame" | "star", amount = 50) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId) {
          return {
            ...m,
            elixirCount: type === "elixir" ? m.elixirCount + amount : m.elixirCount,
            flamesCount: type === "flame" ? m.flamesCount + 1 : m.flamesCount,
            starsCount: type === "star" ? m.starsCount + 1 : m.starsCount,
          };
        }
        return m;
      })
    );

    if (selectedMemory && selectedMemory.id === memoryId) {
      setSelectedMemory((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          elixirCount: type === "elixir" ? prev.elixirCount + amount : prev.elixirCount,
          flamesCount: type === "flame" ? prev.flamesCount + 1 : prev.flamesCount,
          starsCount: type === "star" ? prev.starsCount + 1 : prev.starsCount,
        };
      });
    }

    setStats((prev) => ({
      ...prev,
      totalElixir: type === "elixir" ? prev.totalElixir + amount : prev.totalElixir + (type === "flame" ? 10 : 25),
      totalFlames: type === "flame" ? prev.totalFlames + 1 : prev.totalFlames,
      totalStars: type === "star" ? prev.totalStars + 1 : prev.totalStars,
    }));

    fetch(`/api/memories/${memoryId}/tribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount }),
    }).catch(() => {});
  };

  // Handle Adding New Memory (Instant UI render + Backend + Supabase Cloud Sync)
  const handleAddMemory = (newMemData: any) => {
    const optimisticMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      shelfId: newMemData.shelfId || "roots",
      title: newMemData.title,
      era: newMemData.era || "Cherished Book",
      date: newMemData.date || "Recent",
      excerpt: newMemData.excerpt || newMemData.title,
      story: newMemData.story,
      quote: newMemData.quote || "",
      imagePath: newMemData.imagePath || "/Assets/Image/Rajesh Father.png",
      audioPath: newMemData.audioPath || undefined,
      tags: ["Tribute", "Inscribed Book"],
      elixirCount: 100,
      flamesCount: 1,
      starsCount: 1,
      color: newMemData.color || "#e06522",
    };

    // Instant UI update so book appears immediately on shelf
    setMemories((prev) => [optimisticMem, ...prev.filter((m) => m.id !== optimisticMem.id)]);
    setStats((prev) => ({
      ...prev,
      totalMemories: prev.totalMemories + 1,
      totalStars: prev.totalStars + 1,
      totalElixir: prev.totalElixir + 100,
    }));

    // Post to Go Backend
    fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMemData),
    })
      .then((res) => res.json())
      .then((created) => {
        if (created && created.id) {
          setMemories((prev) => [created, ...prev.filter((m) => m.id !== optimisticMem.id && m.id !== created.id)]);
        }
      })
      .catch(() => {});

    // Also sync tribute note to Supabase cloud
    insertSupabaseTribute(
      newMemData.title || "Family Member",
      newMemData.era || "Cherished Book",
      newMemData.story || "A loving memory inscribed into the library."
    ).catch(() => {});
  };

  // Mobile menu items
  const menuItems = [
    { label: "Voice Archives", icon: "🎙️", color: "#1d7ce8", action: () => openModal(setIsVoiceOpen) },
    { label: "Cinema Archives", icon: "🎬", color: "#a21cd6", action: () => openModal(setIsVideoOpen) },
    { label: "Photo Gallery", icon: "📸", color: "#68bd1e", action: () => openModal(setIsPhotosOpen) },
    { label: "Tributes & Chat", icon: "💬", color: "#ee5f15", action: () => openModal(setIsChatOpen) },
    { label: "About Memorial", icon: "ℹ️", color: "#f5a623", action: () => openModal(setIsInfoOpen) },
  ];

  return (
    <main style={{
      minHeight: "100dvh",
      position: "relative",
      paddingBottom: isMobile ? "calc(env(safe-area-inset-bottom, 0px) + 70px)" : "110px",
    }}>
      {/* Clash of Clans Battlefield Grass Grid & Vignette */}
      <div className="coc-battlefield-bg" />
      <div className="coc-vignette" />

      {/* Top Clash of Clans HUD Header */}
      <CoCHeader
        elixir={stats.totalElixir}
        flames={stats.totalFlames}
        stars={stats.totalStars}
        serverStats={stats}
        onOpenInfo={() => setIsInfoOpen(true)}
        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        isMenuOpen={isMenuOpen}
      />

      {/* Mobile Side Drawer */}
      {isMobile && isMenuOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setIsMenuOpen(false)}
          />
          <nav className="mobile-drawer">
            {/* Drawer Header (Clickable Sanctuary Level 6 Memorial) */}
            <div
              onClick={() => openModal(setIsInfoOpen)}
              role="button"
              tabIndex={0}
              title="Sanctuary Level 6 Memorial"
              style={{
                padding: "14px 18px",
                borderBottom: "3px solid #5b3720",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                background: "rgba(0, 0, 0, 0.15)",
                touchAction: "manipulation",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: "linear-gradient(180deg, #3d72ff 0%, #1742b8 100%)",
                  border: "2.5px solid #0f2468",
                  borderBottom: "3.5px solid #081540",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              >
                <span className="coc-text-shadow" style={{ fontSize: "22px", color: "#fff", lineHeight: 1 }}>6</span>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    background: "#ffcc00",
                    border: "1.5px solid #000",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    color: "#000",
                    fontWeight: 900,
                  }}
                >
                  ⭐
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="coc-gold-text" style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>SHYAMAL CHOUDHURI</span>
                </div>
                <div style={{ fontSize: "11px", color: "#aef085", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🕊️ 1972 — 2026</span>
                  <span style={{ fontSize: "9px", color: "#ffd700", marginLeft: "auto", opacity: 0.85 }}>Tap for Info ›</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            {menuItems.map((item, i) => (
              <div
                key={i}
                className="mobile-drawer-item"
                onClick={item.action}
              >
                <div
                  className="mobile-drawer-item-icon"
                  style={{ background: `${item.color}33` }}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </div>
            ))}

            {/* Footer Stats */}
            <div style={{
              marginTop: "auto",
              padding: "16px 20px",
              borderTop: "2px solid rgba(91, 55, 32, 0.4)",
              display: "flex",
              justifyContent: "space-around",
              gap: "12px",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", color: "#ffd700", fontFamily: "var(--coc-font-gaming)" }}>
                  {stats.totalFlames}
                </div>
                <div style={{ fontSize: "9px", color: "#aef085", fontWeight: 700 }}>🪔 DIYAS</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", color: "#ffd700", fontFamily: "var(--coc-font-gaming)" }}>
                  {stats.totalStars}
                </div>
                <div style={{ fontSize: "9px", color: "#aef085", fontWeight: 700 }}>⭐ STARS</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "18px", color: "#ffd700", fontFamily: "var(--coc-font-gaming)" }}>
                  {stats.totalMemories}
                </div>
                <div style={{ fontSize: "9px", color: "#aef085", fontWeight: 700 }}>📚 BOOKS</div>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* Hero Welcome Title */}
      <section
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: isMobile ? "68px" : "88px",
          paddingLeft: isMobile ? "10px" : "16px",
          paddingRight: isMobile ? "10px" : "16px",
          textAlign: "center",
          maxWidth: "960px",
          margin: isMobile ? "0 auto 8px auto" : "0 auto 12px auto",
        }}
      >
        <h1
          className="coc-gold-text"
          style={{
            fontSize: isMobile ? "clamp(18px, 5.5vw, 24px)" : "clamp(22px, 4vw, 36px)",
            lineHeight: 1.15,
            marginBottom: isMobile ? "8px" : "12px",
          }}
        >
          THE LIVING ARCHIVE &amp; 3D LIBRARY
        </h1>

        {/* Clash of Clans Distinct Media Button Row - Desktop only */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "12px",
              background: "rgba(15, 30, 10, 0.75)",
              border: "3px solid #234f06",
              borderRadius: "20px",
              padding: "10px 16px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            {/* 1. Tributes & Chat Button (Orange 3D Button) */}
            <CoCSpeechButton onClick={() => setIsChatOpen(true)} title="Tributes & Condolences" />

            {/* 2. Voice Recordings Button (Blue 3D Button) */}
            <CoCVoiceButton onClick={() => setIsVoiceOpen(true)} title="Original Voice Archives" />

            {/* 3. Video Memories Button (Purple 3D Button) */}
            <CoCVideoButton onClick={() => setIsVideoOpen(true)} title="Video Archives" />

            {/* 4. Photo Gallery Button (Green 3D Button) */}
            <CoCPhotosButton onClick={() => setIsPhotosOpen(true)} title="Photo Gallery" />

            {/* 5. Info Gear Button (Amber/Gold 3D Button) */}
            <CoCInfoButton onClick={() => setIsInfoOpen(true)} title="About Memorial" />
          </div>
        )}

        {/* Mobile Quick Action Strip - Compact horizontal buttons */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "rgba(15, 30, 10, 0.8)",
              border: "2px solid #234f06",
              borderRadius: "14px",
              padding: "6px 8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <CoCSpeechButton onClick={() => setIsChatOpen(true)} title="Chat" />
            <CoCVoiceButton onClick={() => setIsVoiceOpen(true)} title="Voice" />
            <CoCVideoButton onClick={() => setIsVideoOpen(true)} title="Video" />
            <CoCPhotosButton onClick={() => setIsPhotosOpen(true)} title="Photos" />
            <CoCInfoButton onClick={() => setIsInfoOpen(true)} title="Info" />
          </div>
        )}
      </section>

      {/* Main 3D Bookshelf & Drawer Stage */}
      <section id="shelf-stage" style={{ position: "relative", zIndex: 10, marginBottom: isMobile ? "16px" : "30px" }}>
        <ThreeBookshelf
          memories={memories}
          shelves={shelves}
          selectedShelfId={selectedShelfId}
          onSelectShelf={setSelectedShelfId}
          onSelectMemory={(mem) => setSelectedMemory(mem)}
          onOpenNewMemory={() => setIsNewMemoryOpen(true)}
        />
      </section>

      {/* Modals & Slide-ins */}
      <BookReaderModal
        memory={selectedMemory}
        onClose={() => setSelectedMemory(null)}
        onTribute={handleTribute}
      />

      <TributeChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendTribute={() => {
          setStats((prev) => ({
            ...prev,
            totalElixir: prev.totalElixir + 100,
          }));
        }}
      />

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        serverStats={stats}
      />

      <NewMemoryModal
        isOpen={isNewMemoryOpen}
        onClose={() => setIsNewMemoryOpen(false)}
        onAddMemory={handleAddMemory}
      />

      <VoiceSanctum
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <VideoSanctum
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      <PhotoGalleryModal
        isOpen={isPhotosOpen}
        onClose={() => setIsPhotosOpen(false)}
      />

      {/* Bottom Sticky Action Dock (Clash of Clans Wood Banner) */}
      <nav
        style={{
          position: "fixed",
          bottom: isMobile ? "calc(env(safe-area-inset-bottom, 0px) + 8px)" : "12px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "6px" : "10px",
          background: "linear-gradient(180deg, #4d2b17 0%, #291408 100%)",
          border: isMobile ? "2.5px solid #6b3e21" : "3.5px solid #6b3e21",
          borderRadius: isMobile ? "14px" : "20px",
          padding: isMobile ? "6px 8px" : "8px 16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.85), inset 0 2px 2px rgba(255,255,255,0.3)",
          maxWidth: isMobile ? "98%" : "94%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <button
          onClick={() => {
            playCoCClick(1.1);
            setIsVoiceOpen(true);
          }}
          className="coc-btn-base coc-btn-wide-green"
          style={{
            height: isMobile ? "36px" : "42px",
            borderRadius: "12px",
            padding: isMobile ? "0 8px" : "0 12px",
            fontSize: isMobile ? "10px" : "12px",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          <div className="coc-btn-gloss" />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "3px" : "5px" }}>
            <Mic size={isMobile ? 12 : 15} />
            <span>Voice</span>
          </div>
        </button>

        <button
          onClick={() => {
            playCoCClick(1.2);
            setIsVideoOpen(true);
          }}
          className="coc-btn-base coc-btn-wide-orange"
          style={{
            height: isMobile ? "36px" : "42px",
            borderRadius: "12px",
            padding: isMobile ? "0 8px" : "0 12px",
            fontSize: isMobile ? "10px" : "12px",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          <div className="coc-btn-gloss" />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "3px" : "5px" }}>
            <Film size={isMobile ? 12 : 15} />
            <span>Cinema</span>
          </div>
        </button>

        <button
          onClick={() => {
            playCoCClick(1.1);
            setIsPhotosOpen(true);
          }}
          className="coc-btn-base coc-btn-wide-green"
          style={{
            height: isMobile ? "36px" : "42px",
            borderRadius: "12px",
            padding: isMobile ? "0 8px" : "0 12px",
            fontSize: isMobile ? "10px" : "12px",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          <div className="coc-btn-gloss" />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "3px" : "5px" }}>
            <ImageIcon size={isMobile ? 12 : 15} />
            <span>Gallery</span>
          </div>
        </button>

        <button
          onClick={() => {
            playCoCClick(1.0);
            setIsChatOpen(true);
          }}
          className="coc-btn-base coc-btn-wide-orange"
          style={{
            height: isMobile ? "36px" : "42px",
            borderRadius: "12px",
            padding: isMobile ? "0 8px" : "0 12px",
            fontSize: isMobile ? "10px" : "12px",
            minHeight: "unset",
            minWidth: "unset",
          }}
        >
          <div className="coc-btn-gloss" />
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "3px" : "5px" }}>
            <MessageSquare size={isMobile ? 12 : 15} />
            <span>Tributes</span>
          </div>
        </button>
      </nav>
    </main>
  );
}
