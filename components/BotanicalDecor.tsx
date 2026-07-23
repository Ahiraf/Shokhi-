// Botanical line-art backdrop — delicate single-stroke jasmine sprigs drift in the
// wide gutters the centered layout leaves on desktop. Purely decorative: fixed,
// behind content, non-interactive, and hidden on small screens (no gutters there).
// Styling + the gentle sway live in globals.css (.botanical-decor).

/** One five-petal jasmine flower drawn as line-art (petals = almond outlines). */
function Flower({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {petals.map((deg) => (
        <path
          key={deg}
          d="M0 0 C -4 -6 -4 -13 0 -18 C 4 -13 4 -6 0 0 Z"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="2.4" />
    </g>
  );
}

/** A curving stem with a couple of leaves and jasmine blooms at the tips. */
function Sprig() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {/* main stem */}
      <path d="M60 200 C 40 150 84 120 60 78 C 44 50 78 34 62 8" />
      {/* leaves along the stem */}
      <path d="M62 156 C 40 150 30 132 26 116 C 46 122 58 138 62 156 Z" />
      <path d="M66 118 C 90 116 102 100 108 84 C 86 86 72 100 66 118 Z" />
      <path d="M60 84 C 40 82 30 66 26 52 C 46 56 56 70 60 84 Z" />
      {/* blooms — filled outline flowers at the sprig tips */}
      <Flower x={62} y={10} s={1.15} />
      <Flower x={92} y={44} s={0.85} />
      <Flower x={30} y={66} s={0.8} />
    </g>
  );
}

export default function BotanicalDecor() {
  return (
    <div className="botanical-decor hidden lg:block" aria-hidden>
      {/* top-left */}
      <svg viewBox="0 0 120 210" width="120" height="210" className="sway" style={{ top: "5rem", left: "-12px" }}>
        <Sprig />
      </svg>
      {/* bottom-right, mirrored */}
      <svg
        viewBox="0 0 120 210"
        width="130"
        height="228"
        className="sway-slow"
        style={{ bottom: "3rem", right: "-14px", transform: "scaleX(-1)" }}
      >
        <Sprig />
      </svg>
      {/* mid-right, small accent */}
      <svg viewBox="0 0 120 210" width="86" height="150" className="sway" style={{ top: "42%", right: "10px" }}>
        <Sprig />
      </svg>
      {/* mid-left, small accent, mirrored */}
      <svg
        viewBox="0 0 120 210"
        width="80"
        height="140"
        className="sway-slow"
        style={{ top: "60%", left: "8px", transform: "scaleX(-1)" }}
      >
        <Sprig />
      </svg>
    </div>
  );
}
