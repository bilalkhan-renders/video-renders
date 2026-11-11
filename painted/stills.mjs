// Stills pass for the documentary film: loads studio-film.html and renders ONE frame
// at the midpoint of each of the 11 scenes, for art review before the full render.
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

// [sceneId, midpointSeconds] from doc-timing.json (start + dur/2)
const STILLS = [
  ['hook', 14.32], ['rivers', 43.27], ['egypt', 74.71], ['uruk', 106.33],
  ['writing', 133.82], ['wheelbronze', 159.15], ['indus', 187.14],
  ['stonehenge', 217.00], ['china', 243.89], ['caral', 273.68], ['closing', 308.52]
];
mkdirSync('stills-out', { recursive: true });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 0, args: ['--no-sandbox', '--allow-file-access-from-files', '--window-size=1920,1080', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 400)));
page.on('console', m => console.log('[console]', m.text().slice(0, 200)));
await page.goto(pathToFileURL(resolve('studio-film.html')).href + '?render', { waitUntil: 'load', timeout: 60000 });
try {
  await page.waitForFunction('window.ready === true', { timeout: 240000, polling: 500 });
} catch (e) {
  console.log('READY TIMEOUT — scene page never became ready; page errors above');
  process.exit(1);
}
console.log('ready OK');
for (const [id, t] of STILLS) {
  const t0 = Date.now();
  const url = await page.evaluate(tt => window.renderAt(tt, 'image/jpeg', 0.88), t);
  writeFileSync('stills-out/still-' + id + '.jpg', Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log('STILL', id, t + 's', 'in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
await browser.close();
console.log('ALL STILLS DONE');
