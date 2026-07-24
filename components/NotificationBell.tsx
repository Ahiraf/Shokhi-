"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";
import { buildNotifications, actionableSignature, type Notif, type Tone } from "@/lib/notifications";

const SEEN_KEY = "shokhi_notif_seen";

const TONE: Record<Tone, string> = {
  urgent: "bg-red-100 text-red-600",
  info: "bg-rose-soft text-rose-deep",
  calm: "bg-sage-soft text-sage-deep",
};

/** Bell button in the nav: shows on-device reminders (pad change, next period, phase). */
export default function NotificationBell() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [seen, setSeen] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setItems(buildNotifications(lang));
    try { setSeen(localStorage.getItem(SEEN_KEY) || ""); } catch { /* ignore */ }
  };

  // recompute on mount, on language change, and whenever the tab regains focus / storage changes
  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onFocus);
    const id = setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onFocus);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const signature = actionableSignature(items);
  const unread = signature !== "" && signature !== seen;
  const badge = unread ? items.filter((n) => n.actionable).length : 0;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      try { localStorage.setItem(SEEN_KEY, signature); } catch { /* ignore */ }
      setSeen(signature);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label={t("notif.title")}
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-surface text-plum ring-1 ring-rose-soft transition hover:bg-blush"
      >
        <Icon name="bell" size={17} />
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-accentink">
            {lang === "en" ? badge : String(badge).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d])}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl bg-surface shadow-lift ring-1 ring-rose-soft">
          <div className="flex items-center justify-between border-b border-rose-soft/70 px-4 py-2.5">
            <p className="flex items-center gap-2 text-sm font-bold text-plum">
              <Icon name="bell" size={15} /> {t("notif.title")}
            </p>
            <button onClick={() => setOpen(false)} aria-label={t("notif.close")} className="text-plum/50 hover:text-plum">
              <Icon name="close" size={16} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-plum/50">{t("notif.empty")}</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition hover:bg-blush/50"
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE[n.tone]}`}>
                    <Icon name={n.icon} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-plum">{n.title}</span>
                    <span className="block text-xs leading-snug text-plum/60">{n.body}</span>
                  </span>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-rose-soft/70 px-4 py-2 text-center">
            <span className="text-[11px] text-plum/45">{t("notif.privacy")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
