"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      style={{ padding: '0.8rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
    >
      🖨️ Raporu PDF Olarak İndir / Yazdır
    </button>
  );
}
