"use client";

import { useEffect, useState } from "react";
import { getKnowledge, bustMyth } from "@/lib/api";
import type { Myth } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import { useLang } from "@/components/LanguageProvider";

export default function MythsPage() {
  const { t, lang } = useLang();
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
      setReply(await bustMyth(b, lang));
    } catch {
      setReply(t("myths.errorReply"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader icon="💡" title={t("myths.title")} sub={t("myths.sub")} />

      {/* ask about a belief */}
      <div className="mt-8 rounded-2xl bg-white/80 p-4 ring-1 ring-rose-soft">
        <p className="text-sm font-semibold text-plum">{t("myths.askPrompt")}</p>
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
            placeholder={t("myths.placeholder")}
            className="max-h-32 flex-1 resize-none rounded-xl bg-cream px-3 py-2.5 text-plum outline-none ring-1 ring-rose-soft placeholder:text-plum/40 focus:ring-2 focus:ring-rose/40"
          />
          <button
            onClick={ask}
            disabled={busy || !belief.trim()}
            className="rounded-full bg-rose px-5 py-2.5 font-semibold text-white transition disabled:opacity-40"
          >
            {busy ? "…" : t("myths.check")}
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
              ❌ {lang === "en" ? m.myth_en || m.myth_bn : m.myth_bn}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-plum/85">
              <span className="font-semibold text-sage-deep">{t("myths.truth")}</span>{" "}
              {lang === "en" ? m.fact_en || m.fact_bn : m.fact_bn}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
