/** @vitest-environment jsdom */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/font/google", () => ({
  Newsreader: () => ({
    className: "mock-newsreader",
    variable: "font-serif-var",
    style: { fontFamily: "Newsreader" },
  }),
  Source_Sans_3: () => ({
    className: "mock-source-sans",
    variable: "font-sans-var",
    style: { fontFamily: "Source Sans 3" },
  }),
}));

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "mock-noto-serif-sc",
    variable: "font-han-var",
    style: { fontFamily: "Noto Serif SC" },
  }),
}));

import RootLayout from "@/app/layout";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FONT_DIR = path.join(REPO_ROOT, "app/fonts/noto-serif-sc");
const SOURCE_ROOTS = ["app", "components", "lib"];
const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".html"]);
const GOOGLE_FONTS_RE = /fonts\.googleapis\.com|fonts\.gstatic\.com/;

function walkSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const name of entries) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      files.push(...walkSourceFiles(full));
      continue;
    }
    if (SOURCE_EXTS.has(path.extname(name))) {
      files.push(full);
    }
  }
  return files;
}

describe("self-hosted fonts", () => {
  it("does not reference fonts.googleapis.com or fonts.gstatic.com in app source", () => {
    const files = SOURCE_ROOTS.flatMap((root) =>
      walkSourceFiles(path.join(REPO_ROOT, root)),
    );
    expect(files.length).toBeGreaterThan(0);

    const hits: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (GOOGLE_FONTS_RE.test(text)) {
        hits.push(path.relative(REPO_ROOT, file));
      }
    }
    expect(hits).toEqual([]);
  });

  it("renders the root layout without Google Fonts preconnect or stylesheet links", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    );

    expect(html).not.toMatch(GOOGLE_FONTS_RE);
    expect(html).not.toMatch(/<link\b[^>]*href=["'][^"']*fonts\.(googleapis|gstatic)\.com/i);
    expect(html).toContain("font-serif-var");
    expect(html).toContain("font-sans-var");
    expect(html).toContain("font-han-var");
  });

  it("ships Noto Serif SC chinese-simplified files for weights 500, 600, and 700", () => {
    const weights = ["500", "600", "700"];
    for (const weight of weights) {
      const file = path.join(
        FONT_DIR,
        `noto-serif-sc-chinese-simplified-${weight}-normal.woff2`,
      );
      const data = readFileSync(file);
      expect(data.subarray(0, 4).toString()).toBe("wOF2");
      // The chinese-simplified subset is ~1.4MB per weight; a latin-only
      // file would be tens of kilobytes and must not slip through.
      expect(data.byteLength).toBeGreaterThan(1_000_000);
    }
  });

  it("keeps system CJK fallbacks after the self-hosted han family", () => {
    const css = readFileSync(path.join(REPO_ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /--han:\s*var\(--font-han,\s*"Noto Serif SC"\),\s*"Source Han Serif SC",\s*"Songti SC",\s*serif;/,
    );
    expect(css).toMatch(/--serif:\s*var\(--font-serif,/);
    expect(css).toMatch(/--sans:\s*var\(--font-sans,/);
  });
});
