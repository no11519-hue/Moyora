import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moyora | 3초 컷 아이스브레이킹",
  description: "QR 찍고 바로 게임 시작. 설치/로그인 없이 100% 무료 아이스브레이킹.",
  openGraph: {
    title: "Moyora",
    description: "QR 찍고 바로 게임 시작!",
    url: "https://moyora-psi.vercel.app/",
    siteName: "Moyora",
    locale: "ko_KR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
