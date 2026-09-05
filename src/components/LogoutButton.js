"use client";

import { useState } from "react";

export default function LogoutButton({ className, style, children, ...props }) {
  const [loading, setLoading] = useState(false);

  const onClick = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      // ignore
    }

    window.location.href = "/api/auth/logout";
  };

  return (
    <button 
      className={className} 
      onClick={onClick}
      disabled={loading}
      style={{ 
        cursor: loading ? 'not-allowed' : 'pointer', 
        border: 'none', 
        background: 'transparent', 
        padding: 0,
        opacity: loading ? 0.7 : 1,
        ...style 
      }}
      {...props}
    >
      {loading ? "Çıkılıyor..." : children}
    </button>
  );
}
