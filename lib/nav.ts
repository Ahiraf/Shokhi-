import type { StringKey } from "@/lib/i18n";

// Shared site navigation — used by the top Nav and the Footer. Labels are i18n keys
// (see lib/i18n.ts) so the whole nav switches with the Bangla/English toggle.
export const NAV: { href: string; key: StringKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/chat", key: "nav.chat" },
  { href: "/tracker", key: "nav.tracker" },
  { href: "/guides", key: "nav.guides" },
  { href: "/learn", key: "nav.learn" },
  { href: "/myths", key: "nav.myths" },
  { href: "/wellness", key: "nav.wellness" },
  { href: "/hotline", key: "nav.hotline" },
];
