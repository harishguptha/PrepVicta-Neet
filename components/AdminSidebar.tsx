"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/admin", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/users", icon: "group", label: "User Management" },
  { href: "/admin/subscriptions", icon: "card_membership", label: "Subscriptions" },
  { href: "/admin/content", icon: "library_books", label: "Content" },
  { href: "/admin/support", icon: "contact_support", label: "Support" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="hidden md:flex bg-primary-container font-[family-name:var(--font-lexend)] text-sm w-64 border-r border-white/[0.06] fixed left-0 top-0 bottom-0 flex-col z-30">
      <div className="px-md py-[22px] border-b border-white/[0.07]">
        <div className="flex items-center gap-[10px]">
          <div className="w-9 h-9 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-white tracking-tight">EduAdmin</h2>
            <p className="text-[11px] text-on-primary-container">PrepVicta Admin</p>
          </div>
        </div>
        <div className="mt-[14px] flex items-center gap-xs bg-white/[0.07] rounded-[8px] px-[10px] py-[8px]">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-white">
              {(user?.name ?? "SA").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="text-[12px] font-medium text-white/80 truncate">{user?.name ?? "Super Admin"}</span>
          <span className="ml-auto text-[10px] font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">Founder</span>
        </div>
      </div>
      <div className="flex-1 py-[14px] px-[10px] overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-[0.10em] text-on-primary-container px-[10px] mb-[8px]">Navigation</p>
        <ul className="flex flex-col gap-[2px]">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={
                    active
                      ? "flex items-center gap-[10px] px-[10px] py-[9px] bg-white/[0.10] text-white rounded-[8px] font-semibold text-[13px] border-l-[3px] border-secondary ml-[-3px]"
                      : "flex items-center gap-[10px] px-[10px] py-[9px] text-on-primary-container hover:bg-white/[0.06] rounded-[8px] hover:text-white/90 transition-all text-[13px] border-l-[3px] border-transparent ml-[-3px]"
                  }
                >
                  <span
                    className="material-symbols-outlined text-[18px] flex-shrink-0"
                    style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="py-[14px] px-[10px] border-t border-white/[0.07] space-y-[2px]">
        <button className="w-full flex items-center gap-[10px] px-[10px] py-[9px] text-secondary hover:bg-white/[0.06] rounded-[8px] transition-all text-[13px]">
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Generate Report</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-[10px] px-[10px] py-[9px] text-on-primary-container hover:bg-white/[0.06] rounded-[8px] hover:text-white/90 transition-all text-[13px]"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
