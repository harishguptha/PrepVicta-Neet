"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== allowedRole) {
      const home = user.role === "admin" ? "/admin" : user.role === "elite" ? "/elite" : "/dashboard";
      router.replace(home);
    }
  }, [user, loading, allowedRole, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-secondary text-[48px] animate-pulse">school</span>
          <p className="text-[14px] text-on-surface-variant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
