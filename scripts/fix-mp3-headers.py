#!/usr/bin/env python3
"""
Fix MP3 Xing/Info headers so mobile browsers report correct duration.

Multi-chunk Buffer.concat MP3s retain the first chunk's Xing header,
which reports only that chunk's frame count and byte size. Mobile browsers
trust this header and show a 3-4 minute duration for 25-minute files.

This script patches the Xing header in-place with the correct total
frame count and file size. No re-encoding, no quality loss, instant.

Usage:
    python3 scripts/fix-mp3-headers.py /path/to/audio/dir
    python3 scripts/fix-mp3-headers.py /var/www/vesper-static/audio/en
"""

import struct
import sys
import os


def count_mpeg_frames(data: bytearray) -> tuple[int, int]:
    """Count MPEG1 Layer3 frames and compute total frame bytes."""
    frame_count = 0
    pos = 0
    bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
    samplerates = [44100, 48000, 32000, 0]

    while pos < len(data) - 4:
        if data[pos] == 0xFF and (data[pos + 1] & 0xE0) == 0xE0:
            version = (data[pos + 1] >> 3) & 0x03
            layer = (data[pos + 1] >> 1) & 0x03
            if version == 3 and layer == 1:  # MPEG1, Layer3
                bitrate_idx = (data[pos + 2] >> 4) & 0x0F
                sample_idx = (data[pos + 2] >> 2) & 0x03
                if 0 < bitrate_idx < 15 and sample_idx < 3:
                    bitrate = bitrates[bitrate_idx] * 1000
                    samplerate = samplerates[sample_idx]
                    padding = (data[pos + 2] >> 1) & 0x01
                    frame_size = (144 * bitrate // samplerate) + padding
                    frame_count += 1
                    pos += frame_size
                    continue
        pos += 1

    return frame_count, pos


def fix_xing_header(filepath: str) -> tuple[bool, str]:
    """Patch the Xing/Info header with correct frame count and byte count."""
    with open(filepath, "rb") as f:
        data = bytearray(f.read())

    filesize = len(data)

    # Find Info/Xing header
    idx = data.find(b"Info")
    if idx < 0:
        idx = data.find(b"Xing")
    if idx < 0:
        return False, "no Xing/Info header"

    flags = struct.unpack(">I", data[idx + 4 : idx + 8])[0]

    # Read current values
    offset = idx + 8
    old_frames = 0
    old_bytes = 0
    if flags & 0x01:
        old_frames = struct.unpack(">I", data[offset : offset + 4])[0]
        offset += 4
    if flags & 0x02:
        old_bytes = struct.unpack(">I", data[offset : offset + 4])[0]

    # Count actual frames
    frame_count, _ = count_mpeg_frames(data)
    old_dur = old_frames * 1152 / 44100
    new_dur = frame_count * 1152 / 44100

    # Skip if already correct (within 1 frame)
    if abs(frame_count - old_frames) <= 1 and abs(filesize - old_bytes) <= 1000:
        return False, f"already correct ({new_dur:.0f}s)"

    # Patch
    offset = idx + 8
    if flags & 0x01:
        struct.pack_into(">I", data, offset, frame_count)
        offset += 4
    if flags & 0x02:
        struct.pack_into(">I", data, offset, filesize)

    with open(filepath, "wb") as f:
        f.write(data)

    return True, f"fixed: {old_dur:.0f}s -> {new_dur:.0f}s ({frame_count} frames)"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/fix-mp3-headers.py <audio-dir> [audio-dir2] ...")
        sys.exit(1)

    fixed = 0
    skipped = 0
    errors = 0

    for audio_dir in sys.argv[1:]:
        if not os.path.isdir(audio_dir):
            print(f"  Not a directory: {audio_dir}")
            continue

        mp3s = sorted(f for f in os.listdir(audio_dir) if f.endswith(".mp3"))
        print(f"\n{audio_dir} ({len(mp3s)} files)")

        for mp3 in mp3s:
            path = os.path.join(audio_dir, mp3)
            try:
                changed, msg = fix_xing_header(path)
                name = mp3.replace(".mp3", "")
                if changed:
                    print(f"  {name}: {msg}")
                    fixed += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"  ERROR {mp3}: {e}")
                errors += 1

    print(f"\nDone: {fixed} fixed, {skipped} already correct, {errors} errors")


if __name__ == "__main__":
    main()
