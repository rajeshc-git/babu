"use client";

import React, { useRef, useEffect, useState } from "react";
import { playCoCClick, playGemStar } from "@/lib/sound";
import { Download, X, Share2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface MemorialCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  tribute: {
    name: string;
    relation?: string;
    message: string;
    created_at?: string;
  } | null;
}

export function MemorialCardModal({ isOpen, onClose, tribute }: MemorialCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (!isOpen || !tribute) return;

    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High resolution 1200 x 750 (16:10 ratio)
    const W = 1200;
    const H = 750;
    canvas.width = W;
    canvas.height = H;

    // Load portrait image
    const portraitImg = new Image();
    portraitImg.crossOrigin = "anonymous";
    portraitImg.src = "/Assets/Image/Rajesh Father.png";

    const drawCard = () => {
      // 1. Rich CoC Parchment / Deep Sanctum Background
      const bgGrad = ctx.createLinearGradient(0, 0, W, H);
      bgGrad.addColorStop(0, "#1f0f06");
      bgGrad.addColorStop(0.35, "#3d2010");
      bgGrad.addColorStop(0.7, "#281206");
      bgGrad.addColorStop(1, "#120702");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Subtle warm radial aura in center
      const radialGlow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 550);
      radialGlow.addColorStop(0, "rgba(255, 170, 0, 0.12)");
      radialGlow.addColorStop(0.7, "rgba(255, 120, 0, 0.04)");
      radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, W, H);

      // 2. Ornate Clash of Clans Gilded Borders
      // Outer dark trim
      ctx.strokeStyle = "#140702";
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, W - 16, H - 16);

      // 3D Gold outer border
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, W - 44, H - 44);

      // Inner thin gold pinstripe
      ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, W - 64, H - 64);

      // Corner gold brackets
      const drawCornerBracket = (x: number, y: number, angle: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.stroke();

        // Corner star dot
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCornerBracket(42, 42, 0);
      drawCornerBracket(W - 42, 42, 90);
      drawCornerBracket(W - 42, H - 42, 180);
      drawCornerBracket(42, H - 42, 270);

      // 3. Top Header: Memorial Sanctum Title
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 20px 'Cinzel', serif, Georgia";
      ctx.letterSpacing = "2px";
      ctx.fillText("SACRED MEMORIAL CERTIFICATE OF TRIBUTE", W / 2, 75);

      // Main Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 38px 'Cinzel', serif, Georgia";
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
      ctx.fillText("SHYAMAL CHOUDHURI", W / 2, 125);
      ctx.shadowColor = "transparent";

      // Subtitle Lifespan
      ctx.fillStyle = "#aef085";
      ctx.font = "600 18px 'Inter', sans-serif";
      ctx.fillText("🕊️ 1972 — 2026 • Eternal Peace & Love 🕊️", W / 2, 155);

      // Gilded Divider with Center Diamond
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 220, 175);
      ctx.lineTo(W / 2 - 20, 175);
      ctx.moveTo(W / 2 + 20, 175);
      ctx.lineTo(W / 2 + 220, 175);
      ctx.stroke();

      // Center Star / Diamond
      ctx.fillStyle = "#ffcc00";
      ctx.beginPath();
      ctx.arc(W / 2, 175, 7, 0, Math.PI * 2);
      ctx.fill();

      // 4. Circular Portrait of Shyamal Choudhuri on left side or top center
      const portraitRadius = 60;
      const portraitX = W / 2;
      const portraitY = 250;

      if (portraitImg.complete && portraitImg.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(portraitX, portraitY, portraitRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          portraitImg,
          portraitX - portraitRadius,
          portraitY - portraitRadius,
          portraitRadius * 2,
          portraitRadius * 2
        );
        ctx.restore();

        // 3D Gold Ring Border around portrait
        ctx.strokeStyle = "#ffd700";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(portraitX, portraitY, portraitRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 5. Inscribed Tribute Message Box
      const rawText = tribute.message ? `“${tribute.message.trim()}”` : "“Forever cherished in our hearts.”";
      const maxWidth = 860;
      const maxLines = 5;
      let fontSize = 24;
      let lines: string[] = [];

      ctx.font = `italic ${fontSize}px "Georgia", serif`;
      while (fontSize >= 14) {
        ctx.font = `italic ${fontSize}px "Georgia", serif`;
        lines = [];
        const words = rawText.split(" ");
        let currentLine = "";

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine + (currentLine ? " " : "") + words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(currentLine);
            currentLine = words[n];
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);

        if (lines.length <= maxLines || fontSize === 14) break;
        fontSize -= 1;
      }

      const lineHeight = Math.round(fontSize * 1.45);
      const totalTextH = lines.length * lineHeight;
      let textStartY = 370 + (100 - totalTextH) / 2;

      ctx.fillStyle = "#fcf6e8";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 4;
      lines.forEach((line) => {
        ctx.fillText(line, W / 2, textStartY);
        textStartY += lineHeight;
      });
      ctx.shadowColor = "transparent";

      // 6. Author & Relation
      const authorText = `— Inscribed with love by ${tribute.name || "Family & Friends"}${
        tribute.relation ? ` (${tribute.relation})` : ""
      }`;
      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 20px 'Cinzel', serif, Georgia";
      ctx.fillText(authorText, W / 2, Math.max(textStartY + 35, 570));

      // 7. Footer Seal & Website
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'Inter', sans-serif";
      ctx.fillText(
        "shyamalchoudhuri.in • Clash of Clans Living Memorial Sanctum 🪔",
        W / 2,
        H - 55
      );

      // Convert canvas to image url
      setDataUrl(canvas.toDataURL("image/png"));
      setIsGenerating(false);
    };

    if (portraitImg.complete) {
      drawCard();
    } else {
      portraitImg.onload = drawCard;
      portraitImg.onerror = drawCard;
    }
  }, [isOpen, tribute]);

  if (!isOpen || !tribute) return null;

  const handleDownload = () => {
    playGemStar();
    confetti({
      particleCount: 50,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#ffaa00", "#ff7a18", "#ffffff"],
    });

    const link = document.createElement("a");
    const safeName = (tribute.name || "Family").replace(/[^a-zA-Z0-9]/g, "_");
    link.download = `Shyamal_Choudhuri_Memorial_Card_${safeName}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
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
          onClose();
        }
      }}
    >
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: "680px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="coc-modal-header" style={{ padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles color="#ffd700" size={22} />
            <span className="coc-gold-text" style={{ fontSize: "16px", letterSpacing: "0.5px" }}>
              MEMORIAL CARD OF TRIBUTE
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

        {/* Body Preview */}
        <div
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {dataUrl ? (
            <div
              style={{
                width: "100%",
                borderRadius: "14px",
                overflow: "hidden",
                border: "3px solid #5b3720",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              }}
            >
              <img
                src={dataUrl}
                alt="Memorial Card Preview"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          ) : (
            <div style={{ padding: "40px", color: "#ffd700", fontWeight: 700 }}>
              Generating Gilded Memorial Card...
            </div>
          )}

          {/* Action Download Button */}
          <button
            onClick={handleDownload}
            disabled={isGenerating || !dataUrl}
            className="coc-btn-base coc-btn-wide-green"
            style={{
              width: "100%",
              minHeight: "48px",
              borderRadius: "14px",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div className="coc-btn-gloss" />
            <Download size={18} />
            <span className="coc-text-shadow">Download High-Quality Card (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
