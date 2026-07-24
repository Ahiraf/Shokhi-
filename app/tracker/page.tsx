"use client";

import PageIntro from "@/components/PageIntro";
import CycleTracker from "@/components/CycleTracker";
import PadReminder from "@/components/PadReminder";
import WellnessTip from "@/components/WellnessTip";
import MoodLog from "@/components/MoodLog";
import FamilyCard from "@/components/FamilyCard";
import { useLang } from "@/components/LanguageProvider";

export default function TrackerPage() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageIntro icon="🩸" title={t("tracker.title")} sub={t("tracker.sub")} variant="tracker" side="left" size={140} />
      <CycleTracker />
      <div className="mt-5 space-y-5">
        <MoodLog />
        <FamilyCard />
      </div>
      <WellnessTip />
      <PadReminder />
    </main>
  );
}
