"use client";

import { useState } from "react";
import { useLang } from "./LanguageProvider";
import Icon from "./Icon";
import SpeakButton from "./SpeakButton";

/**
 * "Help them understand" — a simple, shareable explainer the woman can show her family so the
 * people around her stop reading her period mood changes as "attitude". Tackles the OTHER half
 * of the problem: the misunderstanding by others. Has a listen button and a native Share.
 */
export default function FamilyCard() {
  const { lang } = useLang();
  const en = lang === "en";
  const [copied, setCopied] = useState(false);

  const message = en
    ? "A note for family: Before and during her period, natural hormone changes can bring mood swings, sadness, or irritability. This is real and normal — she is not being difficult or doing it on purpose. What helps most: patience, kind words, a little rest, and warm, nourishing food. Your understanding means a lot."
    : "পরিবারের জন্য কথা: মাসিকের আগে ও সময়ে হরমোনের স্বাভাবিক পরিবর্তনে মেজাজ ওঠানামা, মন খারাপ বা খিটখিটে ভাব আসতে পারে। এটি সত্যি ও স্বাভাবিক — সে ইচ্ছে করে বা জেদ করে এমন করছে না। সবচেয়ে বেশি সাহায্য করে: ধৈর্য, নরম কথা, একটু বিশ্রাম আর গরম-পুষ্টিকর খাবার। আপনার বোঝাপড়া তার কাছে অনেক বড় পাওয়া।";

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        return;
      }
    } catch { /* user cancelled or unsupported */ }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-gradient-to-br from-panel to-panel-deep p-5 text-white">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
          <Icon name="heart" size={17} />
        </span>
        <h2 className="font-display text-base font-bold">
          {en ? "Help your family understand" : "পরিবারকে বোঝাতে সাহায্য"}
        </h2>
      </div>
      <p className="text-sm leading-relaxed text-white/85">{message}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-plum transition hover:bg-white"
        >
          <Icon name="upload" size={15} /> {copied ? (en ? "Copied!" : "কপি হয়েছে!") : en ? "Show my family" : "পরিবারকে দেখান"}
        </button>
        <SpeakButton text={message} className="!bg-white/15 !text-white !ring-white/20" />
      </div>
    </div>
  );
}
