import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CallMeMing — Real Chinese Name Generator for Learners",
  description:
    "CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;600;700&family=Noto+Serif+SC:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
