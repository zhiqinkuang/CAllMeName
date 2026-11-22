import { headers } from "next/headers";
import { HomePage } from "@/components/HomePage";
import { resolveHomepageProps } from "@/lib/homepage-props";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ generator?: string }>;
}) {
  const sp = await searchParams;
  const userAgent = (await headers()).get("user-agent");
  const { forcedState, sampleCards } = resolveHomepageProps({
    generatorParam: sp.generator,
    userAgent,
  });
  return <HomePage forcedState={forcedState} sampleCards={sampleCards} />;
}
