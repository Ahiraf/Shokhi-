import Link from "next/link";
import { NAV } from "@/lib/nav";

/** Site footer — links, emergency numbers, and the safety disclaimer. */
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-rose-soft/70 bg-blush/40">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-lg font-bold text-plum">🌸 সখী</p>
            <p className="mt-2 text-sm leading-relaxed text-plum/60">
              বাংলায় নারীর স্বাস্থ্য বন্ধু — মাসিক, পিসিওএস, গর্ভকাল থেকে মেনোপজ।
              Gemma 4 দ্বারা চালিত।
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-plum/45">পাতা</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {NAV.filter((n) => n.href !== "/").map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-sm text-plum/70 hover:text-rose">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/about" className="text-sm text-plum/70 hover:text-rose">
                  সম্পর্কে
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-rose-soft">
            <p className="text-sm font-semibold text-rose-deep">🚨 জরুরি নম্বর</p>
            <p className="mt-1 text-sm text-plum/70">জাতীয় জরুরি সেবা — <b>৯৯৯</b></p>
            <p className="text-sm text-plum/70">স্বাস্থ্য বাতায়ন — <b>১৬২৬৩</b></p>
          </div>
        </div>

        <p className="mt-8 border-t border-rose-soft/60 pt-5 text-xs leading-relaxed text-plum/45">
          ℹ️ সখী একজন স্বাস্থ্য-সহায়ক, ডাক্তার নয়। এটি প্রাথমিক ধারণা ও নিরাপদ পরামর্শ দেয়;
          নিশ্চিত রোগ নির্ণয় ও চিকিৎসার জন্য অবশ্যই একজন চিকিৎসকের পরামর্শ নিন।
        </p>
      </div>
    </footer>
  );
}
