"use client";
import { useState, useEffect } from "react";

export default function MuteButton() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const muted = localStorage.getItem("merkur_muted") === "true";
    setIsMuted(muted);
  }, []);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    localStorage.setItem("merkur_muted", newState);
  };

  return (
    <button 
      onClick={toggleMute}
      title={isMuted ? "Sesi Aç" : "Sesi Kapat (Sessiz Mod)"}
      style={{
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: isMuted ? 'var(--text-muted)' : 'var(--primary)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.2rem',
        transition: 'all 0.2s',
        opacity: isMuted ? 0.7 : 1
      }}
    >
      {isMuted ? "x!" : "x`"}
    </button>
  );
}
