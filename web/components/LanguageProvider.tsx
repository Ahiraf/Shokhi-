"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGS, translate, type Lang, type StringKey } from "@/lib/i18n";

const STORE_KEY = "shokhi_lang";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Translate a static UI-chrome key. */
  t: (key: StringKey) => string;
}

const Ctx = createContext<LangCtx | null>(null);

/**
 * App-wide language state (Bangla ↔ English). Bangla is the default — Shokhi is a
 * Bangla-first product — and the choice is remembered per-device in localStorage. The
 * provider also keeps <html lang> in sync so the browser/fonts and screen readers know
 * the active language.
 */
export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  // hydrate the saved choice after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY) as Lang | null;
      if (saved && LANGS.includes(saved)) setLangState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(
    () => setLang(lang === "bn" ? "en" : "bn"),
    [lang, setLang],
  );

  const value = useMemo<LangCtx>(
    () => ({ lang, setLang, toggle, t: (key) => translate(lang, key) }),
    [lang, setLang, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
