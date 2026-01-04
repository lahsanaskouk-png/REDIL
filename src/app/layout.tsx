import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brixa - منصة الاستثمار الذكي",
  description: "سجل الآن في Brixa وابدأ رحلتك الاستثمارية",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
