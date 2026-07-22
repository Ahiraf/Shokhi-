"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

const STORE_KEY = "shokhi_theme";

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/**
 * App-wide light/dark state. The initial class is set by an inline script in the
 * root layout (before paint) to avoid a flash; here we hydrate React state to match
 * and keep <html class="dark"> + localStorage in sync when the user toggles.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  // hydrate from whatever the pre-paint script already decided on <html>
  useEffect(() => {
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle("dark", t === "dark");
    try {
      localStorage.setItem(STORE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  const value = useMemo<ThemeCtx>(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

/** Runs before paint to set the theme class, avoiding a light→dark flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORE_KEY}');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
