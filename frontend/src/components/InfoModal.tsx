"use client";

import React from "react";
import { playCoCClick } from "@/lib/sound";
import { Award, Heart } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStats?: {
    memoryAllocKb: number;
    goVersion: string;
    serverUptime: string;
    activeRoutines: number;
    totalMemories: number;
    totalElixir: number;
    totalFlames: number;
  } | null;
}

export function InfoModal({ isOpen, onClose, serverStats }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playCoCClick(0.9);
          onClose();
        }
      }}
    >
      {/* Clash of Clans Info Window */}
      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
        }}
      >
        {/* Header */}
        <div className="coc-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Award color="#ffd700" size={24} />
            <span className="coc-gold-text" style={{ fontSize: "18px", letterSpacing: "0.5px" }}>
              ABOUT THIS MEMORIAL
            </span>
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

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            color: "#302216",
          }}
        >
          {/* Memorial Banner */}
          <div
            style={{
              background: "linear-gradient(180deg, #fdf9ed 0%, #ecdcc0 100%)",
              border: "3px solid #b89868",
              borderRadius: "14px",
              padding: "16px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #ffcc00",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                flexShrink: 0,
                backgroundColor: "#201208",
              }}
            >
              <img
                src="/Assets/Image/Rajesh Father.png"
                alt="Shyamal Choudhuri"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
              />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--coc-font-serif)", fontSize: "18px", color: "#3d2010" }}>
                Shyamal Choudhuri
              </h3>
              <div style={{ fontSize: "12px", color: "#7a5026", fontWeight: 700 }}>
                1972 — 2026 • In Loving Memory
              </div>
              <p style={{ fontSize: "12px", color: "#4d3829", marginTop: "4px", lineHeight: "1.4" }}>
                A digital memorial sanctuary honoring his boundless kindness, quiet strength, and warm smile.
              </p>
            </div>
          </div>

          {/* Memorial Attributes Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, #3d2415 0%, #25140b 100%)",
                border: "2px solid #5b3720",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#ffffff",
              }}
            >
              <div style={{ fontSize: "11px", color: "#ffdf40", fontWeight: 700, letterSpacing: "0.5px" }}>
                ETERNAL PRESENCE
              </div>
              <div className="coc-text-shadow" style={{ fontSize: "18px", marginTop: "2px", color: "#ffffff" }}>
                Guiding Light
              </div>
              <div style={{ fontSize: "11px", color: "#a5f57a" }}>Forever In Our Hearts</div>
            </div>

            <div
              style={{
                background: "linear-gradient(180deg, #3d2415 0%, #25140b 100%)",
                border: "2px solid #5b3720",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#ffffff",
              }}
            >
              <div style={{ fontSize: "11px", color: "#ffdf40", fontWeight: 700, letterSpacing: "0.5px" }}>
                ARCHIVED MEMORIES
              </div>
              <div className="coc-text-shadow" style={{ fontSize: "18px", marginTop: "2px", color: "#ffffff" }}>
                {serverStats ? `${serverStats.totalMemories} Books` : "24 Books"}
              </div>
              <div style={{ fontSize: "11px", color: "#ffd700" }}>3D Bookshelf Active</div>
            </div>
          </div>

          {/* Memorial Sanctum Guidance */}
          <div
            style={{
              background: "linear-gradient(180deg, #2b1a10 0%, #170d07 100%)",
              border: "2px solid #5b3720",
              borderRadius: "14px",
              padding: "16px",
              color: "#ffffff",
              boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Heart size={18} color="#ffaa00" />
              <span className="coc-text-shadow" style={{ color: "#ffd700", fontSize: "14px" }}>
                CHERISHING HIS MEMORY
              </span>
            </div>

            <p style={{ fontSize: "12px", color: "#e8dcce", lineHeight: "1.5", marginBottom: "12px" }}>
              This memorial is lovingly dedicated to Shyamal Choudhuri. Here, family and friends can pull books from the 3D bookshelf, listen to his authentic voice notes, view cherished photos, and light sacred flames that burn bright in his memory.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 4px", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", color: "#ffd700", fontWeight: 700 }}>HONOR</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                  Respect
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 4px", borderRadius: "8px" }}>
                <div style={{ fontSize: "10px", color: "#aef085", fontWeight: 700 }}>SACRED FLAME</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#fff", marginTop: "2px" }}>
                  Live Diya
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.4)", padding: "8px 4px", borderRadius: "8px" }}>
                <div style={{ fontSize: "9px", color: "#64b5f6", fontWeight: 700 }}>VOICE ARCHIVE</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", marginTop: "2px", whiteSpace: "nowrap" }}>
                  Audio Notes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
