"use client";

import { useEffect, useState } from "react";
import { getKnowledge, bustMyth } from "@/lib/api";
import type { Myth } from "@/lib/types";
import PageHeader from "@/components/PageHeader";

export default function MythsPage() {
  const [myths, setMyths] = useState<Myth[]>([]);
  const [belief, setBelief] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getKnowledge().then((k) => setMyths(k.myths)).catch(() => setMyths([]));
  }, []);

  async function ask() {
    const b = belief.trim();
    if (!b || busy) return;
    setBusy(true);
    setReply("");
    try {
      setReply(await bustMyth(b));
    } catch {
      setReply("দুঃখিত, এখন উত্তর আনা গেল না।");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader
        icon="💡"
        title="ভুল ধারণা ভাঙুন"
        sub="মাসিক ও নারীস্বাস্থ্য নিয়ে অনেক প্রচলিত ভুল বিশ্বাস আছে — এখানে সঠিক তথ্য জানুন।"
      />

      {/* ask about a belief */}
      <div className="mt-8 rounded-2xl bg-white/80 p-4 ring-1 ring-rose-soft">
        <p className="text-sm font-semibold text-plum">শুনেছেন এমন কিছু যাচাই করতে চান?</p>
        <div className="mt-2 flex items-end gap-2">
          <textarea
            value={belief}
            onChange={(e) => setBelief(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask();
              }
            }}
            rows={1}
            placeholder="যেমন: মাসিকের সময় গোসল করা যায় না…"
            className="max-h-32 flex-1 resize-none rounded-xl bg-cream px-3 py-2.5 text-plum outline-none ring-1 ring-rose-soft placeholder:text-plum/40 focus:ring-2 focus:ring-rose/40"
          />
          <button
            onClick={ask}
            disabled={busy || !belief.trim()}
            className="rounded-full bg-rose px-5 py-2.5 font-semibold text-white transition disabled:opacity-40"
          >
            {busy ? "…" : "যাচাই"}
          </button>
        </div>
        {reply && (
          <div className="mt-3 rounded-xl bg-sage-soft px-4 py-3 text-sm leading-relaxed text-plum/80">
            🌸 {reply}
          </div>
        )}
      </div>

      {/* common myths */}
      <div className="mt-8 space-y-4">
        {myths.map((m, i) => (
          <div key={i} className="rounded-2xl bg-white/80 p-4 ring-1 ring-rose-soft">
            <p className="text-sm font-semibold text-plum/50 line-through decoration-red-300">
              ❌ {m.myth_bn}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-plum/85">
              <span className="font-semibold text-sage-deep">✅ সত্যি:</span> {m.fact_bn}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
