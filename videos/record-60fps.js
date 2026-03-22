const { chromium } = require("playwright");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const VIEWPORT = { width: 390, height: 844 };
const DPR = 3;
const FPS = 60;
const FRAME_DIR = path.resolve(__dirname, "frames");
const HOLD_FRAMES = FPS * 3; // 3 seconds per tab
const TRANSITION_FRAMES = Math.ceil(FPS * 0.5); // 0.5s transition buffer

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  // Clean frames dir
  if (fs.existsSync(FRAME_DIR)) fs.rmSync(FRAME_DIR, { recursive: true });
  fs.mkdirSync(FRAME_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", `--force-device-scale-factor=${DPR}`],
  });

  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: DPR,
    colorScheme: "dark",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    reducedMotion: "no-preference",
  });

  let frameNum = 0;
  const pad = (n) => String(n).padStart(6, "0");

  async function captureFrames(count) {
    for (let i = 0; i < count; i++) {
      await page.screenshot({
        path: path.join(FRAME_DIR, `${pad(frameNum++)}.png`),
        type: "png",
      });
    }
  }

  // Navigate to home
  console.log("Home...");
  await page.goto("https://vesper.pm/home", { waitUntil: "networkidle" });
  await sleep(500);
  await captureFrames(HOLD_FRAMES);

  // Click through tabs
  for (const tab of ["Breathe", "Meditate", "Sleep"]) {
    console.log(`Clicking ${tab}...`);
    try {
      await page.getByRole("link", { name: new RegExp(tab, "i") }).first().click();
    } catch {
      await page.locator(`a:has-text("${tab}")`).first().click();
    }
    await sleep(300); // let page start loading
    await captureFrames(TRANSITION_FRAMES); // capture during load/animation
    await page.waitForLoadState("networkidle").catch(() => {});
    await sleep(200);
    await captureFrames(HOLD_FRAMES);
  }

  await browser.close();
  console.log(`Captured ${frameNum} frames`);

  // Assemble with ffmpeg at true 60fps
  console.log("Assembling video...");
  const outFile = path.resolve(__dirname, "vesper-tabs-60fps.mp4");
  execSync(`ffmpeg -y -framerate ${FPS} -i "${FRAME_DIR}/${pad(0).replace(/0/g, '%')}%06d.png" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "${outFile}"`, { stdio: "inherit" });

  console.log(`\nDone: ${outFile}`);
  console.log(`Frames: ${frameNum}, FPS: ${FPS}, Duration: ${(frameNum/FPS).toFixed(1)}s`);

  // Cleanup frames
  fs.rmSync(FRAME_DIR, { recursive: true });
})();
