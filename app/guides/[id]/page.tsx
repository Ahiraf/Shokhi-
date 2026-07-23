"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGuide } from "@/lib/api";
import type { GuideFull } from "@/lib/types";
import { useLang } from "@/components/LanguageProvider";
import { pickField } from "@/lib/i18n";

export default function GuideDetailPage() {
  const { t, lang } = useLang();
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<GuideFull | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    getGuide(id)
      .then((g) => {
        setGuide(g);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/guides" className="text-sm font-semibold text-rose hover:underline">
        {t("guides.backAll")}
      </Link>

      {status === "loading" && <p className="mt-8 text-plum/50">{t("common.loading")}</p>}
      {status === "error" && <p className="mt-8 text-plum/50">{t("guides.notFound")}</p>}

      {guide && (
        <article className="mt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blush text-3xl">
              {guide.icon}
            </span>
            <h1 className="font-display text-2xl font-bold leading-tight text-plum">
              {pickField<string>(lang, guide as unknown as Record<string, unknown>, "title")}
            </h1>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-plum/75">
            {pickField<string>(lang, guide as unknown as Record<string, unknown>, "summary")}
          </p>

          <ul className="mt-6 space-y-3">
            {(pickField<string[]>(lang, guide as unknown as Record<string, unknown>, "points") ?? []).map((p, i) => (
              <li
                key={i}
                className="flex gap-3 rounded-2xl bg-surface/80 px-4 py-3 ring-1 ring-rose-soft"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-soft text-xs font-bold text-rose-deep">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-plum/80">{p}</span>
              </li>
            ))}
          </ul>

          {guide.when_see_doctor_bn && (
            <div className="mt-6 rounded-2xl bg-sage-soft px-4 py-3.5">
              <p className="text-sm font-semibold text-sage-deep">{t("common.seeDoctorHeading")}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum/75">
                {pickField<string>(lang, guide as unknown as Record<string, unknown>, "when_see_doctor")}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-blush/70 px-4 py-4 text-center">
            <p className="text-sm text-plum/70">{t("guides.moreQuestion")}</p>
            <Link
              href="/chat"
              className="mt-2 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink"
            >
              {t("common.askShokhi")}
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-plum/45">{t("common.generalInfoNote")}</p>
        </article>
      )}
    </main>
  );
}
