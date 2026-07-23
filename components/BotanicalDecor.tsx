// Layered decorative backdrop that fills the wide gutters the centered layout
// leaves on desktop. Three scales for depth without clutter: large blurred glow
// orbs, medium jasmine line-sprigs + scattered petals, and a micro film-grain.
// Purely decorative: fixed, behind content, non-interactive, hidden on small
// screens (no gutters there). Styling lives in globals.css (.botanical-decor).
import type { CSSProperties } from "react";

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

/** A soft blurred glow orb positioned in an empty gutter. */
function Orb({ color, style }: { color: string; style: CSSProperties }) {
  return (
    <div
      className="decor-orb"
      style={{ ...style, background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
    />
  );
}

/** A small filled 5-petal flower (mid-scale confetti between the sprigs). */
function Petal({ style, s = 1 }: { style: CSSProperties; s?: number }) {
  return (
    <svg className="petal" width={22 * s} height={22 * s} viewBox="-12 -12 24 24" style={style} aria-hidden>
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path key={deg} d="M0 0 C -3.5 -5 -3.5 -10 0 -11 C 3.5 -10 3.5 -5 0 0 Z" transform={`rotate(${deg})`} />
        ))}
        <circle r="1.6" fill="rgb(var(--c-gold))" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function BotanicalDecor() {
  return (
    <div className="botanical-decor hidden lg:block" aria-hidden>
      {/* LARGE — glow orbs (behind everything) */}
      <Orb color="rgb(var(--c-rose) / 0.55)" style={{ width: 460, height: 460, top: -120, left: -140 }} />
      <Orb color="rgb(var(--c-sage) / 0.5)" style={{ width: 380, height: 380, top: "38%", right: -160, animationDelay: "-6s" }} />
      <Orb color="rgb(var(--c-rose) / 0.45)" style={{ width: 340, height: 340, bottom: "4%", left: -120, animationDelay: "-11s" }} />
      <Orb color="rgb(var(--c-sage) / 0.4)" style={{ width: 300, height: 300, top: "6%", right: "14%", animationDelay: "-3s" }} />

      {/* MID — scattered petals */}
      <Petal style={{ top: "22%", left: "6%" }} s={1.2} />
      <Petal style={{ top: "68%", left: "3%" }} s={0.85} />
      <Petal style={{ top: "30%", right: "5%" }} s={1} />
      <Petal style={{ bottom: "16%", right: "8%" }} s={1.3} />
      <Petal style={{ top: "50%", right: "3%" }} s={0.75} />
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

      {/* MICRO — film-grain over the whole field, on top of the other layers */}
      <div className="decor-grain" />
    </div>
  );
}
