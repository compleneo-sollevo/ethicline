"use client";

import { create } from "zustand";
import type { User } from "@/types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({ user: null, isAuthenticated: false });
  },
  hasPermission: (permission) => {
    const { user } = get();
    if (!user) return false;
    if (user.roles.some((r) => r.key === "admin")) return true;
    return user.permissions?.includes(permission) ?? false;
  },
}));
