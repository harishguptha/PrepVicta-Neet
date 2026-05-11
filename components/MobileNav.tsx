"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/planner",
    label: "Plan",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="2" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 1v2M10.5 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M1.5 6h13" stroke="currentColor" strokeWidth="1.2" opacity=".4"/>
        <rect x="4" y="8" width="3" height="2" rx=".5" fill="currentColor" opacity=".7"/>
        <rect x="9" y="8" width="3" height="2" rx=".5" fill="currentColor" opacity=".3"/>
      </svg>
    ),
  },
  {
    href: "/backlog",
    label: "Backlog",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M3 3h10v10H3V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.5 6h5M5.5 8h5M5.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learning",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M3 2.5h7.5A2.5 2.5 0 0 1 13 5v8.5H5.5A2.5 2.5 0 0 1 3 11V2.5z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 5.2h4.8M5.5 7.7h3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M13 5.5H8.5A2.5 2.5 0 0 0 6 8v5.5" stroke="currentColor" strokeWidth="1.1" opacity=".45"/>
      </svg>
    ),
  },
  {
    href: "/tests",
    label: "Rev Test",
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5h8v11H4v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6 5.5h4M6 8h4M6 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/learn") return pathname.startsWith("/learn") || pathname === "/revision";
    if (href === "/learn/deep-learning") return pathname.startsWith("/learn/deep-learning");
    if (href === "/tests") return pathname.startsWith("/tests");
    return pathname === href;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 py-2"
      style={{
        background: "var(--ink)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 12px",
              borderRadius: 10,
              color: active ? "var(--jade)" : "rgba(255,255,255,0.38)",
              background: active ? "rgba(37,131,111,0.12)" : "none",
              textDecoration: "none",
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              transition: "all 0.13s",
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
