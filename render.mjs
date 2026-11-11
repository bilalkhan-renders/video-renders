import puppeteer from 'puppeteer';
import { pathToFileURL } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const FPS = +(process.env.FPS || 24);
const DUR = +(process.env.DUR || 60);
const CHUNK = +(process.env.CHUNK || 0);
const NCHUNKS = +(process.env.NCHUNKS || 4);
const TOTAL = FPS * DUR;
const PER = Math.ceil(TOTAL / NCHUNKS);
const START = CHUNK * PER;
const END = Math.min(TOTAL, START + PER);
mkdirSync('frames', { recursive: true });
const t0 = Date.now();
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--window-size=1280,720'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(process.cwd() + '/scene.html').href, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction('window.ready === true', { timeout: 30000, polling: 200 });
for (let i = START; i < END; i++) {
  const url = await page.evaluate(t => window.renderAt(t), i / FPS);
  writeFileSync('frames/f' + String(i).padStart(5, '0') + '.jpg', Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
}
await browser.close();
execSync(`ffmpeg -y -v error -framerate ${FPS} -start_number ${START} -i frames/f%05d.jpg -frames:v ${END - START} -c:v libx264 -pix_fmt yuv420p -crf 20 chunk-${CHUNK}.mp4`, { stdio: 'inherit' });
console.log(`CHUNK ${CHUNK}: frames ${START}-${END - 1} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
