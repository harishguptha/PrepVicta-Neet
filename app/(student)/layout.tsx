"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";
import { useState } from "react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthGuard allowedRole="student">
      <div className={`pv-shell${sidebarCollapsed ? " pv-shell-collapsed" : ""}`}>
        <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <main className="pv-main pt-16 md:pt-0 pb-24 md:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
