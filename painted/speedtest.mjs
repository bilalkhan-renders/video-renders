import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
mkdirSync('frames', { recursive: true });
const t00 = Date.now();
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 0, args: ['--no-sandbox', '--allow-file-access-from-files', '--window-size=1920,1080', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 250)));
await page.goto(pathToFileURL(resolve('studio.html')).href + '?render', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.ready === true', { timeout: 300000, polling: 500 });
const setupMs = Date.now() - t00;
console.log('ready OK, setup ms:', setupMs);
const times = [];
for (let i = 0; i < 6; i++) {
  const t = 3.0 + i * 0.5, s = Date.now();
  const url = await page.evaluate(t => window.renderAt(t, 'image/jpeg', 0.88), t);
  writeFileSync('frames/f' + String(i).padStart(2, '0') + '.jpg', Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  const ms = Date.now() - s;
  times.push(ms);
  console.log('frame', i, 't=' + t.toFixed(1), ms + 'ms');
}
const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
console.log('SPEEDTEST setup_ms=' + setupMs + ' frame_avg_ms=' + avg + ' frames=' + times.join(','));
await browser.close();
