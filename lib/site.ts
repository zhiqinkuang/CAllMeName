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

export const SUPPORT_EMAIL = "zhiqinkuang@gmail.com";

export const LEGAL_NAME = "况志勤";

export const REGISTERED_ADDRESS = "上海市徐汇区梅陇路130号";

export const GOVERNING_LAW = "中华人民共和国法律";

export const SITE_TITLE =
  "CallMeMing — Real Chinese Name Generator for Learners";

export const SITE_DESCRIPTION =
  "CallMeMing — A Real Chinese Name generator for learners. This Chinese name generator gives you a real Chinese name you can actually introduce yourself with, not a transliteration and not fortune-telling.";
