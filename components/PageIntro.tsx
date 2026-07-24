"use client";

import Mascot3D from "./Mascot3D";
import Icon, { emojiToIcon } from "./Icon";

/**
 * Page intro band: the 3D mascot on one side and the title/subtitle on the other.
 * `side` picks the side the mascot's pose opens *toward the text* from (e.g. Guides
 * gestures right, so she sits on the left). Responsive: side-by-side on desktop,
 * stacked and centered on mobile so it never overflows a narrow screen.
 */
export default function PageIntro({
  icon,
  title,
  sub,
  variant,
  side = "left",
  size = 150,
}: {
  icon?: string;
  title: string;
  sub?: string;
  variant?: string;
  side?: "left" | "right";
  size?: number;
}) {
  const iconName = emojiToIcon(icon);
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 sm:gap-8 ${
        side === "right" ? "sm:flex-row-reverse" : "sm:flex-row"
      }`}
    >
      <div className="shrink-0">
        <Mascot3D variant={variant} size={size} />
      </div>
      <div className={`max-w-md text-center ${side === "right" ? "sm:text-right" : "sm:text-left"}`}>
        <h1 className={`flex items-center justify-center gap-2.5 font-display text-3xl font-bold text-plum ${side === "right" ? "sm:justify-end" : "sm:justify-start"}`}>
          {iconName && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-rose-deep">
              <Icon name={iconName} size={20} />
            </span>
          )}
          {title}
        </h1>
        {sub && <p className="mt-2 text-sm leading-relaxed text-plum/60">{sub}</p>}
      </div>
    </div>
  );
}
