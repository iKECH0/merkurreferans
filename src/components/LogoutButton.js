"use client";

import { useState } from "react";
import { handleSignOut } from "@/actions/authActions";

export default function LogoutButton({ className, style, children, ...props }) {
  const [loading, setLoading] = useState(false);

  const onClick = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await handleSignOut();
    } catch (error) {
      // NEXT_REDIRECT is the expected behavior when a server action redirects
      if (error?.message?.includes("NEXT_REDIRECT")) {
        return;
      }
      // Fallback guaranteed redirect if network or other error occurs
      window.location.href = "/login";
    }
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
