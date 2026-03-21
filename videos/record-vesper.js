const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const VIEWPORT = { width: 390, height: 844 };
const DEVICE_SCALE_FACTOR = 3;
const OUTPUT_DIR = path.resolve(__dirname);
const OUTPUT_FILE = "vesper-tabs.webm";
const HOLD_MS = 3500;
const SETTLE_MS = 2000;
const LOAD_MS = 3000;

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  console.log("Launching browser…");
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      `--force-device-scale-factor=${DEVICE_SCALE_FACTOR}`,
    ],
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: {
        width: VIEWPORT.width * DEVICE_SCALE_FACTOR,
        height: VIEWPORT.height * DEVICE_SCALE_FACTOR,
      },
    },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
      "Version/17.0 Mobile/15E148 Safari/604.1",
    reducedMotion: "no-preference",
    colorScheme: "dark",
    locale: "en-US",
    timezoneId: "Europe/Paris",
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  // Start on Home
  console.log("Navigating to vesper.pm/home…");
  await page.goto("https://vesper.pm/home", { waitUntil: "networkidle" });
  await wait(LOAD_MS);
  console.log(`Holding on Home for ${HOLD_MS}ms…`);
  await wait(HOLD_MS);

  // Click through tabs: Home → Breathe → Meditate → Sleep
  for (const tab of ["Breathe", "Meditate", "Sleep"]) {
    console.log(`Clicking ${tab}…`);
    await clickTab(page, tab);
    await wait(SETTLE_MS);
    console.log(`Holding on ${tab} for ${HOLD_MS}ms…`);
    await wait(HOLD_MS);
  }

  console.log("Closing context — finalising video…");
  await context.close();
  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".webm") && f !== OUTPUT_FILE);
  if (files.length) {
    const src = path.join(OUTPUT_DIR, files[files.length - 1]);
    const dst = path.join(OUTPUT_DIR, OUTPUT_FILE);
    fs.renameSync(src, dst);
    console.log(`\nDone! Video saved to: ${dst}`);
    console.log(`\nTo convert to MP4:`);
    console.log(`  ffmpeg -i ${dst} -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p ${dst.replace('.webm', '.mp4')}`);
  } else {
    console.warn("No .webm file found — check Playwright output.");
  }
})();

async function clickTab(page, label) {
  const strategies = [
    () => page.getByRole("link", { name: new RegExp(label, "i") }).first().click(),
    () => page.getByRole("button", { name: new RegExp(label, "i") }).first().click(),
    () => page.locator(`text=${label}`).first().click(),
    () => page.locator(`a:has-text("${label}")`).first().click(),
    () => page.locator(`[data-en="${label}"]`).first().click(),
  ];
  for (const strategy of strategies) {
    try { await strategy(); return; } catch (_) {}
  }
  console.warn(`  ⚠ Could not find tab "${label}" — skipping`);
}
