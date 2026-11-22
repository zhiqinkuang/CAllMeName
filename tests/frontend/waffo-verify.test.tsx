/** @vitest-environment jsdom */
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

const WAFFO_VERIFY_CONTENT = "4930ecde9814365d94312066848d06f4";

describe("Waffo homepage verification meta", () => {
  it("includes a waffo-verify meta tag in the root head used by the homepage", () => {
    const html = renderToStaticMarkup(
      <RootLayout>
        <div>child</div>
      </RootLayout>,
    );

    const doc = new DOMParser().parseFromString(html, "text/html");
    const tag = doc.head.querySelector('meta[name="waffo-verify"]');

    expect(tag).not.toBeNull();
    expect(tag?.getAttribute("name")).toBe("waffo-verify");
    expect(tag?.getAttribute("content")).toBe(WAFFO_VERIFY_CONTENT);
    expect(html).not.toContain("698902ef842e1774fdf55b8c7f427e6a");
  });
});
