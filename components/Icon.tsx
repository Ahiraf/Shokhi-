// A small, consistent line-icon set (Lucide-style strokes) used across the app instead of
// emoji, so every card/badge looks intentional and on-brand. Icons inherit `currentColor`.

import type { SVGProps } from "react";

export type IconName =
  | "chat" | "drop" | "clock" | "book" | "learn" | "bulb" | "leaf" | "phone" | "shield"
  | "sparkle" | "calendar" | "edit" | "note" | "activity" | "heart" | "mic" | "trash"
  | "download" | "upload" | "save" | "moon" | "user" | "flower"
  | "help" | "ear" | "tool" | "lock" | "health" | "alert" | "apple" | "basket"
  | "refresh" | "check" | "search";

const PATHS: Record<IconName, React.ReactNode> = {
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  drop: <path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.32 0z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />,
  learn: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
  bulb: <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2h6c0-.5.4-1.4 1-2a7 7 0 0 0-4-12z" />,
  leaf: <><path d="M11 20A7 7 0 0 1 4 13C4 7 12 2 20 2c0 8-5 18-11 18z" /><path d="M4 21c3-3 6-5 9-6" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.1 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
  sparkle: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4z" />,
  flower: <><circle cx="12" cy="12" r="3" /><path d="M12 5a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM12 13a3 3 0 0 0 0 6 3 3 0 0 0 0-6zM7.5 9.5a3 3 0 0 0 3 5 3 3 0 0 0-3-5zM13.5 9.5a3 3 0 0 1 3 5 3 3 0 0 1-3-5z" /></>,
  calendar: <><path d="M8 2v4M16 2v4M3 10h18" /><rect x="3" y="4" width="18" height="18" rx="2" /></>,
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 19v3" /></>,
  trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />,
  upload: <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.2 9a3 3 0 0 1 5.7 1c0 2-2.9 2.5-2.9 3.5M12 17h.01" /></>,
  ear: <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 4.2-3 4.8-4.3 7.2A3.7 3.7 0 0 1 7 15M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2 2.2-2.4 3.5" />,
  tool: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.9 2.9-2-2z" />,
  lock: <><rect x="4.5" y="11" width="15" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  health: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  alert: <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />,
  apple: <><path d="M12 7C11 4.5 8.5 3.3 6.5 4.6 3.8 6.5 4.3 11.5 7 15.5c1.4 2.2 3 3.5 5 3.5s3.6-1.3 5-3.5c2.7-4 3.2-9 .5-10.9C15.5 3.3 13 4.5 12 7z" /><path d="M12 7c0-2 1.3-3.8 3.4-4" /></>,
  basket: <><path d="M5 10h14l-1.4 9a2 2 0 0 1-2 1.7H8.4a2 2 0 0 1-2-1.7z" /><path d="M9 10l1.6-6M15 10l-1.6-6M3 10h18" /></>,
  refresh: <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />,
  check: <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 4.5-5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
};

// Map the emoji glyphs used around the app to a line icon, so we can drop in <Icon> without
// rewriting every data file. Returns undefined for anything unmapped (caller can fall back).
const EMOJI_ICON: Record<string, IconName> = {
  "💬": "chat", "🩸": "drop", "🩸️": "drop", "⏰": "clock", "⏰️": "clock",
  "📚": "book", "📖": "book", "🧠": "learn", "💡": "bulb",
  "🌿": "leaf", "🌱": "leaf", "🍃": "leaf",
  "☎️": "phone", "📞": "phone", "📱": "phone",
  "🛡️": "shield", "🛡": "shield",
  "🌸": "flower", "🌼": "flower", "🌺": "flower", "🌷": "flower",
  "📅": "calendar", "🗓️": "calendar", "📝": "note", "📒": "note",
  "📈": "activity", "📊": "activity", "❤️": "heart", "💗": "heart", "💞": "heart",
  "🎙️": "mic", "🎙": "mic", "🗣️": "mic", "🗑️": "trash", "💾": "save",
  "🌙": "moon", "👤": "user", "❓": "help", "❔": "help", "❗": "alert",
  "🆘": "alert", "⚠️": "alert", "👂": "ear", "🛠️": "tool", "🔒": "lock",
  "🩺": "health", "🥗": "apple", "🍎": "apple", "🧼": "sparkle", "🧺": "basket",
  "🩹": "health", "🔄": "refresh", "✅": "check", "🔍": "search",
};

/** Look up a line icon for an emoji glyph, or undefined if we don't have one. */
export function emojiToIcon(glyph?: string): IconName | undefined {
  if (!glyph) return undefined;
  return EMOJI_ICON[glyph.trim()];
}

/** Renders the mapped line icon for an emoji glyph, falling back to the glyph if unmapped. */
export function EmojiIcon({
  glyph,
  size = 22,
  className,
}: {
  glyph?: string;
  size?: number;
  className?: string;
}) {
  const name = emojiToIcon(glyph);
  if (name) return <Icon name={name} size={size} className={className} />;
  return <span className={className}>{glyph}</span>;
}

export default function Icon({
  name,
  size = 22,
  strokeWidth = 2,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name] ?? PATHS.sparkle}
    </svg>
  );
}
