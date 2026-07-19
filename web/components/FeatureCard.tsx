import Link from "next/link";
import type { Feature, Accent } from "@/lib/features";

const ICON_BG: Record<Accent, string> = {
  rose: "bg-rose-soft text-rose-deep",
  sage: "bg-sage-soft text-sage-deep",
  apricot: "bg-apricot-soft text-gold",
};

/** A tappable feature tile on the landing page, linking to that feature's page. */
export default function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link
      href={feature.href}
      className="group flex flex-col rounded-2xl bg-white/80 p-5 ring-1 ring-rose-soft transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${ICON_BG[feature.accent]}`}
      >
        {feature.icon}
      </span>
      <h3 className="mt-3 font-display text-base font-bold text-plum">{feature.title}</h3>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-plum/60">{feature.desc}</p>
      <span className="mt-3 text-sm font-semibold text-rose transition group-hover:translate-x-0.5">
        খুলুন →
      </span>
    </Link>
  );
}
