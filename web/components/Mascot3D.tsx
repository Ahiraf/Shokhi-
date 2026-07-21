"use client";

import Image from "next/image";
import { useState } from "react";
import Mascot from "./Mascot";

/**
 * The 3D cartoon of Shokhi (a Bangladeshi girl in salwar kameez, long ponytail).
 *
 * Drop the rendered image at `web/public/mascot-3d.png` (a transparent-background PNG
 * looks best). Until that file exists — or if it ever fails to load — this gracefully
 * falls back to the original hand-drawn SVG mascot, so the UI is never broken.
 */
export default function Mascot3D({
  size = 180,
  className = "",
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <Mascot size={size} />;

  return (
    <Image
      src="/mascot-3d.png"
      alt="Shokhi"
      width={size}
      height={size}
      priority={priority}
      onError={() => setFailed(true)}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}
