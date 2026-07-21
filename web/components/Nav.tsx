"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import { useLang } from "./LanguageProvider";
import Mascot from "./Mascot";

/** Sticky top navigation shared across every page, with a mobile menu. */
export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang, toggle } = useLang();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const langButton = (extra: string) => (
    <button
      onClick={toggle}
      className={`rounded-full px-3 py-1.5 text-sm font-bold text-plum ring-1 ring-rose-soft transition hover:bg-blush ${extra}`}
      aria-label={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
      title={lang === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
    >
      🌐 {t("nav.langLabel")}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rose-soft/70 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blush ring-1 ring-rose-soft">
            <Mascot size={34} />
          </span>
          <span className="font-display text-lg font-bold text-plum">সখী</span>
        </Link>

        {/* desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive(n.href)
                    ? "bg-rose text-white"
                    : "text-plum/60 hover:bg-blush hover:text-plum"
                }`}
              >
                {t(n.key)}
              </Link>
            </li>
          ))}
          <li className="ml-1">{langButton("")}</li>
        </ul>

        {/* mobile: language toggle + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {langButton("")}
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full bg-blush p-2 text-plum ring-1 ring-rose-soft"
            aria-label={t("nav.menu")}
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {open && (
        <ul className="grid grid-cols-2 gap-1.5 px-5 pb-4 md:hidden">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(n.href)
                    ? "bg-rose text-white"
                    : "bg-white/70 text-plum/70 ring-1 ring-rose-soft"
                }`}
              >
                {t(n.key)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
