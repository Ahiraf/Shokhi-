"use client";

const EXAMPLES: { label: string; text: string }[] = [
  { label: "পিসিওএস", text: "আমার বয়স ২৩, মাসিক খুব অনিয়মিত, মুখে অতিরিক্ত লোম উঠছে আর ওজন বেড়ে যাচ্ছে।" },
  { label: "এন্ডোমেট্রিওসিস", text: "মাসিকের সময় এত ব্যথা হয় যে আমি স্কুলে বা কাজে যেতে পারি না।" },
  { label: "জরুরি", text: "আমার প্রচণ্ড ব্যথা হচ্ছে আর আমি গর্ভবতী হতে পারি।" },
  { label: "পিএমএস", text: "মাসিকের আগে মেজাজ খারাপ থাকে আর পেট ফাঁপা লাগে।" },
];

export default function Examples({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {EXAMPLES.map((e) => (
        <button
          key={e.label}
          onClick={() => onPick(e.text)}
          className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-rose-deep ring-1 ring-rose-100 backdrop-blur transition hover:bg-rose-soft"
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
