"use client";

import { useState } from "react";

/**
 * Shows a workout POSE image of the Shokhi mascot (`public/move-<id>.png`) if it exists —
 * a clear visual demonstration for low-literacy users — and falls back to the move's emoji
 * until that image is added. So dropping the PNGs in `public/` is all that's needed to enable
 * the cartoons; no code change.
 */
export default function MoveVisual({ id, icon, size = 22 }: { id: string; icon: string; size?: number }) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/move-${id}.png`}
        alt=""
        width={size}
        height={size}
        onError={() => setImgOk(false)}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>{icon}</span>;
}
