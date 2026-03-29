# Creating Meditations for Vesper

## Quick Start — Add New Meditations

```bash
# 1. Create skeleton files (generates placeholders + AI prompts)
npx tsx scripts/pipeline.ts create --category=sleep --count=2

# 2. Fill in the scripts (edit the generated JSON files in src/content/meditations/)
#    Or use the saved prompt in scripts/prompts/ with Claude/ChatGPT

# 3. Generate TTS audio for all meditations missing audio
npx tsx scripts/pipeline.ts generate-tts --missing

# 4. Build + deploy to production
npx tsx scripts/pipeline.ts deploy
```

### Other useful commands

```bash
# Check what's missing
npx tsx scripts/pipeline.ts status

# Dry-run TTS (preview prepared text, no API call)
npx tsx scripts/generate-tts.ts --dry-run sleep-ocean-drift

# Generate TTS for a specific meditation
npx tsx scripts/generate-tts.ts sleep-ocean-drift --lang=en

# Generate with V2 voice (James)
npx tsx scripts/generate-tts.ts sleep-ocean-drift --voice=EkK5I93UQWFDigLMpZcX --outdir=audio-storage/en-v2

# Import scripts from rewrites/ txt files into JSON
npx tsx scripts/pipeline.ts import
```

---

## Pipeline Architecture

```
scripts/pipeline.ts         CLI orchestrator — routes to sub-commands
scripts/generate-tts.ts     TTS generation — reads JSON, calls ElevenLabs, saves audio + alignment
scripts/prepare-tts.ts      Text preparation — transforms raw scripts for TTS engine
src/content/meditations/    Static JSON files (the single source of truth)
scripts/rewrites/           Raw .txt scripts organized by category
audio-storage/              Generated audio files (en/, en-v2/, fr/)
```

### Data Flow

```
1. Script written (EN + FR)
   ↓
2. Saved to src/content/meditations/{slug}.json
   ↓
3. prepareScript() transforms for TTS:
   - Strips [BREATHING: ...] instructions
   - Strips stage directions [...]
   - Converts [Xs pause] → chained [long pause] tags
   - Adds sentence/paragraph pause tags
   ↓
4. ElevenLabs v3 API generates audio with timestamps
   ↓
5. Audio (.mp3) + alignment (.json) saved to audio-storage/{lang}/
   ↓
6. Meditation JSON updated with audioPathEn/audioPathFr
   ↓
7. Build + deploy copies everything to production
```

---

## Meditation JSON Schema

Each meditation lives in `src/content/meditations/{slug}.json`:

```json
{
  "slug": "sleep-ocean-drift",
  "titleEn": "Ocean Drift",
  "titleFr": "Derive oceanique",
  "descEn": "A body scan meditation using ocean imagery...",
  "descFr": "Un scan corporel utilisant l'imagerie oceanique...",
  "scriptEn": "[BREATHING: Deep Calm...]\n\nWelcome...",
  "scriptFr": "[BREATHING: Calme profond...]\n\nBienvenue...",
  "category": "sleep",
  "durationMin": 28,
  "isSleep": true,
  "verseRefs": [
    { "book": "psalms", "chapter": 107, "verseStart": 29, "verseEnd": 30 }
  ],
  "audioPathEn": "/bible/audio/en/sleep-ocean-drift.mp3",
  "audioPathFr": null,
  "sortOrder": 11,
  "scienceUrl": "https://pubmed.ncbi.nlm.nih.gov/...",
  "breathing": {
    "slug": "deep-calm",
    "nameEn": "Deep Calm",
    "nameFr": "Calme profond",
    "inhale": 5,
    "holdIn": 0,
    "exhale": 7,
    "holdOut": 0,
    "rounds": 6
  }
}
```

### Categories

| Category | Prefix | Duration | Pacing |
|----------|--------|----------|--------|
| sleep | `sleep-` | 25-35 min | Very spacious, generous pauses |
| morning | `morning-` | 5-9 min | Tight, energetic |
| anxiety | `meditate-` | 15-25 min | Moderate |
| self-compassion | `meditate-` | 15-25 min | Moderate |
| contemplative | `meditate-` | 15-25 min | Moderate |
| sos | `sos-` | 3-10 min | Tight, focused |
| prayer | `prayer-` | 5-15 min | Moderate |

---

## Script Writing Guidelines

### Structure

1. **First line**: Breathing instruction as stage direction
   ```
   [BREATHING: Deep Calm pattern — 5-count inhale through nose, 7-count exhale through mouth.]
   ```

2. **Body**: Natural spoken text in second person ("you"), with pause markers and scripture quotes

3. **Pauses**: `[Xs pause]` where X is seconds
   - Sleep: 10s, 15s, 20s, 30s, 60s
   - Meditate: 10s, 15s, 20s
   - Morning: 5s, 10s

4. **Scripture**: Em dash attribution
   ```
   "Be still, and know that I am God." — Psalm 46:10
   ```

5. **Stage directions**: Narrator guidance (stripped from TTS)
   ```
   [Voice softens here]
   [Slow down]
   ```

### Expert Panel Approach

Each script draws from multiple disciplines:
- **Theologian**: Scripture in context, not proof-texting
- **Sleep psychologist**: Body scan, progressive relaxation, imagery
- **Meditation teacher**: Breath awareness, noting, present-moment
- **Therapist (ACT/CFT)**: Cognitive defusion, self-compassion
- **Contemplative prayer**: Centering prayer, lectio divina, Ignatian imagination
- **Mindfulness instructor**: Non-judgmental awareness, sensory grounding

---

## TTS Alignment Format

The alignment JSON (`audio-storage/{lang}/{slug}.json`) maps spoken lines to audio timestamps:

```json
{
  "lines": [
    "Welcome. [long pause] Tonight is different...",
    "We're going to be still. [long pause]",
    ...
  ],
  "timestamps": [
    { "start": 0, "end": 12.5 },
    { "start": 12.5, "end": 18.3 },
    ...
  ],
  "duration": 1680.5
}
```

- `lines`: The TTS-prepared text (with pause tags), one per spoken line
- `timestamps`: Start/end times in seconds for each line
- `duration`: Total audio duration in seconds

The `MeditationPlayer` component uses `buildAlignmentBoundaries()` to map these timestamps to the display lines from `parseScript()`, enabling karaoke-style text highlighting during playback.

### How Alignment Sync Works

1. `parseScript()` produces display lines (body, scripture, stage-direction, pause)
2. The alignment JSON contains TTS-prepared lines (spoken text + pause tags)
3. `buildAlignmentBoundaries()` matches them sequentially:
   - Spoken display lines (body/scripture) map 1:1 to spoken alignment lines
   - Stage directions get zero-width boundaries at the next spoken line's start
   - Pause lines get boundaries in the gap between spoken lines
4. Edge cases handled: empty scripts return empty boundaries, scripts shorter than alignment data use the audio duration as fallback

---

## Voice Configuration

| Voice | ID | Name | Use |
|-------|-----|------|-----|
| V1 | `NtS6nEHDYMQC9QczMQuq` | Katherine | Default EN narrator |
| V2 | `EkK5I93UQWFDigLMpZcX` | James | Alt EN narrator |
| FR | `TojRWZatQyy9dujEdiQ1` | — | Default FR narrator |

Voice settings vary by category (see `scripts/prepare-tts.ts`):
- Sleep: High stability (0.80), low style (0.05), speed 0.70
- Meditate: Moderate stability (0.70), moderate style (0.12), speed 0.70
- Morning: Lower stability (0.60), higher style (0.20), speed 0.70

### Background Music Processing

The 10 ambient tracks (AI-composed via Suno) are processed through `tools/process-music.mjs` before deployment. The pipeline adds subliminal therapeutic layers (brown noise, 55Hz sub-bass, binaural beats at 110Hz carrier, shimmer) and applies a 9kHz LPF, 2.5s reverb at 15% wet, and 90s ISO fade-in. Settings were reviewed by a 4-expert AI panel. See [tools/AUDIO-PIPELINE.md](tools/AUDIO-PIPELINE.md) for full documentation.

---

## Environment Variables

```bash
# Required for TTS generation
ELEVENLABS_API_KEY=your_key_here

# Optional overrides (defaults to Katherine/FR voices)
ELEVENLABS_VOICE_EN=NtS6nEHDYMQC9QczMQuq
ELEVENLABS_VOICE_FR=TojRWZatQyy9dujEdiQ1
```
