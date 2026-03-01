"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { applyGymTheme } from "@/lib/gym-theme";

// Apply stored theme immediately from localStorage to avoid flash
// This runs before React hydrates
const applyStoredTheme = () => {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem("gym-theme");
    if (stored) {
      const { primaryColor, accentColor, darkMode } = JSON.parse(stored);
      applyGymTheme(primaryColor, accentColor, darkMode);
    }
  } catch {
    // ignore
  }
};

// Run immediately (not in useEffect) to prevent flash of wrong theme
if (typeof window !== "undefined") {
  applyStoredTheme();
}

export function GymThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.gymId) return;

    const loadAndApplyTheme = async () => {
      try {
        const res = await fetch("/api/dashboard/settings", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();

        const primaryColor = data.primaryColor ?? "#3b82f6";
        const accentColor = data.accentColor ?? "#10b981";
        const darkMode = data.darkModeEnabled ?? false;

        // Apply to DOM
        applyGymTheme(primaryColor, accentColor, darkMode);

        // Cache in localStorage to avoid flash on next load
        localStorage.setItem("gym-theme", JSON.stringify({ primaryColor, accentColor, darkMode }));
      } catch {
        // fail silently
      }
    };

    loadAndApplyTheme();
  }, [status, session?.user?.gymId]);

  return <>{children}</>;
}