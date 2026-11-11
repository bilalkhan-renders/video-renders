// Full-film chunk renderer for the documentary: loads studio-film.html and renders
// this chunk's share of the frames (env CHUNK/NCHUNKS/FPS/DUR) as JPEG stills.
import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';
const FPS = +(process.env.FPS || 8), DUR = +(process.env.DUR || 326);
const CHUNK = +(process.env.CHUNK || 0), NCHUNKS = +(process.env.NCHUNKS || 20);
const TOTAL = FPS * DUR, PER = Math.ceil(TOTAL / NCHUNKS);
const START = CHUNK * PER, END = Math.min(TOTAL, START + PER);
mkdirSync('frames', { recursive: true });
const browser = await puppeteer.launch({ headless: true, protocolTimeout: 0, args: ['--no-sandbox', '--allow-file-access-from-files', '--window-size=1920,1080', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 250)));
await page.goto(pathToFileURL(resolve('studio-film.html')).href + '?render', { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.ready === true', { timeout: 300000, polling: 500 });
console.log('ready OK chunk', CHUNK, 'frames', START, '-', END - 1);
const t0 = Date.now();
for (let i = START; i < END; i++) {
  const url = await page.evaluate(t => window.renderAt(t, 'image/jpeg', 0.88), i / FPS);
  writeFileSync('frames/f' + String(i).padStart(4, '0') + '.jpg', Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  if ((i - START) % 25 === 0) console.log('chunk', CHUNK, 'frame', i, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
console.log('FILMCHUNK', CHUNK, 'done', END - START, 'frames in', ((Date.now() - t0) / 1000).toFixed(1), 's');
await browser.close();
