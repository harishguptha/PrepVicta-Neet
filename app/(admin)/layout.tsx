"use client";

import AdminSidebar from "@/components/AdminSidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRole="admin">
      <div className="bg-background text-on-background min-h-screen flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 p-gutter md:p-lg min-h-screen">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-lg">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
