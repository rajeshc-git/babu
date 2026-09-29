"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { playCoCClick } from "@/lib/sound";
import {
  Image as ImageIcon,
  X,
  ZoomIn,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Heart,
  Calendar,
  Layers,
} from "lucide-react";
import FALLBACK_PHOTOS from "@/data/photos.json";

export interface PhotoItem {
  url: string;
  title: string;
  category: "life" | "belongings" | "lastDay" | "lastRide" | "medicine" | string;
  categoryName: string;
  isSensitive: boolean;
}

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "all", label: "🌟 All Memories", icon: "🖼️" },
  { id: "life", label: "📸 Life Moments", icon: "🌿" },
  { id: "belongings", label: "👓 Belongings", icon: "✨" },
  { id: "lastRide", label: "Solemn Day (March 6)", icon: "🖤", isSensitive: true },
  { id: "lastDay", label: "🕊️ Final Journey", icon: "🕯️", isSensitive: true },
  { id: "medicine", label: "💊 Care & Records", icon: "📋" },
];

export function PhotoGalleryModal({ isOpen, onClose }: PhotoGalleryModalProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(FALLBACK_PHOTOS as PhotoItem[]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSensitive, setShowSensitive] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Fetch live photos from backend API
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  // Filtered photos based on category and search query with bulletproof fallbacks
  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.filter((p) => {
      if (!p) return false;
      const cat = p.category || "life";
      const title = p.title || "";
      const catName = p.categoryName || "";
      const matchCat = selectedCategory === "all" || cat === selectedCategory;
      const matchQuery =
        searchQuery.trim() === "" ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [photos, selectedCategory, searchQuery]);

  // Category counts with bulletproof fallbacks
  const counts = useMemo(() => {
    if (!Array.isArray(photos)) return { all: 0 };
    const c: Record<string, number> = { all: photos.length };
    photos.forEach((p) => {
      if (p) {
        const cat = p.category || "life";
        c[cat] = (c[cat] || 0) + 1;
      }
    });
    return c;
  }, [photos]);

  // Touch swipe support for lightbox (MUST be called before any early return)
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  const handleLightboxTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY };
    }
  }, []);

  const handleLightboxTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current || selectedPhotoIndex === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchRef.current.startX;
    const dy = touch.clientY - touchRef.current.startY;
    touchRef.current = null;

    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) {
        // Swipe left -> next
        playCoCClick(1.0);
        setSelectedPhotoIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : null));
      } else {
        // Swipe right -> prev
        playCoCClick(1.0);
        setSelectedPhotoIndex((prev) => (prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null));
      }
    } else if (Math.abs(dy) > 80 && dy > 0) {
      // Swipe down -> close lightbox
      setSelectedPhotoIndex(null);
    }
  }, [selectedPhotoIndex, filteredPhotos.length]);

  if (!isOpen) return null;

  const handleToggleReveal = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playCoCClick(1.0);
    setRevealedIds((prev) => ({ ...prev, [url]: !prev[url] }));
  };

  const handleSelectPhoto = (index: number) => {
    playCoCClick(1.1);
    setSelectedPhotoIndex(index);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
    playCoCClick(1.0);
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % filteredPhotos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
    playCoCClick(1.0);
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  };

  const currentPhoto =
    selectedPhotoIndex !== null && filteredPhotos[selectedPhotoIndex]
      ? filteredPhotos[selectedPhotoIndex]
      : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playCoCClick(0.9);
          onClose();
        }
      }}
    >
      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: "1080px",
          height: "90vh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div className="coc-modal-header" style={{ padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ImageIcon color="#ffd700" size={24} />
            <div>
              <span className="coc-gold-text" style={{ fontSize: "17px", letterSpacing: "0.5px" }}>
                PHOTO GALLERY &amp; ARCHIVES
              </span>
              <div style={{ fontSize: "11px", color: "#aef085", fontWeight: 700 }}>
                {photos.length} Cherished Photographs &amp; Documents
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playCoCClick(0.9);
              onClose();
            }}
            className="coc-modal-close"
          >
            ✕
          </button>
        </div>

        {/* Controls Bar: Category Tabs, Search & Sensitive Content Toggle */}
        <div
          style={{
            background: "linear-gradient(180deg, #2b180d 0%, #1a0e07 100%)",
            borderBottom: "3px solid #3d2415",
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Category Tabs Row (Smooth Touch Horizontal Scroll, never squished) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "4px",
              flexWrap: "nowrap",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = counts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playCoCClick(1.0);
                    setSelectedCategory(cat.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    flexShrink: 0,
                    border: isSelected ? "2px solid #ffd700" : "1.5px solid #5b3720",
                    background: isSelected
                      ? "linear-gradient(180deg, #ff9e24 0%, #b34305 100%)"
                      : "rgba(0, 0, 0, 0.4)",
                    color: isSelected ? "#ffffff" : "#d0c0ad",
                    boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.5)" : "none",
                    touchAction: "manipulation",
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      background: isSelected ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.1)",
                      padding: "1px 6px",
                      borderRadius: "10px",
                      fontSize: "10px",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & Sensitive Content Toggle (Matching 38px Height) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Search Input (Exact 38px height to match Eye Icon) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                height: "38px",
                background: "rgba(0, 0, 0, 0.45)",
                border: "2px solid #5b3720",
                borderRadius: "10px",
                padding: "0 12px",
                flex: 1,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              <Search size={16} color="#ffd700" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search moments, dates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  width: "100%",
                  minWidth: 0,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#a08060",
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: "0 4px",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sensitive Content Reveal Button (Matching Exact 38px Height) */}
            <button
              onClick={() => {
                playCoCClick(1.0);
                setShowSensitive((prev) => !prev);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: showSensitive
                  ? "linear-gradient(180deg, #3d6b1a 0%, #1f4208 100%)"
                  : "linear-gradient(180deg, #4d2b17 0%, #291408 100%)",
                border: showSensitive ? "2px solid #7cd62b" : "2px solid #6b3f20",
                color: showSensitive ? "#aef085" : "#e0caa8",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                flexShrink: 0,
                boxSizing: "border-box",
                touchAction: "manipulation",
              }}
              title={showSensitive ? "Sensitive Photos: Revealed (Click to blur)" : "Sensitive Photos: Respectfully Blurred (Click to reveal)"}
              aria-label={showSensitive ? "Sensitive Photos: Revealed" : "Sensitive Photos: Respectfully Blurred"}
            >
              {showSensitive ? <Eye size={18} color="#aef085" /> : <EyeOff size={18} color="#e0caa8" />}
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(140px, 45vw), 1fr))",
            gap: "10px",
            backgroundColor: "#e8dcbe",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filteredPhotos.map((p, idx) => {
            const isBlurred = p.isSensitive && !showSensitive && !revealedIds[p.url];

            return (
              <div
                key={p.url + idx}
                onClick={() => handleSelectPhoto(idx)}
                style={{
                  position: "relative",
                  height: "190px",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: p.isSensitive ? "3px solid #734825" : "3px solid #8c6843",
                  boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  backgroundColor: "#1c1109",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Image Container with uncropped head position */}
                <div style={{ position: "relative", flex: 1, overflow: "hidden", backgroundColor: "#150c06" }}>
                  <img
                    src={p.url}
                    alt={p.title || "Archive Moment"}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/Assets/Image/Rajesh Father.png";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top center",
                      filter: isBlurred ? "blur(16px) brightness(0.55)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                  />

                  {/* Sensitive Content Overlay */}
                  {isBlurred && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px",
                        textAlign: "center",
                        background: "rgba(20, 10, 5, 0.45)",
                        backdropFilter: "blur(6px)",
                        color: "#fff",
                      }}
                      onClick={(e) => handleToggleReveal(p.url, e)}
                    >
                      <ShieldAlert size={22} color="#ffd700" style={{ marginBottom: "4px" }} />
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#ffd700" }}>
                        Solemn Memorial
                      </div>
                      <div style={{ fontSize: "10px", color: "#ddd", marginTop: "2px" }}>
                        Tap to reveal
                      </div>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      background: "rgba(20, 10, 5, 0.85)",
                      border: "1px solid #ffcc00",
                      borderRadius: "6px",
                      padding: "2px 6px",
                      fontSize: "10px",
                      color: "#ffd700",
                      fontWeight: 700,
                    }}
                  >
                    {p.category === "life"
                      ? "📸 Life"
                      : p.category === "belongings"
                      ? "👓 Relic"
                      : p.category === "lastRide"
                      ? "🕯️ March 6"
                      : p.category === "lastDay"
                      ? "🕊️ Farewell"
                      : p.category === "family"
                      ? "🏡 Family"
                      : "📸 Moment"}
                  </div>
                </div>

                {/* Card Title Footer */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #3d2415 0%, #25140b 100%)",
                    padding: "6px 8px",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: "#f4ead4",
                    }}
                  >
                    {p.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Zoom Overlay (Fullscreen, uncropped view with Next/Prev + Swipe) */}
      {currentPhoto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            backgroundColor: "rgba(0, 0, 0, 0.94)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
            animation: "fadeIn 0.15s ease-out",
            touchAction: "none",
          }}
          onClick={() => setSelectedPhotoIndex(null)}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          {/* Top Bar with Title & Close */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              right: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 100,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ fontSize: "16px", color: "#ffd700", fontWeight: 800, textShadow: "0 2px 4px #000" }}>
                {currentPhoto.title}
              </h3>
              <div style={{ fontSize: "12px", color: "#aef085", fontWeight: 600 }}>
                {currentPhoto.categoryName} • Photo {selectedPhotoIndex! + 1} of {filteredPhotos.length}
              </div>
            </div>

            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="coc-modal-close"
              title="Close Fullscreen View"
            >
              ✕
            </button>
          </div>

          {/* Previous Button */}
          <button
            onClick={handlePrevPhoto}
            style={{
              position: "absolute",
              left: "20px",
              zIndex: 100,
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(30, 15, 5, 0.8)",
              border: "2px solid #ffd700",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            }}
            title="Previous Photo"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Main Uncropped Image */}
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "80vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.url}
              alt={currentPhoto.title}
              style={{
                maxWidth: "88vw",
                maxHeight: "78vh",
                objectFit: "contain",
                borderRadius: "14px",
                border: "4px solid #d4af37",
                boxShadow: "0 0 50px rgba(0,0,0,0.95)",
                backgroundColor: "#120a05",
              }}
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPhoto}
            style={{
              position: "absolute",
              right: "20px",
              zIndex: 100,
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(30, 15, 5, 0.8)",
              border: "2px solid #ffd700",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
            }}
            title="Next Photo"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
