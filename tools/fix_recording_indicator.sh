#!/usr/bin/env bash
set -euo pipefail

# Fix iPhone screen recording: removes DI recording indicator + status bar elements
# Uses delogo to erase recording glow + time/signal/battery, then overlays a real DI pill
#
# Usage: ./fix_recording_indicator.sh input.mov [output.mp4]
# Requires: ffmpeg, python3 with Pillow
# Assets:  pill.png (3x DI pill with alpha) in same directory as this script

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT="${1:?Usage: $0 input.mov [output.mp4]}"
OUTPUT="${2:-${INPUT%.*}_clean.mp4}"
PILL_ASSET="${SCRIPT_DIR}/pill.png"

if [[ ! -f "$PILL_ASSET" ]]; then
  echo "Error: pill.png not found in $SCRIPT_DIR"
  exit 1
fi

OVERLAY_DIR="$(mktemp -d)"
OVERLAY="$OVERLAY_DIR/overlay.png"
trap 'rm -rf "$OVERLAY_DIR"' EXIT

echo "→ Analyzing video..."
read -r VW VH < <(ffprobe -v quiet -select_streams v:0 \
  -show_entries stream=width,height -of csv=p=0 "$INPUT" | tr ',' ' ')
echo "  Resolution: ${VW}x${VH}"

echo "→ Preparing DI pill overlay..."
python3 - "$VW" "$VH" "$PILL_ASSET" "$OVERLAY" << 'PYEOF'
import sys
from PIL import Image

vid_w, vid_h = int(sys.argv[1]), int(sys.argv[2])
pill = Image.open(sys.argv[3]).convert("RGBA")
out = sys.argv[4]

# Center pill.png on video canvas (pill is screen-only, video may include edges)
offset_x = (vid_w - pill.width) // 2
offset_y = (vid_h - pill.height) // 2

# Create overlay strip (top 200px is enough to cover the DI area)
strip_h = 200
full = Image.new("RGBA", (vid_w, strip_h), (0, 0, 0, 0))

# Crop pill to top strip and paste centered
pill_strip = pill.crop((0, 0, pill.width, min(strip_h - offset_y, pill.height)))
full.paste(pill_strip, (offset_x, offset_y), pill_strip)
full.save(out)

print(f"  Overlay: {vid_w}x{strip_h}, pill offset: ({offset_x}, {offset_y})")
PYEOF

echo "→ Processing video (delogo + pill overlay)..."
ffmpeg -y -i "$INPUT" -loop 1 -i "$OVERLAY" \
  -filter_complex "\
    delogo=x=310:y=15:w=570:h=160,\
    delogo=x=100:y=65:w=180:h=65,\
    delogo=x=870:y=65:w=270:h=65\
    [clean];[1:v]format=rgba[pill];[clean][pill]overlay=0:0:shortest=1" \
  -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy \
  -movflags +faststart \
  "$OUTPUT"

echo ""
echo "✓ Done: $OUTPUT"
echo "  Original: $INPUT ($(du -h "$INPUT" | cut -f1))"
echo "  Output:   $OUTPUT ($(du -h "$OUTPUT" | cut -f1))"
