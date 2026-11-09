import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";
import { parsePaperIndex } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Your Chinese names — CallMeMing",
  description:
    "Your secure CallMeMing result link. Custom Chinese name candidates delivered after checkout.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paper?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;
  const paperIndex = parsePaperIndex(sp.paper) ?? 0;
  return <ResultView token={token} initialPaperIndex={paperIndex} />;
}
