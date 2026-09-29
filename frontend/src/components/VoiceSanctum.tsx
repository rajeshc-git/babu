"use client";

import React, { useState, useEffect, useRef } from "react";
import { playCoCClick } from "@/lib/sound";
import { Mic, Play, Pause, Volume2, X, Music2 } from "lucide-react";

interface VoiceNote {
  fileName: string;
  title: string;
  url: string;
  sizeKb: number;
}

interface VoiceSanctumProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceSanctum({ isOpen, onClose }: VoiceSanctumProps) {
  const [voices, setVoices] = useState<VoiceNote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTrack, setCurrentTrack] = useState<VoiceNote | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/voices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVoices(data);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const filteredVoices = voices.filter((v) =>
    searchQuery.trim() === "" ||
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayVoice = (v: VoiceNote) => {
    playCoCClick(1.1);
    if (currentTrack?.fileName === v.fileName) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(v);
      if (audioRef.current) {
        audioRef.current.src = v.url;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 75,
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
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: "640px",
          height: "82vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div className="coc-modal-header" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
            <Mic color="#ffd700" size={24} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <span className="coc-gold-text" style={{ fontSize: "16px", letterSpacing: "0.5px", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                VOICE ARCHIVES
              </span>
              <div style={{ fontSize: "11px", color: "#aef085", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {voices.length} Authentically Preserved Recordings
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playCoCClick(0.9);
              if (audioRef.current) audioRef.current.pause();
              onClose();
            }}
            className="coc-modal-close"
            style={{ flexShrink: 0, marginLeft: "8px" }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar for 117 Voice Notes */}
        <div
          style={{
            background: "linear-gradient(180deg, #2b180d 0%, #1a0e07 100%)",
            borderBottom: "3px solid #3d2415",
            padding: "8px 16px",
          }}
        >
          <input
            type="text"
            placeholder="Search across 117 recordings (date, call time)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(0, 0, 0, 0.45)",
              border: "1.5px solid #5b3720",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "#fff",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </div>

        {/* Audio List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: "#e8dcbe",
          }}
        >
          {filteredVoices.map((v, i) => {
            const isThisPlaying = currentTrack?.fileName === v.fileName && isPlaying;
            return (
              <div
                key={v.fileName}
                onClick={() => handlePlayVoice(v)}
                style={{
                  background: isThisPlaying
                    ? "linear-gradient(180deg, #ffe082 0%, #ffca28 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #f6f0e4 100%)",
                  border: isThisPlaying ? "2.5px solid #b86200" : "2px solid #b8a68a",
                  borderRadius: "14px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  cursor: "pointer",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.06)",
                  transition: "transform 0.1s ease",
                  minWidth: 0,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isThisPlaying
                        ? "linear-gradient(180deg, #ff9b26 0%, #b83307 100%)"
                        : "linear-gradient(180deg, #9ae234 0%, #468612 100%)",
                      border: "2px solid #141c10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {isThisPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: "2px" }} />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#3d2010",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                      title={v.title}
                    >
                      {v.title || `Voice Note #${i + 1}`}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#7a5430",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      Original Voice Capture • {v.sizeKb} KB
                    </div>
                  </div>
                </div>

                {isThisPlaying && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      height: "18px",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ width: "3px", height: "14px", background: "#e65100", borderRadius: "2px" }} />
                    <span style={{ width: "3px", height: "18px", background: "#e65100", borderRadius: "2px" }} />
                    <span style={{ width: "3px", height: "10px", background: "#e65100", borderRadius: "2px" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
