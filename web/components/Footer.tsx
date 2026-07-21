"use client";

import Link from "next/link";
import { NAV } from "@/lib/nav";
import { useLang } from "./LanguageProvider";

/** Site footer — links, emergency numbers, and the safety disclaimer. */
export default function Footer() {
  const { t, lang } = useLang();
  const emergency = lang === "en" ? "999" : "৯৯৯";
  const hotline = lang === "en" ? "16263" : "১৬২৬৩";
  return (
    <footer className="mt-16 border-t border-rose-soft/70 bg-blush/40">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg font-bold text-plum">🌸 সখী</p>
            <p className="mt-2 text-sm leading-relaxed text-plum/60">{t("footer.tagline")}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-plum/45">{t("footer.pages")}</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {NAV.filter((n) => n.href !== "/").map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-sm text-plum/70 hover:text-rose">
                    {t(n.key)}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/about" className="text-sm text-plum/70 hover:text-rose">
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-rose-soft">
            <p className="text-sm font-semibold text-rose-deep">{t("footer.emergencyNumbers")}</p>
            <p className="mt-1 text-sm text-plum/70">{t("footer.nationalEmergency")} — <b>{emergency}</b></p>
            <p className="text-sm text-plum/70">{t("footer.healthHotline")} — <b>{hotline}</b></p>
          </div>
        </div>

        <p className="mt-8 border-t border-rose-soft/60 pt-5 text-xs leading-relaxed text-plum/45">
          {t("footer.disclaimer")}
        </p>
      </div>
    </footer>
  );
}
