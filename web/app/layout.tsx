import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hind = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
});

// Base URL for absolute OG/Twitter image links (set NEXT_PUBLIC_SITE_URL in prod).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "সখী · Shokhi — নারীর স্বাস্থ্য বন্ধু",
  description:
    "Shokhi — a warm Bangla women's health companion for menstrual health, PCOS, PMS and endometriosis. Powered by Gemma 4.",
  // favicon.ico / icon.png / apple-icon.png in app/ are auto-detected by Next.js.
  openGraph: {
    title: "সখী · Shokhi — নারীর স্বাস্থ্য বন্ধু",
    description:
      "A warm Bangla women's health companion — menstrual health, PCOS, PMS, endometriosis, pregnancy & menopause. Powered by Gemma 4.",
    images: [{ url: "/og.png", width: 1254, height: 1254, alt: "Shokhi" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "সখী · Shokhi — নারীর স্বাস্থ্য বন্ধু",
    description: "A warm Bangla women's health companion. Powered by Gemma 4.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={hind.variable}>
      <body className="font-sans text-[#3a2230] antialiased">{children}</body>
    </html>
  );
}
