"use client";

import React, { useRef } from "react";
import { playCoCClick } from "@/lib/sound";
import { Film, X, Play } from "lucide-react";

interface VideoSanctumProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoSanctum({ isOpen, onClose }: VideoSanctumProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
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
          maxWidth: "760px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
        }}
      >
        <div className="coc-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Film color="#ffd700" size={22} />
            <span className="coc-gold-text" style={{ fontSize: "17px", letterSpacing: "0.5px" }}>
              SHYAMAL CHOUDHURI CINEMA ARCHIVES
            </span>
          </div>

          <button
            onClick={() => {
              playCoCClick(0.9);
              if (videoRef.current) videoRef.current.pause();
              onClose();
            }}
            className="coc-modal-close"
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Video Player in Ornate Frame */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              backgroundColor: "#000",
              borderRadius: "14px",
              overflow: "hidden",
              border: "4px solid #5b3720",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              poster="/Assets/Image/Rajesh Father.png"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            >
              <source
                src="/Assets/Video/WhatsApp Video 2026-03-14 at 3.45.57 PM.mp4"
                type="video/mp4"
              />
              Your browser does not support HTML5 video playback.
            </video>
          </div>

          <div
            style={{
              background: "linear-gradient(180deg, #fdf9ed 0%, #ecdcc0 100%)",
              border: "2px solid #b89868",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "#3d2010",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: 800, fontFamily: "var(--coc-font-gaming)" }}>
              A Life of Gentle Smiles &amp; Eternal Legacy
            </div>
            <p style={{ fontSize: "13px", color: "#543924", marginTop: "4px", lineHeight: "1.4" }}>
              Archival video footage capturing the enduring spirit, warmth, and laughter of Shyamal Choudhuri.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
