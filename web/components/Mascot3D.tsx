"use client";

import Image from "next/image";
import { useState } from "react";
import Mascot from "./Mascot";

/**
 * The 3D cartoon of Shokhi (a Bangladeshi girl in salwar kameez, long ponytail),
 * with an optional per-page POSE via `variant`.
 *
 * Drop themed renders in `web/public/`:
 *   - `mascot-3d.png`            — the default / hero pose (required)
 *   - `mascot-3d-<variant>.png`  — a page-specific pose, e.g. mascot-3d-chat.png
 *
 * Fallback chain (so the UI is never broken): the variant image → the default image →
 * the hand-drawn SVG mascot. A transparent-background PNG looks best.
 */
export default function Mascot3D({
  size = 180,
  variant,
  className = "",
  priority = false,
}: {
  size?: number;
  variant?: string;
  className?: string;
  priority?: boolean;
}) {
  // page-specific pose first, then the shared default
  const sources = Array.from(
    new Set([variant ? `/mascot-3d-${variant}.png` : "/mascot-3d.png", "/mascot-3d.png"])
  );
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  if (failed) return <Mascot size={size} />;

  return (
    <Image
      src={sources[idx]}
      alt="Shokhi"
      width={size}
      height={size}
      priority={priority}
      onError={() => (idx < sources.length - 1 ? setIdx(idx + 1) : setFailed(true))}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}
