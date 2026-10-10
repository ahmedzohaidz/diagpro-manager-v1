import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiagPro Manager | إدارة الورشة",
  description: "نظام عربي لإدارة حجوزات ورش صيانة السيارات",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
