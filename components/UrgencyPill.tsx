import type { Urgency } from "@/lib/types";
import Icon, { type IconName } from "./Icon";

const STYLES: Record<Urgency, { cls: string; icon: IconName }> = {
  emergency: { cls: "bg-red-100 text-red-700 ring-red-200", icon: "alert" },
  see_doctor_soon: { cls: "bg-amber-100 text-amber-800 ring-amber-200", icon: "health" },
  self_care: { cls: "bg-emerald-100 text-emerald-700 ring-emerald-200", icon: "leaf" },
  info: { cls: "bg-rose-soft text-rose-deep ring-rose-soft", icon: "chat" },
};

export default function UrgencyPill({
  urgency,
  label,
}: {
  urgency: Urgency;
  label: string;
}) {
  const s = STYLES[urgency];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${s.cls}`}
    >
      <Icon name={s.icon} size={15} />
      {label}
    </span>
  );
}
