import { ResultView } from "@/components/ResultView";
import { parsePaperParam, type PaperId } from "@/lib/demo-data";

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paper?: string }>;
}) {
  // Style preview: any token shows Elena demo. No GET /api/results.
  await params;
  const sp = await searchParams;
  const paper: PaperId = parsePaperParam(sp.paper) ?? "anran";
  return <ResultView initialPaper={paper} />;
}
