"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import Mascot from "./Mascot";

/** Sticky top navigation shared across every page, with a mobile menu. */
export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* mobile toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="rounded-full bg-blush p-2 text-plum ring-1 ring-rose-soft md:hidden"
          aria-label="মেনু"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
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
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
