/**
 * Shokhi — the companion character (সখী herself).
 *
 * A calm, original flat-illustration of a warm, smiling woman in an orna, echoing the
 * logo's motif in the soft brand palette. Kept deliberately simple: a friendly face,
 * no busy props. She's the assistant's avatar in chat and greets on the landing, so the
 * app always feels like *someone gentle is here with you*. Hand-built SVG.
 */
export default function Mascot({
  size = 120,
  className = "",
}: {
  size?: number;
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
          <stop offset="0" stopColor="#d08fa1" />
          <stop offset="1" stopColor="#a5657b" />
        </linearGradient>
        <linearGradient id="mk-blouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#96586c" />
          <stop offset="1" stopColor="#7c4759" />
        </linearGradient>
        <linearGradient id="mk-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6b489" />
          <stop offset="1" stopColor="#d8a273" />
        </linearGradient>
      </defs>

      {/* shoulders / blouse */}
      <path
        d="M34 200 C34 156 60 138 100 138 C140 138 166 156 166 200 Z"
        fill="url(#mk-blouse)"
      />
      {/* orna over the right shoulder */}
      <path
        d="M112 140 C150 146 168 168 166 200 L128 200 C128 176 120 156 108 146 Z"
        fill="url(#mk-orna)"
        opacity="0.9"
      />

      {/* back hair */}
      <path
        d="M100 40 C66 40 52 68 52 104 C52 132 60 150 74 158 L74 120 C74 92 84 74 100 74 C116 74 126 92 126 120 L126 158 C140 150 148 132 148 104 C148 68 134 40 100 40 Z"
        fill="#3a2730"
      />

      {/* neck */}
      <rect x="89" y="128" width="22" height="22" rx="10" fill="#cd9568" />

      {/* face */}
      <ellipse cx="100" cy="102" rx="35" ry="39" fill="url(#mk-skin)" />

      {/* orna over the crown */}
      <path
        d="M58 96 C60 58 82 42 100 42 C118 42 140 58 142 96 C126 74 116 68 100 68 C84 68 74 74 58 96 Z"
        fill="url(#mk-orna)"
      />
      {/* small hair peeking at the temples */}
      <path
        d="M100 68 C86 68 74 78 68 96 C80 84 90 82 100 82 C110 82 120 84 132 96 C126 78 114 68 100 68 Z"
        fill="#43303a"
      />

      {/* cheeks */}
      <ellipse cx="80" cy="112" rx="7" ry="5" fill="#dd8ea0" opacity="0.4" />
      <ellipse cx="120" cy="112" rx="7" ry="5" fill="#dd8ea0" opacity="0.4" />

      {/* eyes + brows + smile */}
      <g fill="#54454c">
        <circle cx="86" cy="100" r="3.3" />
        <circle cx="114" cy="100" r="3.3" />
      </g>
      <g stroke="#54454c" strokeWidth="2.3" strokeLinecap="round" fill="none">
        <path d="M79 92 Q86 88 93 92" />
        <path d="M107 92 Q114 88 121 92" />
        <path d="M89 120 Q100 129 111 120" strokeWidth="2.8" />
      </g>

      {/* bindi — a quiet nod to the logo's accent */}
      <circle cx="100" cy="80" r="3" fill="#e6c28a" />
    </svg>
  );
}
