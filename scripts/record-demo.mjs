import puppeteer from 'puppeteer';
import { execFileSync } from 'child_process';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';

const WIDTH = 390;
const HEIGHT = 844;
const DPR = 2;
const FPS = 60;
const OUTPUT = 'assets/readme/demo.mp4';
const FRAME_DIR = mkdtempSync('/tmp/vesper-frames-');

console.log('Launching Chrome...');
const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/opt/google/chrome/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: DPR });

// Take a high-DPI screenshot for each frame
let frameNum = 0;
async function captureFrames(durationMs) {
  const interval = 1000 / FPS;
  const count = Math.round(durationMs / interval);
  for (let i = 0; i < count; i++) {
    const path = join(FRAME_DIR, `frame-${String(frameNum++).padStart(5, '0')}.png`);
    await page.screenshot({ path, type: 'png' });
  }
}

// Capture a smooth transition by taking rapid screenshots
async function captureTransition(ms = 800) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const path = join(FRAME_DIR, `frame-${String(frameNum++).padStart(5, '0')}.png`);
    await page.screenshot({ path, type: 'png' });
  }
}

await page.goto('https://vesper.pm/home/', { waitUntil: 'networkidle0' });
console.log('Home loaded');
await captureFrames(1500);

console.log('→ Breathe');
await page.click('nav a[href="/breathe"]');
await captureTransition(1200);
await captureFrames(800);

console.log('→ Meditate');
await page.click('nav a[href="/meditate"]');
await captureTransition(1200);
await captureFrames(800);

console.log('→ Sleep');
await page.click('nav a[href="/sleep"]');
await captureTransition(1200);
await captureFrames(800);

console.log('→ Home');
await page.click('nav a[href="/home"]');
await captureTransition(1200);
await captureFrames(800);

console.log('→ Scroll');
await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'smooth' }));
await captureTransition(1000);
await captureFrames(500);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
await captureTransition(1000);
await captureFrames(500);

console.log('→ Today');
await page.click('a[href="/today"]');
await captureTransition(1200);
await captureFrames(600);
await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'smooth' }));
await captureTransition(1200);
await captureFrames(800);

await browser.close();

console.log(`Captured ${frameNum} frames. Encoding at ${FPS}fps...`);

// Stitch frames into video
execFileSync('ffmpeg', [
  '-framerate', String(FPS),
  '-i', join(FRAME_DIR, 'frame-%05d.png'),
  '-c:v', 'libx264',
  '-crf', '18',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-y',
  OUTPUT,
]);

rmSync(FRAME_DIR, { recursive: true });

const sizeOutput = execFileSync('du', ['-sh', OUTPUT]).toString().trim();
console.log(`Done: ${OUTPUT} (${sizeOutput.split('\t')[0]})`);
