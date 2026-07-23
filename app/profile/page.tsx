"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageIntro from "@/components/PageIntro";
import { useLang } from "@/components/LanguageProvider";
import {
  loadProfile,
  saveProfile,
  clearProfile,
  cycleAverageFromTracker,
  STAGE_OPTIONS,
  CONDITION_OPTIONS,
  type Profile,
  type LifeStage,
} from "@/lib/profile";

export default function ProfilePage() {
  const { t, lang } = useLang();
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [stage, setStage] = useState<LifeStage>("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [cycleAvg, setCycleAvg] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    const p = loadProfile();
    setName(p.name ?? "");
    setAge(p.age != null && p.age !== "" ? String(p.age) : "");
    setStage(p.stage ?? "");
    setConditions(p.conditions ?? []);
    setCycleAvg(cycleAverageFromTracker());
  }, []);

  function toggleCondition(id: string) {
    setConditions((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    setSaved(false);
  }

  function save() {
    const p: Profile = {
      name: name.trim() || undefined,
      age: age ? Number(age) : "",
      stage,
      conditions,
    };
    saveProfile(p);
    setSaved(true);
  }

  function clear() {
    clearProfile();
    setName("");
    setAge("");
    setStage("");
    setConditions([]);
    setSaved(false);
  }

  const label = (o: { bn: string; en: string }) => (lang === "en" ? o.en : o.bn);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageIntro icon="🌸" title={t("profile.title")} sub={t("profile.sub")} variant="profile" side="right" size={140} />

      <div className="mt-8 space-y-6">
        {/* name + age */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-plum/80">
            {t("profile.name")}
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
              placeholder={t("profile.namePlaceholder")}
              className="mt-1.5 block w-full rounded-xl bg-surface px-3 py-2.5 text-plum outline-none ring-1 ring-rose-soft placeholder:text-plum/40 focus:ring-2 focus:ring-rose/40"
            />
          </label>
          <label className="block text-sm font-medium text-plum/80">
            {t("profile.age")}
            <input
              type="number"
              min={9}
              max={70}
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setSaved(false);
              }}
              placeholder={t("profile.agePlaceholder")}
              className="mt-1.5 block w-full rounded-xl bg-surface px-3 py-2.5 text-plum outline-none ring-1 ring-rose-soft placeholder:text-plum/40 focus:ring-2 focus:ring-rose/40"
            />
          </label>
        </div>

        {/* life stage */}
        <div>
          <p className="text-sm font-medium text-plum/80">{t("profile.stage")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STAGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  setStage(stage === o.value ? "" : o.value);
                  setSaved(false);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  stage === o.value
                    ? "bg-rose text-accentink"
                    : "bg-surface text-plum/70 ring-1 ring-rose-soft hover:bg-blush"
                }`}
              >
                {label(o)}
              </button>
            ))}
          </div>
        </div>

        {/* known conditions */}
        <div>
          <p className="text-sm font-medium text-plum/80">{t("profile.conditions")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => toggleCondition(o.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  conditions.includes(o.id)
                    ? "bg-sage-deep text-accentink"
                    : "bg-surface text-plum/70 ring-1 ring-rose-soft hover:bg-blush"
                }`}
              >
                {conditions.includes(o.id) ? "✓ " : ""}
                {label(o)}
              </button>
            ))}
          </div>
        </div>

        {/* cycle summary from tracker */}
        <div className="rounded-2xl bg-sage-soft/60 px-4 py-3.5">
          <p className="text-sm font-semibold text-sage-deep">🩸 {t("profile.cycleTitle")}</p>
          {cycleAvg ? (
            <p className="mt-1 text-sm text-plum/75">
              {t("tracker.avgCycle")}: <b>{cycleAvg}</b> {t("tracker.days")}
            </p>
          ) : (
            <p className="mt-1 text-sm text-plum/60">
              {t("profile.cycleNone")}{" "}
              <Link href="/tracker" className="font-semibold text-rose hover:underline">
                {t("profile.goTracker")}
              </Link>
            </p>
          )}
        </div>

        <p className="text-xs leading-relaxed text-plum/55">{t("profile.usedInChat")}</p>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            className="rounded-full bg-rose px-6 py-2.5 font-semibold text-accentink shadow-lift transition hover:brightness-105"
          >
            {saved ? t("profile.saved") : t("profile.save")}
          </button>
          <button
            onClick={clear}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-plum/55 hover:text-rose"
          >
            {t("profile.clear")}
          </button>
        </div>

        <p className="border-t border-rose-soft/60 pt-4 text-xs leading-relaxed text-plum/45">
          {t("profile.privacy")}
        </p>
      </div>
    </main>
  );
}
