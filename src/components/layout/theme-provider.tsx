"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * wander.ch Day/Dusk theme.
 * Sets data-theme on <body> so .alpine-page CSS tokens flip between
 * cream-warm and dark-teal palettes. Persists in localStorage.
 */
type Theme = "day" | "dusk";

interface Ctx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<Ctx>({ theme: "day", toggle: () => {}, setTheme: () => {} });

export function useWanderTheme() {
  return useContext(ThemeContext);
}

export function WanderThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("day");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("wander.theme") as Theme | null;
      if (saved === "day" || saved === "dusk") setThemeState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Apply to <body>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("wander.theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "day" ? "dusk" : "day")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
