"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

interface ProfileData {
  daysToExam: number;
  examDate: string;
  examYear: number;
  studyStreakDays: number;
  pendingTasksToday: number;
}

const navItems = [
  {
    href: "/planner",
    label: "Today's Plan",
    icon: (
      <svg className="pv-nav-icon" viewBox="0 0 16 16" fill="none">
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
      <svg className="pv-nav-icon" viewBox="0 0 16 16" fill="none">
        <path d="M3 3h10v10H3V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M5.5 6h5M5.5 8h5M5.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/learn",
    label: "Learning Center",
    children: [
      { href: "/learn/deep-learning", label: "Study" },
      { href: "/revision", label: "Revision" },
    ],
    icon: (
      <svg className="pv-nav-icon" viewBox="0 0 16 16" fill="none">
        <path d="M3 2.5h7.5A2.5 2.5 0 0 1 13 5v8.5H5.5A2.5 2.5 0 0 1 3 11V2.5z" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M5.5 5.2h4.8M5.5 7.7h3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M13 5.5H8.5A2.5 2.5 0 0 0 6 8v5.5" stroke="currentColor" strokeWidth="1.1" opacity=".45"/>
      </svg>
    ),
  },
  {
    href: "/tests",
    label: "Revision Test",
    icon: (
      <svg className="pv-nav-icon" viewBox="0 0 16 16" fill="none">
        <path d="M4 2.5h8v11H4v-11z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M6 5.5h4M6 8h4M6 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/dashboard",
    label: "Estimated NEET Score",
    icon: (
      <svg className="pv-nav-icon" viewBox="0 0 16 16" fill="none">
        <path d="M2.5 12c0-2.3 1.5-3.8 3.5-3.8h4c2 0 3.5 1.5 3.5 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="8" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
];

type SidebarProps = {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export default function Sidebar({
  collapsed = false,
  onToggleCollapsed,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data.daysToExam === "number") {
          setProfile(data as ProfileData);
        }
      })
      .catch(() => {});
  }, [user?.email]);

  const isActive = (href: string) => {
    if (href === "/learn") return pathname.startsWith("/learn") || pathname === "/revision";
    if (href === "/learn/deep-learning") return pathname.startsWith("/learn/deep-learning");
    if (href === "/tests") return pathname.startsWith("/tests");
    return pathname === href;
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PK";

  const daysToExam = profile?.daysToExam ?? null;
  const examYear = profile?.examYear ?? null;
  const examDate = profile?.examDate ?? null;
  const streakDays = profile?.studyStreakDays ?? null;
  const pendingTasks = profile?.pendingTasksToday ?? null;

  const sidebarInner = (
    <>
      <div className="pv-sb-top">
        {/* Brand */}
        <div className="pv-sb-brand">
          <div className="pv-sb-mark">
            <Image src="/prepvicta-logo.jpeg" alt="PrepVicta logo" width={28} height={28} priority />
          </div>
          <div className="pv-sb-brand-text">
            <div className="pv-sb-name">PrepVicta</div>
            <div className="pv-sb-sub">Focused NEET Prep</div>
          </div>

          <button
            type="button"
            className="pv-sb-collapse"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapsed}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* Countdown chip */}
        <div className="pv-countdown-chip">
          <div className="pv-cd-num">
            {daysToExam !== null ? daysToExam : <span style={{ fontSize: 22, opacity: 0.4 }}>—</span>}
          </div>
          <div className="pv-cd-label">Days to NEET {examYear ?? "—"}</div>
          <div className="pv-cd-date">{examDate ?? "Loading…"}</div>
        </div>

        {/* Nav */}
        <nav className="pv-sb-nav">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`pv-nav-item${isActive(item.href) ? " active" : ""}`}
                onClick={() => onMobileClose?.()}
              >
                {item.icon}
                <span className="pv-nav-label">{item.label}</span>
                {item.href === "/planner" && isActive(item.href) && pendingTasks !== null && pendingTasks > 0 ? (
                  <span className="pv-nav-badge">{pendingTasks}</span>
                ) : null}
              </Link>
              {item.children ? (
                <div className="pv-nav-children">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`pv-nav-child${isActive(child.href) ? " active" : ""}`}
                      onClick={() => onMobileClose?.()}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom widgets */}
      <div style={{ padding: "0 0 6px" }}>
        <div className="pv-sb-streak">
          <span style={{ fontSize: 18 }}>🔥</span>
          <div className="pv-sb-streak-text">
            <div className="pv-streak-num">
              {streakDays !== null ? streakDays : <span style={{ opacity: 0.4 }}>—</span>}
            </div>
            <div className="pv-streak-label">day streak</div>
            {streakDays !== null && streakDays > 0 ? (
              <div className="pv-streak-sub">
                {streakDays >= 30
                  ? "Exceptional consistency!"
                  : streakDays >= 14
                  ? "Great momentum"
                  : streakDays >= 7
                  ? "One week strong"
                  : "Keep it going"}
              </div>
            ) : null}
          </div>
        </div>
        <div className="pv-sb-student">
          <div className="pv-s-av">{initials}</div>
          <div className="pv-sb-student-text">
            <div className="pv-s-name">{user?.name ?? "Student"}</div>
            <div className="pv-s-tag">NEET {examYear ?? "—"} Aspirant</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen ? <div className="pv-sb-overlay md:hidden" onClick={onMobileClose} /> : null}
      <aside className={`pv-sidebar pv-sidebar-mobile md:hidden${mobileOpen ? " open" : ""}`}>
        {sidebarInner}
      </aside>

      <aside className={`pv-sidebar hidden md:flex${collapsed ? " collapsed" : ""}`}>
        {sidebarInner}
      </aside>
    </>
  );
}
