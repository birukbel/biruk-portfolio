"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { Icon } from "./Icons";

export type NavLink = { id: string; key: string };

export function Nav({ links, name }: { links: NavLink[]; name: string }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const toggle = (
    <div role="group" aria-label={t("nav.language")} className="flex overflow-hidden rounded-full border border-line text-sm">
      {(["en", "am"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-[40px] min-w-[44px] px-3 font-medium transition-colors ${lang === l ? "bg-accent text-ink" : "text-mute hover:text-fg"}`}
        >
          {l === "en" ? "EN" : "አማ"}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="font-serif text-xl font-semibold tracking-wide">
          {name}
        </a>
        <ul className="hidden items-center gap-6 text-sm text-mute md:flex">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="py-2 hover:text-fg">
                {t(`nav.${l.key}`)}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {toggle}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-line md:hidden"
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>
      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-ink px-5 py-3 md:hidden">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={() => setOpen(false)} className="block min-h-[44px] py-3 text-fg">
                {t(`nav.${l.key}`)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
