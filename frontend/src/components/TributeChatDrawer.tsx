"use client";

import React, { useState, useEffect } from "react";
import { playCoCClick, playElixirCollect, playDiyaChime } from "@/lib/sound";
import {
  getSupabaseTributes,
  insertSupabaseTribute,
  getSupabaseReactions,
  insertSupabaseReaction,
  SupabaseTribute,
} from "@/lib/supabase";
import { Send, MessageSquare, Download } from "lucide-react";
import { MemorialCardModal } from "./MemorialCardModal";

interface TributeChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTribute: (message: string, author: string, relation: string) => void;
}

const FALLBACK_TRIBUTES: SupabaseTribute[] = [
  {
    name: "Rajesh",
    relation: "Son",
    message: "Baba, your unconditional love and quiet wisdom guide every step we take. We light this eternal diya for you.",
    created_at: "2026-06-22T17:11:53.316848+00:00",
  },
  {
    name: "Tina",
    relation: "Family",
    message: "Dear Baba, I wish I had the chance to know you more and receive your warm love and blessings. You will always be remembered.",
    created_at: "2026-06-23T14:30:17.968199+00:00",
  },
];

export function TributeChatDrawer({ isOpen, onClose, onSendTribute }: TributeChatDrawerProps) {
  const [messages, setMessages] = useState<SupabaseTribute[]>(FALLBACK_TRIBUTES);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [selectedCardTribute, setSelectedCardTribute] = useState<SupabaseTribute | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live tributes and reaction counts from Supabase
  useEffect(() => {
    if (!isOpen) return;

    getSupabaseTributes().then((data) => {
      if (data && data.length > 0) {
        setMessages(data);
      }
    });

    getSupabaseReactions().then((rxData) => {
      if (rxData) {
        setReactions(rxData);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const getTributeId = (msg: SupabaseTribute, idx: number) => {
    return (msg.id || msg.created_at || `${msg.name}_${idx}`).replace(/[^a-zA-Z0-9]/g, "");
  };

  const getReactionCount = (tId: string, type: "diya" | "flower" | "pranam") => {
    const key = `rx_${type}_${tId}`;
    const localVal = typeof window !== "undefined" ? parseInt(localStorage.getItem(key) || "0", 10) : 0;
    const cloudVal = reactions[key] || 0;
    return Math.max(localVal, cloudVal);
  };

  const handleAddReaction = (tId: string, type: "diya" | "flower" | "pranam") => {
    if (type === "diya") playDiyaChime();
    else if (type === "flower") playCoCClick(1.2);
    else playCoCClick(1.0);

    const key = `rx_${type}_${tId}`;
    const nextCount = getReactionCount(tId, type) + 1;

    if (typeof window !== "undefined") {
      localStorage.setItem(key, String(nextCount));
    }
    setReactions((prev) => ({ ...prev, [key]: nextCount }));

    // Sync to Supabase Cloud DB
    insertSupabaseReaction(tId, type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    playElixirCollect();

    const newTribute: SupabaseTribute = {
      name: name.trim(),
      relation: relation.trim() || "Well-wisher",
      message: text.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [newTribute, ...prev]);

    // Save to Supabase Cloud DB
    await insertSupabaseTribute(newTribute.name, newTribute.relation || "Well-wisher", newTribute.message);

    onSendTribute(newTribute.message, newTribute.name, newTribute.relation || "Well-wisher");
    setText("");
    setIsSubmitting(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Just now";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playCoCClick(0.9);
          onClose();
        }
      }}
    >
      {/* Wooden Clan Chat Drawer */}
      <div
        className="coc-modal-window"
        style={{
          width: "100%",
          maxWidth: "440px",
          height: "100%",
          borderRadius: "0",
          borderLeft: "5px solid #3c2415",
          borderTop: "none",
          borderBottom: "none",
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.8)",
          backgroundColor: "#e8dcbe",
        }}
      >
        {/* Drawer Header */}
        <div className="coc-modal-header" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MessageSquare color="#ffd700" size={22} style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
            <div className="coc-gold-text" style={{ fontSize: "16px", letterSpacing: "0.5px" }}>
              FAMILY TRIBUTES &amp; PRAYERS
            </div>
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

        {/* Message Feed */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {messages.map((msg, idx) => {
            const tId = getTributeId(msg, idx);
            const rxDiya = getReactionCount(tId, "diya");
            const rxFlower = getReactionCount(tId, "flower");
            const rxPranam = getReactionCount(tId, "pranam");

            return (
              <div
                key={idx}
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #f6f0e4 100%)",
                  border: "2px solid #b8a68a",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                  <div>
                    <span style={{ fontWeight: 800, color: "#3d2010", fontSize: "14px" }}>
                      {msg.name}
                    </span>
                    {msg.relation && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "11px",
                          color: "#8a581e",
                          background: "rgba(184, 134, 11, 0.15)",
                          padding: "2px 6px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        {msg.relation}
                      </span>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: "13px", color: "#423226", lineHeight: "1.4", whiteSpace: "pre-line" }}>
                  {msg.message}
                </p>

                {/* 3 Interactive Cloud-Synced Reaction Buttons (Diya, Flower, Pranam) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "4px",
                    paddingTop: "8px",
                    borderTop: "1px dashed rgba(91, 55, 32, 0.2)",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {/* 1. Diya Flame Button */}
                    <button
                      type="button"
                      onClick={() => handleAddReaction(tId, "diya")}
                      title="Light a Diya for this tribute"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: "linear-gradient(180deg, #fff7e6 0%, #fae6c2 100%)",
                        border: "1.5px solid #d4af37",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#b86200",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                        touchAction: "manipulation",
                      }}
                    >
                      <span>🪔</span>
                      {rxDiya > 0 && <span style={{ fontSize: "11px" }}>{rxDiya}</span>}
                    </button>

                    {/* 2. Flower Petals Button */}
                    <button
                      type="button"
                      onClick={() => handleAddReaction(tId, "flower")}
                      title="Offer Flowers"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: "linear-gradient(180deg, #fff0f6 0%, #fad6e6 100%)",
                        border: "1.5px solid #e0659a",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#991b58",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                        touchAction: "manipulation",
                      }}
                    >
                      <span>🌸</span>
                      {rxFlower > 0 && <span style={{ fontSize: "11px" }}>{rxFlower}</span>}
                    </button>

                    {/* 3. Pranam Button */}
                    <button
                      type="button"
                      onClick={() => handleAddReaction(tId, "pranam")}
                      title="Offer Pranam & Respect"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        borderRadius: "8px",
                        background: "linear-gradient(180deg, #f0f4ff 0%, #dbe4ff 100%)",
                        border: "1.5px solid #6b8fd4",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#1e3a8a",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                        touchAction: "manipulation",
                      }}
                    >
                      <span>🙏</span>
                      {rxPranam > 0 && <span style={{ fontSize: "11px" }}>{rxPranam}</span>}
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        playCoCClick(1.0);
                        setSelectedCardTribute(msg);
                      }}
                      title="Download Memorial Certificate Card"
                      aria-label="Download Memorial Certificate Card"
                      className="coc-btn-base coc-btn-wide-green"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "30px",
                        height: "26px",
                        minHeight: "unset",
                        minWidth: "unset",
                        padding: 0,
                        borderRadius: "8px",
                        flexShrink: 0,
                        borderBottomWidth: "3px",
                      }}
                    >
                      <div className="coc-btn-gloss" />
                      <Download size={13} strokeWidth={2.8} color="#ffffff" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }} />
                    </button>

                    <span style={{ fontSize: "10px", color: "#8c7965" }}>
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form at Bottom */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "linear-gradient(180deg, #3d2415 0%, #25140b 100%)",
            borderTop: "3px solid #5b3720",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%", boxSizing: "border-box" }}>
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="coc-input-field"
              style={{
                minHeight: "40px",
                padding: "8px 10px",
                fontSize: "13px",
                fontWeight: 600,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />
            <input
              type="text"
              placeholder="Relationship (e.g. Son)"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="coc-input-field"
              style={{
                minHeight: "40px",
                padding: "8px 10px",
                fontSize: "13px",
                fontWeight: 600,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", width: "100%", boxSizing: "border-box" }}>
            <input
              type="text"
              placeholder="Inscribe a prayer for Shyamal Choudhuri..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="coc-input-field"
              style={{
                flex: 1,
                minHeight: "42px",
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 500,
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="coc-btn-base coc-btn-wide-green"
              style={{
                padding: "0 16px",
                height: "42px",
                minHeight: "42px",
                borderRadius: "10px",
                fontSize: "13px",
                flexShrink: 0,
                opacity: isSubmitting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="coc-btn-gloss" />
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* High-Resolution Memorial Certificate / Card Modal */}
      <MemorialCardModal
        isOpen={!!selectedCardTribute}
        onClose={() => setSelectedCardTribute(null)}
        tribute={selectedCardTribute}
      />
    </div>
  );
}
