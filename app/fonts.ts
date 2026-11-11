import localFont from "next/font/local";
import { Newsreader, Source_Sans_3 } from "next/font/google";

/**
 * Latin UI faces are fetched once at build time by next/font/google and
 * emitted as same-origin files. Noto Serif SC is loaded with next/font/local
 * because next/font/google's metadata only lists latin/cyrillic/vietnamese
 * subsets and would silently ship no hanzi.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-serif",
});

export const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const notoSerifSC = localFont({
  src: [
    {
      path: "./fonts/noto-serif-sc/noto-serif-sc-chinese-simplified-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/noto-serif-sc/noto-serif-sc-chinese-simplified-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/noto-serif-sc/noto-serif-sc-chinese-simplified-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-han",
  // All three SC weights together are ~4.5MB; preload would fetch them on every
  // page. display: swap keeps system CJK fallbacks visible until a weight loads.
  preload: false,
  adjustFontFallback: false,
  fallback: ["Source Han Serif SC", "Songti SC", "serif"],
});

export const fontVariables = [
  newsreader.variable,
  sourceSans3.variable,
  notoSerifSC.variable,
].join(" ");
