"use client";

import React, { useState, useEffect, useRef } from "react";
import { playCoCClick, playElixirCollect } from "@/lib/sound";
import { BookPlus, Volume2, Image as ImageIcon, Palette, Play, Pause, X } from "lucide-react";

interface VoiceItem {
  fileName: string;
  title: string;
  url: string;
  sizeKb: number;
}

interface PhotoItem {
  url: string;
  title: string;
  category?: string;
}

interface NewMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (newMemory: {
    title: string;
    shelfId: string;
    era: string;
    date: string;
    excerpt: string;
    story: string;
    quote: string;
    imagePath?: string;
    audioPath?: string;
    color?: string;
  }) => void;
}

const COLOR_PALETTE = [
  { label: "Sacred Gold", hex: "#ffd700" },
  { label: "Clan Amber", hex: "#e06522" },
  { label: "Jade Green", hex: "#2a623d" },
  { label: "Royal Amethyst", hex: "#8b3a82" },
  { label: "Azure Cobalt", hex: "#1b4d89" },
  { label: "Ruby Crimson", hex: "#a81c1c" },
];

const DEFAULT_PHOTOS = [
  { url: "/Assets/Image/Rajesh Father.png", title: "Primary Portrait" },
  { url: "/Assets/Image/IMG20221009141535.jpg", title: "Fatherhood & Warmth" },
  { url: "/Assets/Image/IMG20241129222859.jpg", title: "Festive Evening" },
  { url: "/Assets/Image/IMG20241215203600.jpg", title: "Family Gathering" },
  { url: "/Assets/Image/IMG20260103201021.jpg", title: "Winter Memories" },
  { url: "/Assets/Image/IMG_7156.PNG", title: "Eternal Remembrance" },
];

export function NewMemoryModal({ isOpen, onClose, onAddMemory }: NewMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [shelfId, setShelfId] = useState("roots");
  const [era, setEra] = useState("Cherished Book");
  const [date, setDate] = useState("Recent");
  const [excerpt, setExcerpt] = useState("");
  const [story, setStory] = useState("");
  const [quote, setQuote] = useState("");
  const [selectedImage, setSelectedImage] = useState("/Assets/Image/Rajesh Father.png");
  const [selectedAudio, setSelectedAudio] = useState("");
  const [selectedColor, setSelectedColor] = useState("#e06522");

  // Dynamic voice list and preview
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>(DEFAULT_PHOTOS);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      }
      return;
    }

    // Fetch live voices from backend
    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVoices(data);
        }
      })
      .catch(() => {});

    // Fetch all live photos from backend (all 147 archive photos)
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPhotos(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePreviewAudio = (url: string) => {
    playCoCClick(1.1);
    if (!audioPreviewRef.current) return;

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.src = url;
      audioPreviewRef.current.play().then(() => setIsPlayingPreview(true)).catch(() => {});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !story.trim()) return;

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    playElixirCollect();
    onAddMemory({
      title: title.trim(),
      shelfId,
      era: era.trim(),
      date: date.trim(),
      excerpt: excerpt.trim() || title.trim(),
      story: story.trim(),
      quote: quote.trim(),
      imagePath: selectedImage || "/Assets/Image/Rajesh Father.png",
      audioPath: selectedAudio || undefined,
      color: selectedColor,
    });

    setTitle("");
    setExcerpt("");
    setStory("");
    setQuote("");
    setSelectedAudio("");
    setIsPlayingPreview(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 85,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        animation: "fadeIn 0.2s ease-out",
        overflowY: "auto",
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
          maxWidth: "600px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          maxHeight: "94vh",
          overflowY: "auto",
        }}
      >
        <audio ref={audioPreviewRef} onEnded={() => setIsPlayingPreview(false)} />

        {/* Modal Header */}
        <div className="coc-modal-header" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BookPlus color="#ffd700" size={22} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
            <span className="coc-gold-text" style={{ fontSize: "16px", letterSpacing: "0.5px" }}>
              INSCRIBE NEW BOOK
            </span>
          </div>

          <button
            onClick={() => {
              playCoCClick(0.9);
              onClose();
            }}
            className="coc-modal-close"
            style={{ width: "34px", height: "34px", fontSize: "16px" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Book Title */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "block", marginBottom: "4px" }}>
              Book Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. A Morning Walk with Baba"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="coc-input-field"
            />
          </div>

          {/* Category Tag & Era */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "block", marginBottom: "4px" }}>
                Category Tag
              </label>
              <select
                value={shelfId}
                onChange={(e) => setShelfId(e.target.value)}
                className="coc-select-field"
              >
                <option value="roots">🌱 Roots & Heritage</option>
                <option value="family">🏡 Family Gatherings</option>
                <option value="wisdom">📜 Guiding Wisdom</option>
                <option value="whispers">🎙️ Spoken Voice</option>
                <option value="eternal">⭐ Sacred Legacy</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "block", marginBottom: "4px" }}>
                Era / Timeline
              </label>
              <input
                type="text"
                placeholder="e.g. 2012 — 2018"
                value={era}
                onChange={(e) => setEra(e.target.value)}
                className="coc-input-field"
              />
            </div>
          </div>

          {/* Book Spine Leather Color Selector */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Palette size={16} />
              <span>Book Spine Color</span>
            </label>
            <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    playCoCClick(1.0);
                    setSelectedColor(c.hex);
                  }}
                  title={c.label}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: c.hex,
                    border: selectedColor === c.hex ? "3.5px solid #000" : "2px solid #8c6843",
                    boxShadow: selectedColor === c.hex ? "0 0 10px rgba(0,0,0,0.6)" : "none",
                    cursor: "pointer",
                    transform: selectedColor === c.hex ? "scale(1.18)" : "scale(1.0)",
                    transition: "transform 0.15s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Photograph Picker from all 147 GitHub photos */}
          <div>
            <div style={{ marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "flex", alignItems: "center", gap: "6px" }}>
                <ImageIcon size={16} />
                <span>Attach Photograph ({photos.length} Archive Photos)</span>
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                padding: "8px 4px",
                background: "rgba(0,0,0,0.06)",
                borderRadius: "12px",
                border: "1.5px solid #d4c0a5",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    playCoCClick(1.0);
                    setSelectedImage(p.url);
                  }}
                  title={p.title || `Photo ${idx + 1}`}
                  style={{
                    position: "relative",
                    width: "68px",
                    height: "68px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: selectedImage === p.url ? "3.5px solid #ffcc00" : "2px solid #8c6843",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: selectedImage === p.url ? "0 0 10px #ffcc00, 0 3px 6px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.2)",
                    transform: selectedImage === p.url ? "scale(1.05)" : "scale(1.0)",
                    transition: "transform 0.12s ease",
                  }}
                >
                  <img
                    src={p.url}
                    alt={p.title || "Archive Photo"}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Spoken Voice Note Attachment */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Volume2 size={16} />
              <span>Attach Spoken Voice Note (Optional)</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                value={selectedAudio}
                onChange={(e) => {
                  setSelectedAudio(e.target.value);
                  if (isPlayingPreview && audioPreviewRef.current) {
                    audioPreviewRef.current.pause();
                    setIsPlayingPreview(false);
                  }
                }}
                className="coc-select-field"
                style={{ flex: 1 }}
              >
                <option value="">(No Voice Note — Text/Photo Only)</option>
                {voices.map((v, i) => (
                  <option key={i} value={v.url}>
                    🎙️ {v.title}
                  </option>
                ))}
              </select>

              {selectedAudio && (
                <button
                  type="button"
                  onClick={() => handleTogglePreviewAudio(selectedAudio)}
                  title={isPlayingPreview ? "Pause Audio Preview" : "Listen Preview"}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(180deg, #ff7a18 0%, #d44a04 100%)",
                    border: "2.5px solid #5b280b",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {isPlayingPreview ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: "2px" }} />}
                </button>
              )}
            </div>
          </div>

          {/* Full Narrative & Story */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "block", marginBottom: "4px" }}>
              Full Narrative & Story *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what occurred, his words, gestures, and the memory you carry..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="coc-input-field"
              style={{
                minHeight: "100px",
                resize: "vertical",
                lineHeight: "1.45",
              }}
            />
          </div>

          {/* Memorable Quote */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "#3d2010", display: "block", marginBottom: "4px" }}>
              Memorable Quote / Saying
            </label>
            <input
              type="text"
              placeholder="A guiding quote from him"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="coc-input-field"
            />
          </div>

          <button
            type="submit"
            className="coc-btn-base coc-btn-wide-green"
            style={{
              width: "100%",
              minHeight: "48px",
              borderRadius: "14px",
              marginTop: "4px",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div className="coc-btn-gloss" />
            <span className="coc-text-shadow">✨ Inscribe Book to Library</span>
          </button>
        </form>
      </div>
    </div>
  );
}
