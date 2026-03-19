# Therapeutic Audio Pipeline

## Overview

Vesper's 10 ambient music tracks go through a science-based audio processing pipeline before being used in meditation sessions. Raw music tracks (generated via Suno) are layered with therapeutic audio elements calibrated from neuroscience research.

All settings were reviewed by a **4-expert AI panel** (audio engineer, neuroscientist, sleep researcher, sound designer). Key design decisions are documented in the source code comments at `tools/process-music.mjs`.

## Pipeline

```
Raw MP3 (from Suno)
  ↓
tools/process-music.mjs (Node.js CLI)
  ↓ Layers:
  ├── Brown noise bed (0.008 gain) — subliminal spectral gap filler
  ├── 55Hz sub-bass sine (0.012 gain) — vagal nerve stimulation
  ├── Binaural beats (110Hz carrier, per-profile offset)
  │     meditation: 110/120Hz = 10Hz alpha entrainment
  │     sleep:      110/113Hz = 3Hz delta entrainment
  ↓ Processing:
  ├── Sidechain compression — ducks therapeutic layers when music has energy
  │     50ms RMS window, -40dB threshold, ~7dB duck, 10ms attack / 200ms release
  ├── 9kHz low-pass filter — warm but preserves presence
  ├── Reverb (2.5s decay, wet per-profile: 15% meditation / 18% sleep)
  ├── ISO fade-in (90s meditation / 120s sleep) — gradual physiological deceleration
  └── 30-second fade-out — prevents startle response
  ↓
Processed WAV → music/processed/
  ├── *-therapeutic.wav       (meditation profile)
  └── *-therapeutic-sleep.wav (sleep profile)
```

## Directory Structure

```
music/
├── raw/           ← Drop raw MP3s here
│   ├── vesper-ambient-01.mp3
│   ├── vesper-ambient-02.mp3
│   └── ...
└── processed/     ← Therapeutically processed output
    ├── vesper-ambient-01-therapeutic.wav       (meditation)
    ├── vesper-ambient-01-therapeutic-sleep.wav (sleep)
    ├── vesper-ambient-02-therapeutic.wav
    ├── vesper-ambient-02-therapeutic-sleep.wav
    └── ...
```

## Usage

### CLI Processing (batch)

```bash
# Process all tracks in both meditation + sleep profiles (default)
node tools/process-music.mjs

# Process only meditation profile
node tools/process-music.mjs --mode=meditation

# Process only sleep profile
node tools/process-music.mjs --mode=sleep
```

Reads all `.mp3` files from `music/raw/`, processes each through the full therapeutic chain, and writes WAV files to `music/processed/`. Each track is decoded once, then processed through each requested profile.

### Browser Tool (interactive)

Open `tools/audio-mixer.html` in any browser. Drag and drop 1-4 MP3 files. The mixer layers the same therapeutic audio chain in real-time. Press Play to preview, Save to export as WAV.

## Mode Profiles

| Parameter | Meditation | Sleep |
|-----------|-----------|-------|
| Binaural beat | 10Hz alpha (110/120Hz) | 3Hz delta (110/113Hz) |
| Fade-in | 90 seconds | 120 seconds |
| Reverb wet | 15% | 18% |
| Output suffix | `-therapeutic.wav` | `-therapeutic-sleep.wav` |

**Meditation mode** targets calm focus via alpha-band entrainment. Suitable for guided meditation sessions.

**Sleep mode** targets deep sleep via delta-band entrainment (0.5-4Hz promotes slow-wave sleep stages 3-4). Longer fade-in and slightly more reverb create a more enveloping, drowsy sonic environment.

## Sidechain Compression

Therapeutic layers (brown noise + sub-bass) are dynamically ducked based on the source music's energy:

- **RMS window**: 50ms — fast enough to track musical transients
- **Threshold**: -40dB RMS — below this, music is considered silent
- **Duck amount**: ~7dB reduction when music is present
- **Attack**: 10ms — fast duck prevents therapeutic layers from poking through
- **Release**: 200ms — slow return avoids audible pumping

This means therapeutic layers automatically fill in during quiet passages and recede when the music has energy, preventing spectral competition without manual volume automation.

## Science References

| Layer | Value | Source |
|-------|-------|--------|
| Brown noise | 0.008 gain | [Inspire the Mind, 2024](https://www.inspirethemind.org/post/can-brown-noise-blanket-your-brain-and-reduce-anxiety) |
| Sub-bass | 55Hz, 0.012 gain | [Neuvana — vagus nerve sound stimulation](https://neuvanalife.com/blogs/blog/vagus-nerve-sound-stimulation-how-vibrations-improve-stress-relief) |
| Binaural beats (alpha) | 110/120Hz (10Hz) | [Ingendoh et al., PMC 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10198548/); lower carriers produce stronger ASSR (Schwarz & Taylor, 2005) |
| Binaural beats (delta) | 110/113Hz (3Hz) | Delta entrainment promotes SWS stages 3-4; same carrier frequency benefits apply |
| Sidechain compression | 50ms/10ms/200ms | Standard broadcast ducking technique adapted for subliminal layer management |
| Low-pass filter | 9kHz cutoff | Aligned with [Safe and Sound Protocol](https://integratedlistening.com/products/ssp-safe-sound-protocol/) (Porges); raised from 6kHz to preserve presence |
| Reverb | 2.5s decay, 15-18% wet | [Polyvagal Theory](https://pmc.ncbi.nlm.nih.gov/articles/PMC12302812/) — spatial safety signaling |
| ISO fade-in | 90-120 seconds | [Starcke & von Georgi, 2024](https://journals.sagepub.com/doi/abs/10.1177/10298649231175029) |

## Expert Review Notes

Settings were reviewed by a 4-expert AI panel (audio engineer, neuroscientist, sleep researcher, sound designer). Key findings:

- **Brown noise**: Previous -22dB was audible as hiss; 0.008 gain fills micro-silences without conscious perception
- **Carrier frequency**: 110Hz produces stronger frequency-following response than 200Hz (Schwarz & Taylor, 2005; Gao et al., 2014)
- **LPF**: 6kHz killed presence/air; 9kHz preserves spaciousness while taming harshness
- **Reverb**: 4s at 20% wet created mud on already-reverberant ambient music; 2.5s at 15% adds space without smearing
- **Fade-in**: 90s follows ISO 226 loudness contours better for meditation; 120s for sleep onset
- **Sidechain compression**: Prevents therapeutic layers from competing with music — fills spectral gaps only
- **Shimmer removed**: At 0.003 gain the shimmer pad (3.2kHz + 4.8kHz tones) was doing nothing measurable; removed to simplify the pipeline
- **Sleep profile**: Delta-range binaural (3Hz) instead of alpha (10Hz), with longer fade and more reverb for sleep-optimized processing
