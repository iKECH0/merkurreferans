"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ className, children }) {
  return (
    <button 
      className={className} 
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{ cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
    >
      {children}
    </button>
  );
}
