// On-device notifications for the nav bell: pad-change reminders, next-period nudges and
// cycle-phase tips — all derived from localStorage (period logs + pad reminder). Nothing
// leaves the phone; there is no server or push backend.

import { getInsights } from "./cycle-insights";
import type { CycleLog } from "./types";
import type { IconName } from "@/components/Icon";

export type Tone = "urgent" | "info" | "calm";

export interface Notif {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  href: string;
  tone: Tone;
  actionable: boolean; // counts toward the unread badge
}

function loadLogs(): CycleLog[] {
  try { return JSON.parse(localStorage.getItem("shokhi_cycle_logs") || "[]"); } catch { return []; }
}
function loadPad(): { start: number; hours: number } | null {
  try { return JSON.parse(localStorage.getItem("shokhi_pad_reminder") || "null"); } catch { return null; }
}

export function buildNotifications(lang: "bn" | "en"): Notif[] {
  if (typeof window === "undefined") return [];
  const en = lang === "en";
  const out: Notif[] = [];
  const now = Date.now();

  // --- pad-change reminder ---
  const pad = loadPad();
  if (pad) {
    const due = pad.start + pad.hours * 3_600_000;
    if (now >= due) {
      out.push({
        id: "pad-due", icon: "clock", tone: "urgent", actionable: true, href: "/tracker",
        title: en ? "Time to change your pad" : "প্যাড বদলানোর সময় হয়েছে",
        body: en ? "A fresh pad now helps avoid rash and infection." : "এখন প্যাড বদলান — র‍্যাশ ও সংক্রমণ এড়াতে সাহায্য করে।",
      });
    } else {
      const hrs = Math.max(1, Math.round((due - now) / 3_600_000));
      out.push({
        id: "pad-soon", icon: "clock", tone: "info", actionable: false, href: "/tracker",
        title: en ? `Pad change in about ${hrs}h` : `প্যাড বদল আনুমানিক ${hrs} ঘণ্টায়`,
        body: en ? "The reminder is counting down on this phone." : "রিমাইন্ডার এই ফোনে সময় গুনছে।",
      });
    }
  }

  // --- cycle: next period / late / phase ---
  const ins = getInsights(loadLogs(), lang);
  if (ins.hasData) {
    if (ins.status.kind === "late") {
      out.push({
        id: "period-late", icon: "drop", tone: "urgent", actionable: true, href: "/tracker",
        title: en ? `Your period is ${ins.status.value} days late` : `আপনার মাসিক ${ins.status.value} দিন দেরি`,
        body: en ? "Occasional lateness is normal; see a doctor if over 3 months." : "মাঝে মাঝে দেরি স্বাভাবিক; ৩ মাসের বেশি হলে ডাক্তার দেখান।",
      });
    } else if (ins.daysUntilNext != null && ins.daysUntilNext >= 0 && ins.daysUntilNext <= 5) {
      const d = ins.daysUntilNext;
      out.push({
        id: "period-soon", icon: "drop", tone: "info", actionable: true, href: "/tracker",
        title: d === 0
          ? (en ? "Your period may start today" : "আজ আপনার মাসিক শুরু হতে পারে")
          : (en ? `Period likely in ${d} days` : `মাসিক আনুমানিক ${d} দিনে`),
        body: en ? "Keep a pad handy, just in case." : "নিশ্চিন্তে থাকতে সঙ্গে একটি প্যাড রাখুন।",
      });
    }

    if (ins.status.kind === "ovulation") {
      out.push({
        id: "fertile", icon: "heart", tone: "info", actionable: false, href: "/tracker",
        title: en ? "Fertile days now" : "এখন উর্বর সময়",
        body: en ? "Higher chance of pregnancy on these days." : "এই দিনগুলোতে গর্ভধারণের সম্ভাবনা বেশি।",
      });
    } else if (ins.phase) {
      const names: Record<string, [string, string]> = {
        menstrual: ["মাসিক", "Menstrual"], follicular: ["ফলিকুলার", "Follicular"],
        ovulatory: ["ডিম্বস্ফোটন", "Ovulation"], luteal: ["লুটিয়াল", "Luteal"],
      };
      const n = names[ins.phase];
      out.push({
        id: "phase", icon: "moon", tone: "calm", actionable: false, href: "/wellness",
        title: en ? `You're in the ${n[1]} phase` : `আপনি এখন ${n[0]} পর্যায়ে`,
        body: en ? "See wellness tips tuned to this phase." : "এই পর্যায়ের উপযোগী সুস্থতা পরামর্শ দেখুন।",
      });
    }
  } else {
    out.push({
      id: "start", icon: "calendar", tone: "calm", actionable: false, href: "/tracker",
      title: en ? "Start tracking your cycle" : "আপনার চক্র লেখা শুরু করুন",
      body: en ? "Log your last period to get reminders here." : "এখানে রিমাইন্ডার পেতে শেষ মাসিকের তারিখ লিখুন।",
    });
  }

  return out;
}

/** Signature of the currently-actionable notifications, for unread tracking. */
export function actionableSignature(items: Notif[]): string {
  return items.filter((n) => n.actionable).map((n) => n.id).sort().join(",");
}
