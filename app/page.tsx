import { HomePage } from "@/components/HomePage";
import { parseGeneratorParam, type GeneratorState } from "@/lib/demo-data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ generator?: string }>;
}) {
  const sp = await searchParams;
  const initial: GeneratorState = parseGeneratorParam(sp.generator) ?? "empty";
  return <HomePage initialGenerator={initial} />;
}
