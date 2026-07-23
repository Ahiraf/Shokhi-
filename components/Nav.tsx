"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import { useLang } from "./LanguageProvider";
import { useTheme } from "./ThemeProvider";

/** Sticky top navigation shared across every page, with a mobile menu. */
export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t, lang, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const themeLabel = t(theme === "dark" ? "nav.lightMode" : "nav.darkMode");
  const themeButton = (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-plum ring-1 ring-rose-soft transition hover:bg-blush"
      aria-label={themeLabel}
      title={themeLabel}
    >
      {theme === "dark" ? (
        // sun — currently dark, tap for light
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // crescent half-moon — currently light, tap for dark
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );

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

  const profileButton = (
    <Link
      href="/profile"
      onClick={() => setOpen(false)}
      className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-rose-soft transition ${
        isActive("/profile") ? "bg-rose text-accentink" : "bg-surface text-plum hover:bg-blush"
      }`}
      aria-label={t("nav.profile")}
      title={t("nav.profile")}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-rose-soft/70 bg-cream/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-rose-soft">
            <Image
              src="/shokhi-mark.png"
              alt="Shokhi logo"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
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
                    ? "bg-rose text-accentink"
                    : "text-plum/60 hover:bg-blush hover:text-plum"
                }`}
              >
                {t(n.key)}
              </Link>
            </li>
          ))}
          <li className="ml-1">{profileButton}</li>
          <li>{themeButton}</li>
          <li>{langButton("")}</li>
        </ul>

        {/* mobile: profile + theme + language toggle + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          {profileButton}
          {themeButton}
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
                    ? "bg-rose text-accentink"
                    : "bg-surface/70 text-plum/70 ring-1 ring-rose-soft"
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
