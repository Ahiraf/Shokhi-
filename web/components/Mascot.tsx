/**
 * Shokhi — the companion character (সখী herself).
 *
 * An original flat-illustration of a warm, smiling woman in an orna, echoing the logo's
 * face + leaf + sparkle motif in the brand palette. She waves in the hero and becomes the
 * assistant's avatar in chat, so the app always feels like *someone is here with you*.
 * Hand-built SVG — not traced from any existing app.
 */
export default function Mascot({
  size = 140,
  wave = false,
  className = "",
}: {
  size?: number;
  wave?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="সখী"
      className={className}
    >
      <defs>
        <linearGradient id="mk-orna" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e75a90" />
          <stop offset="1" stopColor="#b5175f" />
        </linearGradient>
        <linearGradient id="mk-blouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f1a52" />
          <stop offset="1" stopColor="#6a1240" />
        </linearGradient>
        <linearGradient id="mk-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2ac7a" />
          <stop offset="1" stopColor="#d29a66" />
        </linearGradient>
      </defs>

      {/* shoulders / blouse */}
      <path
        d="M34 200 C34 156 60 138 100 138 C140 138 166 156 166 200 Z"
        fill="url(#mk-blouse)"
      />
      {/* orna draping over the right shoulder */}
      <path
        d="M112 140 C150 146 168 168 166 200 L128 200 C128 176 120 156 108 146 Z"
        fill="url(#mk-orna)"
        opacity="0.95"
      />

      {/* back hair */}
      <path
        d="M100 40 C66 40 52 68 52 104 C52 132 60 150 74 158 L74 120 C74 92 84 74 100 74 C116 74 126 92 126 120 L126 158 C140 150 148 132 148 104 C148 68 134 40 100 40 Z"
        fill="#241019"
      />

      {/* neck */}
      <rect x="89" y="128" width="22" height="22" rx="10" fill="#c88c5c" />

      {/* face */}
      <ellipse cx="100" cy="102" rx="35" ry="39" fill="url(#mk-skin)" />

      {/* orna over the crown */}
      <path
        d="M58 96 C60 58 82 42 100 42 C118 42 140 58 142 96 C126 74 116 68 100 68 C84 68 74 74 58 96 Z"
        fill="url(#mk-orna)"
      />
      {/* front hair sweep + centre parting */}
      <path
        d="M100 68 C86 68 74 78 68 96 C80 84 90 82 100 82 C110 82 120 84 132 96 C126 78 114 68 100 68 Z"
        fill="#2c1420"
      />

      {/* cheeks */}
      <ellipse cx="80" cy="112" rx="7" ry="5" fill="#e8748f" opacity="0.45" />
      <ellipse cx="120" cy="112" rx="7" ry="5" fill="#e8748f" opacity="0.45" />

      {/* eyes */}
      <g fill="#3a1b2b">
        <circle cx="86" cy="100" r="3.4" />
        <circle cx="114" cy="100" r="3.4" />
      </g>
      <g stroke="#3a1b2b" strokeWidth="2.4" strokeLinecap="round" fill="none">
        {/* brows */}
        <path d="M79 92 Q86 88 93 92" />
        <path d="M107 92 Q114 88 121 92" />
        {/* smile */}
        <path d="M89 120 Q100 130 111 120" strokeWidth="3" />
      </g>

      {/* bindi / flower on the forehead — echoes the logo sparkle */}
      <circle cx="100" cy="80" r="3.2" fill="#f3c579" />

      {/* a little leaf by the shoulder (health / growth) */}
      <path
        d="M150 118 C158 112 168 114 172 122 C164 124 156 124 150 118 Z"
        fill="#57ab7d"
      />

      {/* twinkling sparkle, top-left, like the logo */}
      <g className={wave ? "" : "animate-twinkle"}>
        <path
          d="M44 60 L47 68 L55 71 L47 74 L44 82 L41 74 L33 71 L41 68 Z"
          fill="#f3c579"
        />
      </g>

      {/* waving hand (hero only) */}
      {wave && (
        <g
          className="animate-wave"
          style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}
        >
          <rect x="40" y="118" width="9" height="24" rx="4.5" fill="#d29a66" />
          <circle cx="44.5" cy="112" r="11" fill="url(#mk-skin)" />
          <g fill="#e2ac7a">
            <rect x="36" y="100" width="4" height="12" rx="2" />
            <rect x="42" y="97" width="4" height="15" rx="2" />
            <rect x="48" y="100" width="4" height="12" rx="2" />
          </g>
        </g>
      )}
    </svg>
  );
}
