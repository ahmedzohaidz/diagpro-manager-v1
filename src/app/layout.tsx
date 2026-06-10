import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DiagPro Manager V1 — إدارة الورشة",
  description: "نظام إدارة ورشة السيارات — نسخة التدفق النقدي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
