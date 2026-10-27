"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { lookup } from "./messages";
import { DEFAULT_LANG } from "@/config/portfolio";
import type { Lang } from "./kinds";

const KEY = "lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (path: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  // Saved choice wins; otherwise follow the browser if it prefers Amharic.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "am" || saved === "en") return setLangState(saved);
      if (navigator.language?.toLowerCase().startsWith("am")) setLangState("am");
    } catch {
      /* storage blocked: keep default */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "am" ? "am" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (p) => lookup(lang, p) }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang(): Ctx {
  const c = useContext(LangCtx);
  if (!c) throw new Error("useLang must be used inside <LangProvider>");
  return c;
}
