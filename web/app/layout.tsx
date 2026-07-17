import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

const hind = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
});

export const metadata: Metadata = {
  title: "সখী · Shokhi — নারীর স্বাস্থ্য বন্ধু",
  description:
    "Shokhi — a warm Bangla women's health companion for menstrual health, PCOS, PMS and endometriosis. Powered by Gemma 4.",
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
