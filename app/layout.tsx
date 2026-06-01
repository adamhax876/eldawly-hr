import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "الدولي HR - روق الـ CV بتاعك بالذكاء الاصطناعي",
  description: "ارفع الـ CV بتاعك دلوقتي واحصل على تقييم وجلد (Roast) ساخر وصريح جداً بالذكاء الاصطناعي، مع خريطة طريق احترافية (Fix) لتعديله وتطويره بالكامل!",
  keywords: ["CV Roast", "الدولي HR", "تعديل السيرة الذاتية", "الذكاء الاصطناعي", "Roast my CV", "سيرة ذاتية"],
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col bg-[#0f172a] text-slate-100">
        {children}
        <Script
          src="https://pl29608514.effectivecpmnetwork.com/55/c0/eb/55c0eb6dd8f8144a4d341a07363edae6.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
