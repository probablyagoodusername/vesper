#!/usr/bin/env bash
set -euo pipefail

# Record a high-quality demo video of Vesper using Xvfb + Chrome + ffmpeg
# Usage: bash scripts/record-demo.sh

DISPLAY_NUM=99
# iPhone 15 Pro dimensions at 2x = crisp retina rendering
WIDTH=780
HEIGHT=1688
FPS=60
DURATION=20
OUTPUT="assets/readme/demo.mp4"

echo "Starting Xvfb at ${WIDTH}x${HEIGHT}..."
Xvfb ":${DISPLAY_NUM}" -screen 0 "${WIDTH}x${HEIGHT}x24" &
XVFB_PID=$!
sleep 1

export DISPLAY=":${DISPLAY_NUM}"

echo "Launching Chrome..."
google-chrome \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --window-size="${WIDTH},${HEIGHT}" \
  --window-position=0,0 \
  --force-device-scale-factor=2 \
  --hide-scrollbars \
  --disable-infobars \
  --disable-extensions \
  --disable-translate \
  --no-first-run \
  --kiosk \
  "https://vesper.pm/home/" &
CHROME_PID=$!

echo "Waiting for Chrome to load..."
sleep 5

echo "Recording at ${FPS}fps for ${DURATION}s..."
ffmpeg \
  -f x11grab \
  -framerate "${FPS}" \
  -video_size "${WIDTH}x${HEIGHT}" \
  -i ":${DISPLAY_NUM}" \
  -c:v libx264 \
  -crf 18 \
  -preset slow \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -t "${DURATION}" \
  -y \
  "${OUTPUT}" 2>/dev/null &
FFMPEG_PID=$!

# Drive interactions via xdotool
sleep 2

# Click Breathe tab (bottom nav, roughly 1/4 from left)
echo "→ Breathe"
xdotool mousemove $((WIDTH * 2 / 10)) $((HEIGHT - 30)) click 1
sleep 2

# Click Meditate tab
echo "→ Meditate"
xdotool mousemove $((WIDTH * 4 / 10)) $((HEIGHT - 30)) click 1
sleep 2

# Click Sleep tab
echo "→ Sleep"
xdotool mousemove $((WIDTH * 6 / 10)) $((HEIGHT - 30)) click 1
sleep 2

# Click Home tab
echo "→ Home"
xdotool mousemove $((WIDTH * 1 / 10)) $((HEIGHT - 30)) click 1
sleep 2

# Scroll down
echo "→ Scroll"
xdotool mousemove $((WIDTH / 2)) $((HEIGHT / 2))
for i in $(seq 1 8); do
  xdotool click 5
  sleep 0.1
done
sleep 1

# Scroll back up
for i in $(seq 1 8); do
  xdotool click 4
  sleep 0.1
done
sleep 2

# Wait for recording to finish
wait "${FFMPEG_PID}" 2>/dev/null || true

echo "Cleaning up..."
kill "${CHROME_PID}" 2>/dev/null || true
kill "${XVFB_PID}" 2>/dev/null || true

echo "Done: ${OUTPUT} ($(du -sh "${OUTPUT}" | cut -f1))"
