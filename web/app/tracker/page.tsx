"use client";

import PageHeader from "@/components/PageHeader";
import CycleTracker from "@/components/CycleTracker";
import PadReminder from "@/components/PadReminder";
import Mascot3D from "@/components/Mascot3D";
import { useLang } from "@/components/LanguageProvider";

export default function TrackerPage() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-2 flex justify-center">
        <Mascot3D variant="tracker" size={120} />
      </div>
      <PageHeader icon="🩸" title={t("tracker.title")} sub={t("tracker.sub")} />
      <CycleTracker />
      <PadReminder />
    </main>
  );
}
