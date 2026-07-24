"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKnowledge } from "@/lib/api";
import type { Condition } from "@/lib/types";
import { useLang } from "@/components/LanguageProvider";
import ConditionSelfCheck from "@/components/ConditionSelfCheck";
import { pickField, type StringKey } from "@/lib/i18n";

const URGENCY_TAG: Record<string, { key: StringKey; cls: string }> = {
  emergency: { key: "urgency.emergency.long", cls: "bg-red-100 text-red-700" },
  see_doctor_soon: { key: "urgency.see_doctor_soon.long", cls: "bg-amber-100 text-amber-800" },
  self_care: { key: "urgency.self_care.long", cls: "bg-sage-soft text-sage-deep" },
  info: { key: "urgency.info.long", cls: "bg-blush text-rose-deep" },
};

export default function ConditionDetailPage() {
  const { t, lang } = useLang();
  const { id } = useParams<{ id: string }>();
  const [cond, setCond] = useState<Condition | null>(null);
  const [schema, setSchema] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    getKnowledge()
      .then((k) => {
        const c = k.conditions.find((x) => x.id === id) || null;
        setCond(c);
        setSchema((k.symptom_schema as Record<string, any>) ?? {});
        setStatus(c ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const tag = cond ? URGENCY_TAG[cond.urgency ?? "info"] ?? URGENCY_TAG.info : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/learn" className="text-sm font-semibold text-rose hover:underline">
        {t("learn.backAll")}
      </Link>

      {status === "loading" && <p className="mt-8 text-plum/50">{t("common.loading")}</p>}
      {status === "error" && <p className="mt-8 text-plum/50">{t("learn.notFound")}</p>}

      {cond && (
        <article className="mt-4">
          <h1 className="font-display text-2xl font-bold leading-tight text-plum">
            {lang === "en" ? cond.name_en || cond.name_bn : cond.name_bn}
          </h1>
          {lang !== "en" && cond.name_en && (
            <p className="mt-1 text-sm text-plum/45">{cond.name_en}</p>
          )}
          {tag && (
            <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${tag.cls}`}>
              {t(tag.key)}
            </span>
          )}

          <p className="mt-5 text-[15px] leading-relaxed text-plum/75">
            {lang === "en" ? cond.about_en || cond.about_bn : cond.about_bn}
          </p>

          {cond.self_care_bn?.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-plum">{t("learn.whatYouCanDo")}</h2>
              <ul className="mt-3 space-y-2">
                {(pickField<string[]>(lang, cond as unknown as Record<string, unknown>, "self_care") ?? []).map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 rounded-xl bg-surface/80 px-4 py-2.5 text-sm text-plum/80 ring-1 ring-rose-soft"
                  >
                    <span className="text-rose">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cond.see_doctor_bn && (
            <div className="mt-6 rounded-2xl bg-sage-soft px-4 py-3.5">
              <p className="text-sm font-semibold text-sage-deep">{t("common.seeDoctorHeading")}</p>
              <p className="mt-1 text-sm leading-relaxed text-plum/75">
                {pickField<string>(lang, cond as unknown as Record<string, unknown>, "see_doctor")}
              </p>
            </div>
          )}

          {/* interactive "Am I at risk?" self-check — makes Learn an assessment tool */}
          <ConditionSelfCheck condition={cond as unknown as Record<string, unknown>} schema={schema} />

          <div className="mt-8 rounded-2xl bg-blush/70 px-4 py-4 text-center">
            <p className="text-sm text-plum/70">{t("learn.haveThis")}</p>
            <Link
              href="/chat"
              className="mt-2 inline-block rounded-full bg-rose px-5 py-2 text-sm font-semibold text-accentink"
            >
              {t("learn.checkWithShokhi")}
            </Link>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-plum/45">{t("learn.diagnosisNote")}</p>
        </article>
      )}
    </main>
  );
}
