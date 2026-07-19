"use client";

import { useEffect, useState } from "react";
import { getGuides } from "@/lib/api";
import type { GuideCard } from "@/lib/types";

/**
 * Health-info guide chips (contraception, family planning, menopause care, nutrition,
 * first period, menstrual hygiene). Tapping one asks the backend to explain that topic
 * in warm Bangla — a judgment-free way in for topics a woman may hesitate to type out.
 */
export default function Guides({ onPick }: { onPick: (id: string) => void }) {
  const [guides, setGuides] = useState<GuideCard[]>([]);

  useEffect(() => {
    getGuides()
      .then(setGuides)
      .catch(() => setGuides([]));
  }, []);

  if (guides.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {guides.map((g) => (
        <button
          key={g.id}
          onClick={() => onPick(g.id)}
          title={g.summary_bn}
          className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-rose-deep ring-1 ring-rose-soft backdrop-blur transition hover:bg-rose-soft"
        >
          {g.icon} {g.title_bn}
        </button>
      ))}
    </div>
  );
}
