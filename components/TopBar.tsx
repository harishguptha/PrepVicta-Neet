"use client";

import Image from "next/image";

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="pv-topbar md:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            menu
          </span>
        </button>
        <div className="pv-topbar-logo">
          <Image src="/prepvicta-logo.jpeg" alt="PrepVicta logo" width={28} height={28} priority />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>PrepVicta</span>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        NEET 2026
      </div>
    </header>
  );
}
