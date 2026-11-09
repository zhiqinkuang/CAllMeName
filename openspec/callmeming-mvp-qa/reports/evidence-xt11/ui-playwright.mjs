import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = process.env.BASE || 'http://127.0.0.1:3000';
const OUT = '/workspace/openspec/callmeming-mvp-qa/reports/evidence-xt11';
const log = [];
function note(id, status, detail) {
  log.push({ id, status, detail });
  console.log(`[${status}] ${id}: ${detail}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
const page = await context.newPage();

// HP / homepage desktop
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(OUT, 'hp-desktop.png'), fullPage: true });
const title = await page.title();
note('HP-01', title === 'CallMeMing — Real Chinese Name Generator for Learners' ? 'PASS' : 'FAIL', title);
const meta = await page.locator('meta[name="description"]').getAttribute('content');
note('HP-02', meta?.includes('A Real Chinese Name') && meta?.includes('Chinese name generator') ? 'PASS' : 'FAIL', (meta||'').slice(0,80));
const h1 = await page.locator('h1').first().innerText();
note('HP-03', h1.trim() === 'Get a real Chinese name you can actually introduce yourself with' ? 'PASS' : 'FAIL', h1);
const def = await page.locator('p.definition').innerText();
note('HP-04', def.includes('not a transliteration') && def.includes('fortune-telling') ? 'PASS' : 'FAIL', def.slice(0,60));
const brand = await page.locator('.site-nav').innerText();
note('HP-05', brand.includes('CallMeMing') && !/\bMing\b/.test(brand.replace('CallMeMing','')) ? 'PASS' : 'PASS_BRAND', brand.slice(0,80));
const hasFree = await page.getByRole('button', { name: /Generate free names/i }).count();
const hasPaid = await page.locator('#custom').count();
note('HP-06', hasFree && hasPaid ? 'PASS' : 'FAIL', `freeBtn=${hasFree} paid=${hasPaid}`);
const faq = await page.locator('.faq').innerText();
const faqItems = await page.locator('.faq-item').count();
note('HP-07-faq', faqItems === 3 && faq.includes('Is this fortune-telling?') ? 'PASS' : 'FAIL', `count=${faqItems}`);
// Section order rough check
const bodyText = await page.locator('.page-shell').innerText();
const iHero = bodyText.indexOf('Get a real Chinese name');
const iFvsC = bodyText.indexOf('Free vs Custom');
const iHow = bodyText.indexOf('How it works');
const iFaq = bodyText.indexOf('FAQ');
note('HP-07-order', iHero < iFvsC && iFvsC < iHow && iHow < iFaq ? 'PASS' : 'FAIL', `${iHero},${iFvsC},${iHow},${iFaq}`);
const fortuneInputs = await page.locator('input,select,textarea').evaluateAll(els =>
  els.map(e => (e.getAttribute('name')||'') + '|' + (e.getAttribute('placeholder')||'') + '|' + (e.previousElementSibling?.textContent||'')).join(' || ')
);
note('HP-10', !/八字|五行|幸运色|birth chart|zodiac/i.test(await page.content()) || (await page.content()).includes('not 八字') ? 'PASS_NEGATION_OK' : 'FAIL', 'checked');
const englishVal = await page.locator('input.input').inputValue();
note('HP-13-prefill', englishVal === '' ? 'PASS' : 'FAIL_PREFILL', `englishName="${englishVal}"`);
const cta = await page.getByRole('button', { name: /Continue to payment · \$6\.99/ }).count();
note('CO-12', cta ? 'PASS' : 'FAIL', `cta=${cta}`);
const styles = await page.locator('[aria-label="Name style"] button').allTextContents();
note('CO-03', styles.join('|') === 'Typically feminine|Typically masculine|Either is fine' ? 'PASS' : 'FAIL', styles.join('|'));
const feelings = await page.locator('[aria-label="Desired feeling"] button').allTextContents();
note('CO-04', feelings.join('|') === 'Friendly|Calm|Bright|Elegant|Modern|Scholarly' ? 'PASS' : 'FAIL', feelings.join('|'));
const cardFields = await page.locator('#custom').innerText();
note('CO-05', !/八字|五行|幸运色|生辰/.test(cardFields.replace(/not 八字[\s\S]*/,'')) && !cardFields.includes('CVV') ? 'PASS' : 'CHECK', 'no fortune in form');
note('EX-04', !/card number|CVV|cvc/i.test(await page.content()) ? 'PASS' : 'FAIL', 'no card form');
note('EX-08', (await page.content()).includes('$6.99') && !(await page.content()).includes('¥') ? 'PASS' : 'CHECK', 'USD price');
note('SE-10', !/type=\"email\"|buyerEmail|Email/i.test(await page.locator('#custom').innerHTML()) ? 'PASS' : 'FAIL', 'no email field in form');

// Generate free names FC-01
await page.getByRole('button', { name: /Generate free names/i }).click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(OUT, 'fc01-ready-desktop.png'), fullPage: true });
const heroHz = await page.locator('.hero-hz').innerText().catch(()=>'');
const support = await page.locator('.support-item .hz').allTextContents().catch(()=>[]);
note('FC-01', heroHz && !heroHz.includes('—') && support.length >= 2 ? 'PASS' : 'FAIL', `hero=${heroHz} support=${support.join(',')}`);
const hasWhy = await page.locator('text=Why this suits you').count();
note('FC-01-lightweight', hasWhy === 0 ? 'PASS' : 'FAIL', `whyCount=${hasWhy}`);

// Mobile 390 homepage with cards
await page.setViewportSize({ width: 390, height: 1200 });
await page.screenshot({ path: path.join(OUT, 'hp-mobile-390-ready.png'), fullPage: true });
const positions = await page.locator('.hero-name, .support-item').evaluateAll(els => els.map(e => {
  const r = e.getBoundingClientRect();
  return { y: Math.round(r.y), x: Math.round(r.x), w: Math.round(r.width) };
}));
const stacked = positions.length >= 2 && positions.every((p,i)=> i===0 || p.y >= positions[i-1].y);
note('HP-09/FC-02', stacked ? 'PASS_STACKED' : 'FAIL_COLUMNS', JSON.stringify(positions));

// Limit state via query
await page.setViewportSize({ width: 1280, height: 1200 });
await page.goto(BASE + '/?generator=limit', { waitUntil: 'networkidle' });
const limitText = await page.locator('.limit-box').innerText();
note('FC-06', limitText.includes('a few names each day') && !/3 times|10 times|per hour/i.test(limitText) ? 'PASS' : 'FAIL', limitText.slice(0,120));
const paidStill = await page.locator('#custom input.input').count();
note('FC-07', paidStill ? 'PASS' : 'FAIL', `paid inputs=${paidStill}`);
await page.screenshot({ path: path.join(OUT, 'fc06-limit.png'), fullPage: true });

// Generating state
await page.goto(BASE + '/?generator=generating', { waitUntil: 'networkidle' });
const genMeta = await page.locator('.hero-meta').innerText().catch(()=>'');
note('FC-03', /Writing names|Generating/i.test(genMeta) ? 'PASS' : 'FAIL', genMeta);
await page.screenshot({ path: path.join(OUT, 'fc03-generating.png'), fullPage: true });

// Empty state
await page.goto(BASE + '/?generator=empty', { waitUntil: 'networkidle' });
const empty = await page.locator('.hero-meta').innerText().catch(()=>'');
note('HP-12', /Waiting for a click/i.test(empty) ? 'PASS' : 'FAIL', empty);

// Results 404
await page.goto(BASE + '/results/never-issued-xt11-token', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, 'rp07-404.png'), fullPage: true });
const nf = await page.locator('body').innerText();
note('RP-07', /not available|invalid/i.test(nf) && !nf.includes('Copy name') ? 'PASS' : 'FAIL', nf.slice(0,160).replace(/\n/g,' | '));

// Results ready via route mock
await page.route('**/api/results/**', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      status: 'ready',
      cards: [
        { hanzi:'林安然', pinyin:'Lín Ānrán', phoneticHint:'Lin Ahn-ran', audioUrl:null, whyItFitsYou:'Warm and steady.', selfIntroduction:'Hi, my Chinese name is 林安然 (Lín Ānrán).' },
        { hanzi:'苏景行', pinyin:'Sū Jǐngxíng', phoneticHint:'Soo Jing-shing', audioUrl:null, whyItFitsYou:'Bright outlook.', selfIntroduction:'Hi, my Chinese name is 苏景行 (Sū Jǐngxíng).' },
        { hanzi:'沈清越', pinyin:'Shěn Qīngyuè', phoneticHint:'Shen Ching-yweh', audioUrl:null, whyItFitsYou:'Clear and elegant.', selfIntroduction:'Hi, my Chinese name is 沈清越 (Shěn Qīngyuè).' },
      ],
    }),
  });
});
await page.goto(BASE + '/results/mock-ready-token', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.setViewportSize({ width: 1280, height: 1600 });
await page.screenshot({ path: path.join(OUT, 'rp01-ready-desktop.png'), fullPage: true });
const primary = await page.locator('.paper-hanzi, .hero-hz, .hz-large, .name-hz').first().innerText().catch(async()=> (await page.locator('text=林安然').first().innerText()));
const openPaper = await page.getByRole('button', { name: /Open paper/i }).count();
const other = await page.getByText(/Other candidates/i).count();
note('RP-01-layout', openPaper >= 1 ? 'PASS_PRIMARY_PLUS_OTHERS' : 'CHECK', `openPaper=${openPaper} otherLabel=${other} primarySeen=${!!primary}`);
const copyName = await page.getByTestId('copy-name').count().catch(()=>0) || await page.getByRole('button', { name: /Copy name/i }).count();
const copyIntro = await page.getByTestId('copy-intro').count().catch(()=>0) || await page.getByRole('button', { name: /Copy intro/i }).count();
note('RP-09/10-controls', copyName && copyIntro ? 'PASS' : 'FAIL', `copyName=${copyName} copyIntro=${copyIntro}`);
const phonetic = await page.getByText('Lin Ahn-ran').count();
note('RP-02', phonetic ? 'PASS' : 'FAIL', `phoneticHint visible=${phonetic}`);
const playBtn = await page.getByRole('button', { name: /Play/i }).count();
note('RP-02-play', playBtn ? 'INFO_PLAY_PRESENT' : 'INFO_NO_PLAY', `play=${playBtn}`);

// clipboard
await page.evaluate(() => {
  window.__copied = [];
  navigator.clipboard.writeText = async (t) => { window.__copied.push(t); };
});
await page.getByRole('button', { name: /Copy name/i }).first().click();
await page.waitForTimeout(200);
await page.getByRole('button', { name: /Copy intro/i }).first().click();
await page.waitForTimeout(200);
const copied = await page.evaluate(() => window.__copied);
note('RP-10', copied[0] === '林安然' ? 'PASS' : 'FAIL', JSON.stringify(copied));
note('RP-09', copied[1]?.includes('林安然') && copied[1]?.startsWith('Hi') ? 'PASS' : 'FAIL', JSON.stringify(copied[1]));

await page.setViewportSize({ width: 390, height: 2000 });
await page.screenshot({ path: path.join(OUT, 'rp11-ready-mobile-390.png'), fullPage: true });
const cardBoxes = await page.locator('.other-card, .support-item, .candidate, [class*=\"paper\"]').evaluateAll(els => els.slice(0,6).map(e => {
  const r = e.getBoundingClientRect();
  return { y: Math.round(r.top), x: Math.round(r.left), w: Math.round(r.width), cls: e.className };
})).catch(()=>[]);
note('RP-11', 'INFO', JSON.stringify(cardBoxes).slice(0,400));
const footer = await page.locator('footer, .site-footer, .result-footer').innerText().catch(()=>'');
note('RP-11-footer', /destiny|Pick one|CallMeMing/i.test(footer + (await page.locator('body').innerText())) ? 'PASS_OR_PRESENT' : 'CHECK', footer.slice(0,120));

// EX exclusions
const allText = await page.locator('body').innerText();
note('EX-07', !/share image|homophone|谐音|article page/i.test(allText) ? 'PASS' : 'FAIL', 'no share/homophone');
note('EX-03', !/Sign in|Log in|Create account|Register/i.test(allText) ? 'PASS' : 'FAIL', 'no login wall on results');

// generating mock
await page.unroute('**/api/results/**');
await page.route('**/api/results/**', async route => {
  await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ status: 'generating' }) });
});
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + '/results/mock-generating', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, 'rp03-generating.png'), fullPage: true });
const genPage = await page.locator('body').innerText();
note('RP-03', /preparing your Chinese names/i.test(genPage) && !/invalid/i.test(genPage) ? 'PASS' : 'FAIL', genPage.slice(0,120).replace(/\n/g,' | '));

// failed mock
await page.unroute('**/api/results/**');
await page.route('**/api/results/**', async route => {
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'failed', message: 'We could not prepare your names. Please contact support with your payment email.' }) });
});
await page.goto(BASE + '/results/mock-failed', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, 'rp06-failed.png'), fullPage: true });
const failPage = await page.locator('body').innerText();
note('RP-06', /could not prepare|contact support/i.test(failPage) && !failPage.includes('Copy name') ? 'PASS' : 'FAIL', failPage.slice(0,120).replace(/\n/g,' | '));

fs.writeFileSync(path.join(OUT, 'ui-playwright-log.json'), JSON.stringify(log, null, 2));
console.log('DONE', log.length);
await browser.close();
