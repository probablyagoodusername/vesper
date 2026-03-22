#!/bin/bash

VP_W=390
VP_H=844
DPR=3
REAL_W=$((VP_W * DPR))
REAL_H=$((VP_H * DPR))
HOLD=3
DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="${DIR}/vesper-tabs-60fps.mp4"
CHROME_DIR="/tmp/chrome-vesper-rec"

pkill -f "Xvfb :99" 2>/dev/null || true
pkill -f "chrome.*vesper-rec" 2>/dev/null || true
pkill -f unclutter 2>/dev/null || true
sleep 1
rm -rf "$CHROME_DIR"

# Step 1: Seed localStorage with dark theme using headless Playwright
echo "Seeding dark theme..."
node -e "
const { chromium } = require('playwright');
(async () => {
  const ctx = await chromium.launchPersistentContext('${CHROME_DIR}', {
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await ctx.newPage();
  await page.goto('https://vesper.pm/home', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('vesper-theme', 'dark');
    localStorage.setItem('vesper-locale', 'en');
  });
  await ctx.close();
  console.log('Dark theme seeded');
})();
"

# Step 2: Xvfb + Chrome (reuses the seeded profile)
DISP_W=$((REAL_W + 200))
DISP_H=$((REAL_H + 200))

echo "Starting Xvfb..."
Xvfb :99 -screen 0 "${DISP_W}x${DISP_H}x24" -ac &
sleep 1
export DISPLAY=:99
unclutter -idle 0 -root &

echo "Launching Chrome with dark theme profile..."
google-chrome-stable \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --app="https://vesper.pm/home" \
  --window-size="${VP_W},${VP_H}" \
  --window-position=0,0 \
  --force-device-scale-factor="${DPR}" \
  --hide-scrollbars \
  --disable-infobars \
  --disable-notifications \
  --disable-translate \
  --disable-extensions \
  --no-first-run \
  --no-default-browser-check \
  --test-type \
  --user-data-dir="$CHROME_DIR" \
  --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
  &
CHROME_PID=$!
sleep 5

WID=$(xdotool search --pid "$CHROME_PID" 2>/dev/null | head -1)
if [ -n "$WID" ]; then
  xdotool windowmove "$WID" 0 0
  xdotool windowsize "$WID" "$VP_W" "$VP_H"
fi
sleep 1
xdotool mousemove $((REAL_W+100)) $((REAL_H+100))

echo "Recording 60fps..."
ffmpeg -y -f x11grab -framerate 60 -video_size ${REAL_W}x${REAL_H} -i :99+0,0 \
  -c:v libx264 -crf 12 -preset ultrafast -pix_fmt yuv420p "$OUTPUT" &
FF_PID=$!
sleep 2

sleep $HOLD
NAV_Y=$((REAL_H - 40))

echo "Breathe"
xdotool mousemove $((REAL_W*3/10)) $NAV_Y click 1; xdotool mousemove $((REAL_W+100)) $((REAL_H+100)); sleep $HOLD

echo "Meditate"
xdotool mousemove $((REAL_W*5/10)) $NAV_Y click 1; xdotool mousemove $((REAL_W+100)) $((REAL_H+100)); sleep $HOLD

echo "Sleep"
xdotool mousemove $((REAL_W*7/10)) $NAV_Y click 1; xdotool mousemove $((REAL_W+100)) $((REAL_H+100)); sleep $HOLD

kill $FF_PID 2>/dev/null; wait $FF_PID 2>/dev/null || true
kill $CHROME_PID 2>/dev/null || true
pkill -f unclutter 2>/dev/null || true
pkill -f "Xvfb :99" 2>/dev/null || true

ffmpeg -y -i "$OUTPUT" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p "${OUTPUT%.mp4}-q.mp4" 2>/dev/null
mv "${OUTPUT%.mp4}-q.mp4" "$OUTPUT"
rm -rf "$CHROME_DIR"

echo "Done: $OUTPUT"
ls -lh "$OUTPUT"
