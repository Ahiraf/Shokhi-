"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";

const STORE_KEY = "shokhi_pad_reminder";
const BN = "০১২৩৪৫৬৭৮৯";
const toBn = (n: number) => String(n).replace(/\d/g, (d) => BN[+d]);

type Reminder = { start: number; hours: number };

function load(): Reminder | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    return null;
  }
}

/**
 * Pad-change reminder — a gentle nudge to change every 4–6 hours (prevents rash,
 * infection and, for tampon/cup users, toxic shock). Kept privately on the device.
 * It counts down while the app is open and, if the woman allows notifications, also
 * pings her when the time is up. Honest about that limitation in the UI.
 */
export default function PadReminder() {
  const { t, lang } = useLang();
  const num = (n: number) => (lang === "en" ? String(n) : toBn(n));
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const r = load();
    if (r) {
      setReminder(r);
      if (r.start + r.hours * 3_600_000 <= Date.now()) setDone(true);
    }
  }, []);

  useEffect(() => {
    if (!reminder || done) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [reminder, done]);

  const remaining = reminder ? reminder.start + reminder.hours * 3_600_000 - now : 0;

  // fire once the countdown crosses zero
  useEffect(() => {
    if (reminder && !done && remaining <= 0) {
      setDone(true);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification(t("pad.notifTitle"), { body: t("pad.notifBody") });
      }
    }
  }, [remaining, reminder, done]);

  function start(hours: number) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const r = { start: Date.now(), hours };
    localStorage.setItem(STORE_KEY, JSON.stringify(r));
    setReminder(r);
    setDone(false);
    setNow(Date.now());
  }

  function cancel() {
    localStorage.removeItem(STORE_KEY);
    setReminder(null);
    setDone(false);
  }

  const active = reminder && !done;
  const hrsLeft = Math.floor(remaining / 3_600_000);
  const minLeft = Math.max(0, Math.floor((remaining % 3_600_000) / 60_000));

  return (
    <div className="mt-4 rounded-2xl bg-surface/70 p-4 ring-1 ring-rose-soft">
      <h2 className="flex items-center gap-2 text-base font-bold text-rose-deep"><Icon name="clock" size={18} /> {t("pad.title")}</h2>
      <p className="mt-1 text-sm text-rose-deep/70">{t("pad.intro")}</p>

      {!active && !done && (
        <div className="mt-3 flex gap-2">
          {[4, 6].map((h) => (
            <button
              key={h}
              onClick={() => start(h)}
              className="flex-1 rounded-full bg-rose-soft py-2 text-sm font-semibold text-rose-deep transition hover:bg-rose-soft/70"
            >
              {num(h)} {t("pad.remindIn")}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-medium text-rose-deep">
            <Icon name="clock" size={15} /> {hrsLeft > 0 ? `${num(hrsLeft)} ${t("pad.hours")} ` : ""}
            {num(minLeft)} {t("pad.minutes")} {t("pad.left")}
          </span>
          <button
            onClick={cancel}
            className="rounded-full px-3 py-1 text-sm text-rose-deep/60 hover:text-rose-deep"
          >
            {t("pad.cancel")}
          </button>
        </div>
      )}

      {done && (
        <div className="mt-3 rounded-xl bg-rose-soft px-3 py-2.5">
          <p className="flex items-center gap-2 text-sm font-semibold text-rose-deep"><Icon name="flower" size={16} /> {t("pad.timeUp")}</p>
          <div className="mt-2 flex gap-2">
            {[4, 6].map((h) => (
              <button
                key={h}
                onClick={() => start(h)}
                className="flex-1 rounded-full bg-surface py-1.5 text-sm font-medium text-rose-deep ring-1 ring-rose-soft"
              >
                {t("pad.again")} {num(h)} {t("pad.againHours")}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-2.5 text-xs text-rose-deep/45">{t("pad.footer")}</p>
    </div>
  );
}
