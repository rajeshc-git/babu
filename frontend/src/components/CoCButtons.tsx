"use client";

import React from "react";
import { playCoCClick } from "@/lib/sound";

interface CoCButtonProps {
  onClick?: () => void;
  title?: string;
  className?: string;
  id?: string;
}

// 1. Tributes & Clan Chat Button (Orange 3D Button)
export function CoCSpeechButton({ onClick, title = "Tributes & Prayers", id }: CoCButtonProps) {
  return (
    <button
      id={id || "btn-coc-chat"}
      type="button"
      title={title}
      className="coc-btn-base coc-btn-orange-sq"
      onClick={() => {
        playCoCClick(1.0);
        onClick?.();
      }}
    >
      <div className="coc-btn-gloss" />
      <svg width="34" height="30" viewBox="0 0 38 34" fill="none" style={{ marginTop: "-2px" }}>
        <path
          d="M4 4H34V24H14L8 30V24H4V4Z"
          fill="#FFFFFF"
          stroke="#141C10"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="14" r="2.2" fill="#141C10" />
        <circle cx="19" cy="14" r="2.2" fill="#141C10" />
        <circle cx="26" cy="14" r="2.2" fill="#141C10" />
      </svg>
      <span className="coc-btn-label">Chat</span>
    </button>
  );
}

// 2. Voice Recordings Button (Blue 3D Button)
export function CoCVoiceButton({ onClick, title = "Original Voice Archives", id }: CoCButtonProps) {
  return (
    <button
      id={id || "btn-coc-voice"}
      type="button"
      title={title}
      className="coc-btn-base coc-btn-blue-sq"
      onClick={() => {
        playCoCClick(1.15);
        onClick?.();
      }}
    >
      <div className="coc-btn-gloss" />
      {/* Crisp Mic Icon */}
      <svg width="32" height="30" viewBox="0 0 24 24" fill="none" style={{ marginTop: "-2px" }}>
        <rect x="9" y="2" width="6" height="11" rx="3" fill="#FFFFFF" stroke="#06234F" strokeWidth="2.5" />
        <path d="M5 10a7 7 0 0014 0" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 17v4m-3 0h6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="coc-btn-label">Voice</span>
    </button>
  );
}

// 3. Video Memories Button (Purple 3D Button)
export function CoCVideoButton({ onClick, title = "Video Archives", id }: CoCButtonProps) {
  return (
    <button
      id={id || "btn-coc-video"}
      type="button"
      title={title}
      className="coc-btn-base coc-btn-purple-sq"
      onClick={() => {
        playCoCClick(1.2);
        onClick?.();
      }}
    >
      <div className="coc-btn-gloss" />
      {/* Video Camera Icon */}
      <svg width="32" height="30" viewBox="0 0 24 24" fill="none" style={{ marginTop: "-2px" }}>
        <rect x="2" y="5" width="13" height="14" rx="3" fill="#FFFFFF" stroke="#2B043B" strokeWidth="2.5" />
        <polygon points="17,8 22,5 22,19 17,16" fill="#FFFFFF" stroke="#2B043B" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <span className="coc-btn-label">Video</span>
    </button>
  );
}

// 4. Photo Gallery Button (Green 3D Button)
export function CoCPhotosButton({ onClick, title = "Photo Gallery", id }: CoCButtonProps) {
  return (
    <button
      id={id || "btn-coc-photos"}
      type="button"
      title={title}
      className="coc-btn-base coc-btn-green-sq"
      onClick={() => {
        playCoCClick(1.1);
        onClick?.();
      }}
    >
      <div className="coc-btn-gloss" />
      {/* Photo Frame Icon */}
      <svg width="32" height="30" viewBox="0 0 24 24" fill="none" style={{ marginTop: "-2px" }}>
        <rect x="3" y="4" width="18" height="16" rx="3" fill="#FFFFFF" stroke="#162C08" strokeWidth="2.5" />
        <circle cx="8.5" cy="8.5" r="1.8" fill="#162C08" />
        <path d="M21 15l-5-5L5 20" stroke="#162C08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="coc-btn-label">Photos</span>
    </button>
  );
}

// 5. Info Gear Button (Orange/Gold 3D Button - Direct replica of reference image)
export function CoCInfoButton({ onClick, title = "Sanctuary Info", id }: CoCButtonProps) {
  return (
    <button
      id={id || "btn-coc-info"}
      type="button"
      title={title}
      className="coc-btn-base coc-btn-orange-sq"
      onClick={() => {
        playCoCClick(0.95);
        onClick?.();
      }}
    >
      <div className="coc-btn-gloss" />
      {/* Cartoon Gear Icon */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ marginTop: "-2px" }}>
        <path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          fill="#FFFFFF"
          stroke="#141C10"
          strokeWidth="2.5"
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
          fill="#FFFFFF"
          stroke="#141C10"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span className="coc-btn-label">Info</span>
    </button>
  );
}

// 6. Elixir Resource Bar Component (Clash of Clans Elixir Pill)
export function CoCElixirBar({
  value = 2400,
  max = 5000,
  onClick,
}: {
  value: number;
  max?: number;
  onClick?: () => void;
}) {
  const percentage = Math.min(100, Math.max(10, (value / max) * 100));
  const formatted = value.toLocaleString();

  return (
    <div
      className="coc-resource-bar"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      title={`Elixir Tribute: ${formatted}`}
    >
      <div className="coc-fill-elixir" style={{ width: `${percentage}%` }}>
        <div className="coc-fill-highlight" />
      </div>
      <div className="coc-resource-num">{formatted}</div>
      {/* 3D Purple Elixir Droplet */}
      <div className="coc-droplet-bulb">
        <svg viewBox="0 0 44 48" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
          <path
            d="M22 2C22 2 6 20 6 32C6 40.8366 13.1634 46 22 46C30.8366 46 38 40.8366 38 32C38 20 22 2 22 2Z"
            fill="url(#elixirGradient)"
            stroke="#1b031b"
            strokeWidth="3.5"
          />
          <ellipse cx="16" cy="28" rx="6" ry="10" transform="rotate(-25 16 28)" fill="#FFFFFF" fillOpacity="0.65" />
          <circle cx="14" cy="22" r="3" fill="#FFFFFF" fillOpacity="0.85" />
          <defs>
            <linearGradient id="elixirGradient" x1="6" y1="2" x2="38" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff70f8" />
              <stop offset="0.4" stopColor="#d825d5" />
              <stop offset="1" stopColor="#7a0a77" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// 7. Green Life / Dark Elixir Resource Bar (Clash of Clans Dark Elixir / Builder Elixir Pill)
export function CoCGreenResourceBar({
  value = 2400,
  max = 5000,
  onClick,
}: {
  value: number;
  max?: number;
  onClick?: () => void;
}) {
  const percentage = Math.min(100, Math.max(10, (value / max) * 100));
  const formatted = value.toLocaleString();

  return (
    <div
      className="coc-resource-bar"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      title={`Sacred Life Flames: ${formatted}`}
    >
      <div className="coc-fill-green" style={{ width: `${percentage}%` }}>
        <div className="coc-fill-highlight" />
      </div>
      <div className="coc-resource-num">{formatted}</div>
      {/* 3D Green Droplet */}
      <div className="coc-droplet-bulb">
        <svg viewBox="0 0 44 48" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
          <path
            d="M22 2C22 2 6 20 6 32C6 40.8366 13.1634 46 22 46C30.8366 46 38 40.8366 38 32C38 20 22 2 22 2Z"
            fill="url(#greenDropGradient)"
            stroke="#0e2304"
            strokeWidth="3.5"
          />
          <ellipse cx="16" cy="28" rx="6" ry="10" transform="rotate(-25 16 28)" fill="#FFFFFF" fillOpacity="0.65" />
          <circle cx="14" cy="22" r="3" fill="#FFFFFF" fillOpacity="0.85" />
          <defs>
            <linearGradient id="greenDropGradient" x1="6" y1="2" x2="38" y2="46" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ccff52" />
              <stop offset="0.4" stopColor="#70d616" />
              <stop offset="1" stopColor="#306905" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
