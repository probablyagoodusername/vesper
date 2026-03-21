const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const VIEWPORT = { width: 390, height: 844 };
const DPR = 3;
const FPS = 60;
const INTERVAL = 1000 / FPS;
const FRAMES_DIR = path.resolve(__dirname, "frames");
const HOLD_MS = 3500;
const SETTLE_MS = 1500;
const LOAD_MS = 3000;

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", `--force-device-scale-factor=${DPR}`],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DPR,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    reducedMotion: "no-preference",
    colorScheme: "dark",
    locale: "en-US",
  });

  const page = await context.newPage();
  let frameNum = 0;
  let capturing = false;

  async function captureFrames(durationMs) {
    const end = Date.now() + durationMs;
    while (Date.now() < end) {
      const name = String(frameNum++).padStart(6, "0");
      await page.screenshot({ path: path.join(FRAMES_DIR, `${name}.png`), type: "png" });
    }
  }

  console.log("Navigating to Home…");
  await page.goto("https://vesper.pm/home", { waitUntil: "networkidle" });
  await wait(1000);
  await captureFrames(HOLD_MS);

  for (const tab of ["Breathe", "Meditate", "Sleep"]) {
    console.log(`Clicking ${tab}…`);
    // Start capturing BEFORE click to catch the transition
    const clickPromise = (async () => {
      await wait(100); // tiny delay so capture starts first
      await clickTab(page, tab);
    })();
    await captureFrames(SETTLE_MS + HOLD_MS);
    await clickPromise.catch(() => {});
  }

  await browser.close();
  console.log(`Captured ${frameNum} frames`);
  console.log("Assembling with ffmpeg…");
})();

async function clickTab(page, label) {
  try { await page.getByRole("link", { name: new RegExp(label, "i") }).first().click(); return; } catch (_) {}
  try { await page.locator(`a:has-text("${label}")`).first().click(); return; } catch (_) {}
  try { await page.locator(`text=${label}`).first().click(); return; } catch (_) {}
  console.warn(`  ⚠ Could not find tab "${label}"`);
}
