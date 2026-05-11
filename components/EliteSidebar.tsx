"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { label: "Learning Centre", icon: "school", href: "/elite" },
  { label: "E-books", icon: "menu_book", href: "/elite/ebooks" },
  { label: "Audio Vault", icon: "headset", href: "/elite/audio" },
  { label: "AI Study Aids", icon: "psychology", href: "/elite/study-aids" },
  { label: "My Progress", icon: "insights", href: "/elite/progress" },
];

export default function EliteSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/elite") return pathname === "/elite";
    return pathname.startsWith(href);
  };

  const isStudyAidsActive = ["/elite/feynman", "/elite/mnemonic", "/elite/mindmap"].some((p) => pathname.startsWith(p));

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full p-4 z-40 w-64 border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="mb-8 px-4">
        <div className="flex items-center gap-3">
          <Image
            src="/prepvicta-logo.jpeg"
            alt="PrepVicta logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200"
            priority
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "'Lexend', sans-serif" }}>
              PrepVicta NEET
            </h1>
            <p className="text-sm text-teal-600 mt-1 font-medium">Elite Medical Prep</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ul className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const active = item.href === "/elite/study-aids"
            ? isStudyAidsActive || isActive(item.href)
            : isActive(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  active
                    ? "bg-teal-50 text-teal-700 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <button className="w-full bg-slate-900 text-white text-sm font-medium py-2.5 rounded-lg mb-4 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
          Ask AI Expert
        </button>
        <ul className="space-y-1">
          <li>
            <Link
              href="/elite/settings"
              className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-slate-900 rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              Settings
            </Link>
          </li>
          <li>
            <button
              onClick={logout}
              className="flex items-center gap-3 text-slate-500 px-4 py-2 hover:text-slate-900 rounded-lg text-sm font-medium transition-colors w-full text-left"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </li>
        </ul>
        {/* User info */}
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <span className="text-sm font-semibold text-slate-900 truncate">{user?.name ?? "Student"}</span>
        </div>
      </div>
    </nav>
  );
}
