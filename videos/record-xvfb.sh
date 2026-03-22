#!/bin/bash
set -euo pipefail

VP_W=390
VP_H=844
DPR=3
REAL_W=$((VP_W * DPR))
REAL_H=$((VP_H * DPR))
DISPLAY_NUM=99
HOLD=3
OUTPUT="$(dirname "$0")/vesper-tabs-60fps.mp4"
CHROME_DIR="/tmp/chrome-vesper-recording"

# Clean previous
kill $(pgrep -f "Xvfb :${DISPLAY_NUM}") 2>/dev/null || true
kill $(pgrep -f "chrome.*vesper-recording") 2>/dev/null || true
sleep 1
rm -rf "$CHROME_DIR"

DISP_W=$((REAL_W + 200))
DISP_H=$((REAL_H + 200))

echo "Starting Xvfb..."
Xvfb ":${DISPLAY_NUM}" -screen 0 "${DISP_W}x${DISP_H}x24" -ac &
XVFB_PID=$!
sleep 1
export DISPLAY=":${DISPLAY_NUM}"

unclutter -idle 0 -root &
UNCLUTTER_PID=$!

# Step 1: Use Playwright to open Chrome, set dark theme, leave it open
echo "Setting dark mode via Playwright..."
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launchPersistentContext('${CHROME_DIR}', {
    headless: false,
    viewport: { width: ${VP_W}, height: ${VP_H} },
    deviceScaleFactor: ${DPR},
    colorScheme: 'dark',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--force-device-scale-factor=${DPR}',
      '--window-size=${VP_W},${VP_H}',
      '--window-position=0,0',
      '--hide-scrollbars',
      '--disable-infobars',
      '--test-type',
      '--disable-extensions',
      '--no-first-run',
    ],
  });
  const page = browser.pages()[0] || await browser.newPage();
  await page.goto('https://vesper.pm/home', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('vesper-theme', 'dark');
    localStorage.setItem('vesper-locale', 'en');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await new Promise(r => setTimeout(r, 2000));

  // Write PID for cleanup
  const { execFileSync } = require('child_process');
  const pid = execFileSync('pgrep', ['-f', 'chrome.*vesper-recording']).toString().trim().split('\\n')[0];
  require('fs').writeFileSync('/tmp/playwright-browser-pid.txt', pid);
  // Don't close — leave browser open for recording
  console.log('Dark mode set, browser open');
})();
" &
PW_PID=$!
sleep 12

# Get the Chrome window
CHROME_PID=$(cat /tmp/playwright-browser-pid.txt 2>/dev/null || echo "")
if [[ -z "$CHROME_PID" ]]; then
  echo "Failed to get Chrome PID"
  kill "$XVFB_PID" "$UNCLUTTER_PID" 2>/dev/null
  exit 1
fi

CHROME_WID=$(xdotool search --pid "$CHROME_PID" 2>/dev/null | tail -1)
if [[ -n "$CHROME_WID" ]]; then
  xdotool windowactivate "$CHROME_WID"
  xdotool windowmove "$CHROME_WID" 0 0
  xdotool windowsize "$CHROME_WID" "$VP_W" "$VP_H"
  sleep 1
  eval $(xdotool getwindowgeometry --shell "$CHROME_WID" 2>/dev/null)
  echo "Chrome window: ${WIDTH}x${HEIGHT}"
fi

xdotool mousemove "$((REAL_W + 100))" "$((REAL_H + 100))"

echo "Starting ffmpeg at 60fps..."
ffmpeg -y \
  -f x11grab -framerate 60 \
  -video_size "${REAL_W}x${REAL_H}" \
  -i ":${DISPLAY_NUM}+0,0" \
  -c:v libx264 -crf 12 -preset ultrafast -pix_fmt yuv420p \
  "$OUTPUT" &
FFMPEG_PID=$!
sleep 2

echo "Holding Home ${HOLD}s..."
sleep "$HOLD"

NAV_Y=$((REAL_H - 40))
click_tab() {
  local index=$1
  local name=$2
  local x=$(( REAL_W * (2 * index + 1) / 10 ))
  echo "Clicking ${name}..."
  xdotool mousemove "$x" "$NAV_Y" click 1
  xdotool mousemove "$((REAL_W + 100))" "$((REAL_H + 100))"
  sleep "$HOLD"
}

click_tab 1 "Breathe"
click_tab 2 "Meditate"
click_tab 3 "Sleep"

echo "Stopping..."
kill "$FFMPEG_PID" 2>/dev/null; wait "$FFMPEG_PID" 2>/dev/null || true
kill "$PW_PID" 2>/dev/null || true
kill "$CHROME_PID" 2>/dev/null || true
kill "$UNCLUTTER_PID" 2>/dev/null || true
kill "$XVFB_PID" 2>/dev/null || true

echo "Re-encoding..."
ffmpeg -y -i "$OUTPUT" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p "${OUTPUT%.mp4}-final.mp4" 2>/dev/null
mv "${OUTPUT%.mp4}-final.mp4" "$OUTPUT"

rm -rf "$CHROME_DIR" /tmp/playwright-browser-pid.txt

echo "Done: $OUTPUT"
ls -lh "$OUTPUT"
