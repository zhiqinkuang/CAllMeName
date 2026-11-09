/** Public site origin for metadata, robots, and sitemap. */

const DEFAULT_LOCAL = "http://localhost:3000";

type EnvLike = Record<string, string | undefined>;

export function getSiteUrl(env: EnvLike = process.env): string {
  const raw =
    env.NEXT_PUBLIC_SITE_URL ||
    env.APP_BASE_URL ||
    (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : DEFAULT_LOCAL);
  return raw.replace(/\/$/, "");
}

export const SITE_NAME = "CallMeMing";

export const SITE_TITLE =
  "CallMeMing — Real Chinese Name Generator for Learners";

export const SITE_DESCRIPTION =
  "CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.";
