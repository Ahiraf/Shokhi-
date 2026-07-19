import type { ChatItem } from "@/lib/types";
import UrgencyPill from "./UrgencyPill";
import RiskBar from "./RiskBar";
import Mascot from "./Mascot";

export default function Message({ item }: { item: ChatItem }) {
  const isUser = item.role === "user";

  if (isUser) {
    return (
      <div className="flex animate-rise justify-end">
        <div className="max-w-[80%] rounded-3xl rounded-br-lg bg-gradient-to-br from-rose to-rose-deep px-4 py-2.5 text-white shadow-lift">
          {item.text}
        </div>
      </div>
    );
  }

  const t = item.data?.triage;
  const flags = t?.red_flags ?? [];
  const risks = (t?.risk_signals ?? []).filter((s) => s.elevated);

  return (
    <div className="flex animate-rise items-start gap-2.5">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush ring-1 ring-rose-soft">
        <Mascot size={34} />
      </span>
      <div className="max-w-[85%] rounded-3xl rounded-tl-lg bg-white px-4 py-3 shadow-soft ring-1 ring-rose-soft">
        {t && (
          <div className="mb-2">
            <UrgencyPill urgency={t.urgency} label={t.urgency_label_bn} />
          </div>
        )}

        {flags.map((f) => (
          <div
            key={f.id}
            className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
          >
            <b>{f.name_bn}</b> — {f.action_bn}
          </div>
        ))}

        <div className="whitespace-pre-wrap leading-relaxed text-plum">
          {item.text}
        </div>

        {risks.map((s) => (
          <RiskBar key={s.id} signal={s} />
        ))}

        {item.data?.next_question && !item.data.is_emergency && (
          <div className="mt-3 rounded-xl bg-rose-mist px-3 py-2 text-sm text-rose-deep">
            ❓ {item.data.next_question}
          </div>
        )}
      </div>
    </div>
  );
}
