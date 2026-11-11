// Absolute-range renderer: renders frames [FSTART, FEND) of the film at FPS,
// used to split a slow chunk across several runners. Frame files keep their
// global names (frames/f<index>.jpg), identical to render-film.mjs output.
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
const FPS = +(process.env.FPS || 8);
const START = +(process.env.FSTART || 0), END = +(process.env.FEND || 0);
mkdirSync('frames', { recursive: true });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 0, args: ['--no-sandbox', '--allow-file-access-from-files', '--window-size=1920,1080', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 250)));
await page.goto(pathToFileURL(resolve('studio-film.html')).href + '?render', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.ready === true', { timeout: 300000, polling: 500 });
console.log('ready OK range', START, '-', END - 1);
const t0 = Date.now();
for (let i = START; i < END; i++) {
  const url = await page.evaluate(t => window.renderAt(t, 'image/jpeg', 0.88), i / FPS);
  writeFileSync('frames/f' + String(i).padStart(4, '0') + '.jpg', Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  if ((i - START) % 10 === 0) console.log('range', START, 'frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
console.log('RANGE', START, END, 'done', END - START, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await browser.close();
