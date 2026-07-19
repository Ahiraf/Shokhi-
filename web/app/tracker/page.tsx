import PageHeader from "@/components/PageHeader";
import CycleTracker from "@/components/CycleTracker";
import PadReminder from "@/components/PadReminder";

export default function TrackerPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <PageHeader
        icon="🩸"
        title="মাসিক ট্র্যাকার"
        sub="প্রতিবার মাসিক শুরু হলে তারিখ, রক্তক্ষরণ, ব্যথা ও প্যাডের সংখ্যা লিখুন। কয়েক মাসের তথ্য থেকে সখী বুঝবে চক্র নিয়মিত কিনা এবং কিছু নিয়ে ভাবার আছে কিনা।"
      />
      <CycleTracker />
      <PadReminder />
    </main>
  );
}
