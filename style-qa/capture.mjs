import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = __dirname;
const base = "http://127.0.0.1:3010";
const browser = await chromium.launch({ headless: true });

async function shot(name, url, { width, height, fullPage = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, name), fullPage });
  console.log("wrote", name);
  await context.close();
}

await shot("exhibit-desktop-home-empty.png", `${base}/?generator=empty`, {
  width: 1440, height: 900, fullPage: true,
});
await shot("exhibit-desktop-home-generating.png", `${base}/?generator=generating`, {
  width: 1440, height: 900, fullPage: false,
});
await shot("exhibit-desktop-home-ready.png", `${base}/?generator=ready`, {
  width: 1440, height: 900, fullPage: true,
});
await shot("exhibit-desktop-home-limit.png", `${base}/?generator=limit`, {
  width: 1440, height: 900, fullPage: false,
});

{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${base}/?generator=empty`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.locator("#custom").scrollIntoViewIfNeeded();
  await page.fill(".form-exhibit input.input", "");
  await page.click(".form-exhibit .stamp.cta");
  await page.waitForSelector(".err-msg");
  await page.waitForTimeout(200);
  await page.screenshot({
    path: path.join(out, "exhibit-desktop-form-validation.png"),
    fullPage: false,
  });
  console.log("wrote exhibit-desktop-form-validation.png");
  await context.close();
}

await shot("exhibit-desktop-result.png", `${base}/results/demo`, {
  width: 1440, height: 900, fullPage: true,
});
await shot(
  "exhibit-desktop-result-open.png",
  `${base}/results/demo?paper=jingxing`,
  { width: 1440, height: 900, fullPage: true },
);

await shot("exhibit-mobile-home-empty.png", `${base}/?generator=empty`, {
  width: 390, height: 844, fullPage: true,
});
await shot("exhibit-mobile-home-ready.png", `${base}/?generator=ready`, {
  width: 390, height: 844, fullPage: true,
});
await shot("exhibit-mobile-result.png", `${base}/results/demo`, {
  width: 390, height: 844, fullPage: true,
});
await shot(
  "exhibit-mobile-result-open.png",
  `${base}/results/demo?paper=jingxing`,
  { width: 390, height: 844, fullPage: true },
);

await browser.close();
console.log("done");
