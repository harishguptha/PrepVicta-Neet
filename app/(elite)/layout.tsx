"use client";

import EliteSidebar from "@/components/EliteSidebar";
import EliteTopBar from "@/components/EliteTopBar";
import AuthGuard from "@/components/AuthGuard";

export default function EliteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRole="elite">
      <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col md:flex-row" style={{ fontFamily: "'Lexend', sans-serif" }}>
        <EliteTopBar />
        <EliteSidebar />
        <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
