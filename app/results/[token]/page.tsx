import { ResultView } from "@/components/ResultView";
import { parsePaperIndex } from "@/lib/demo-data";

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
