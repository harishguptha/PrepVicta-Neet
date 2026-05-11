"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "student" | "elite" | "admin";

export interface User {
  id?: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirect: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; redirect: string }>;
  logout: () => void;
}

const STORAGE_KEY = "prepvicta_user";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: "Not initialized", redirect: "/login" }),
  register: async () => ({ success: false, error: "Not initialized", redirect: "/login" }),
  logout: () => {},
});

function resolveRedirect(user: User, is_onboarded: boolean): string {
  if (user.role === "admin") return "/admin";
  if (!is_onboarded) return "/onboarding";
  return user.role === "elite" ? "/elite" : "/dashboard";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hydrateUser = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);

        const res = await fetch(`/api/auth/user?email=${encodeURIComponent(parsed.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
          }
        }
      } catch {
        // invalid data, ignore
      } finally {
        setLoading(false);
      }
    };
    void hydrateUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.user) {
      return { success: false, error: data?.error ?? "Login failed.", redirect: "/login" };
    }

    const loggedInUser = data.user as User;
    setUser(loggedInUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));

    return { success: true, redirect: resolveRedirect(loggedInUser, data.is_onboarded as boolean) };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.user) {
      return { success: false, error: data?.error ?? "Registration failed.", redirect: "/signup" };
    }

    const newUser = data.user as User;
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    // New users always go to onboarding
    return { success: true, redirect: "/onboarding" };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
