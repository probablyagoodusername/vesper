# Modular Breathing Plan — Vesper Meditations

## Context
Make all meditate-family meditations modular: variable durations (10/15/20 min) + clip-based breathing blocks where appropriate. Expert panel (9 AI agents) reviewed each meditation.

## Status: NOT STARTED

---

## Task 1: Fix JSON metadata (no TTS cost)

### Files to edit in `src/content/meditations/`:

**meditate-identity.json** — Change `breathing` from box-breathing to `null`
- Script says "Natural breathing. No prescribed ratio" — box-breathing slug is wrong
- Rationale: ACT defusion exercise, counted breathing competes with "sit with the inner critic"

**meditate-psalm-139.json** — Change `breathing` from 4-7-8 to `null`
- Script says "Natural breathing. No specific pattern" — 4-7-8 slug is wrong
- Rationale: body-acceptance/self-compassion, clip block pulls attention from interoception

**meditate-stress-release.json** — Change `breathing` from 4-7-8 to deep-calm (5/0/7/0 x3)
- Panel recommends: extended exhale without the 7s hold is better before PMR
- New breathing object:
  ```json
  {
    "slug": "deep-calm",
    "nameEn": "Deep Calm",
    "nameFr": "Respiration profonde",
    "inhale": 5,
    "holdIn": 0,
    "exhale": 7,
    "holdOut": 0,
    "rounds": 3
  }
  ```

**meditate-open-hands.json** — Add `breathing` field (currently null)
- Script has 4-in/6-out narrated breathing, close enough to deep-calm 5/0/7/0
- Same breathing object as stress-release above

---

## Task 2: Rewrite stress-release script for deep-calm

**Only meditation that needs a script rewrite.** The others' narrated breathing is already close enough to deep-calm OR stays natural.

### What to change in `scripts/rewrites/meditate/meditate-stress-release.en.txt`:
- Line 1: `[BREATHING: Deep calm breathing — 5 seconds in through the nose, 7 seconds out through the mouth. Guide at opening. Natural rhythm thereafter.]`
- Opening breathing section: Replace 4-7-8 counting (in 4, hold 7, out 8) with deep-calm (in 5, out 7, no hold)
- 3 rounds of counted breathing, then transition to natural

### Same changes in `meditate-stress-release.fr.txt`

### Also update `meditate-stress-release.json` scriptEn/scriptFr fields to match

---

## Task 3: Re-TTS stress-release (EN + FR)

- **Cost: ~9,500 characters** (only meditation needing re-TTS)
- Run: `npx tsx scripts/generate-tts.ts meditate-stress-release --lang=en`
- Run: `npx tsx scripts/generate-tts.ts meditate-stress-release --lang=fr` (if FR voice exists)
- This regenerates the full audio + alignment JSON

---

## Task 4: Run insert-breathing.ts on 4 meditations

Splice clip-bank breathing into narrated breathing segments. **Zero TTS cost** — uses pre-generated clips.

### Meditations to process:
1. **meditate-gratitude-midday** — deep-calm 5/0/7/0 x3 (already has correct JSON)
2. **meditate-stress-release** — deep-calm 5/0/7/0 x3 (after Task 3 re-TTS)
3. **meditate-present-moment** — deep-calm 5/0/7/0 x3 (already has correct JSON)
4. **meditate-open-hands** — deep-calm 5/0/7/0 x3 (after Task 1 JSON fix)

### Prerequisites:
- Scripts must have `[BREATHING_SECTION]` markers in their alignment files
- If markers don't exist, need to check how insert-breathing.ts detects the breathing section
- May need to add markers or rely on the segment metadata boundaries

### Command:
```bash
npx tsx scripts/insert-breathing.ts <slug> --lang=en
```

---

## Task 5: Re-segment + re-assemble all durations

### Run segmentation:
```bash
npx tsx scripts/segment-audio.ts --all --lang=en
```

### Run assembly for each meditation based on available core length:

| Meditation | Full (min) | Durations to assemble | Notes |
|---|---|---|---|
| anxiety-release | 26.4 | 10, 15, 20 | Already done ✓ |
| stress-release | 22.7 | 10, 15, 20 | Re-do after new TTS |
| gratitude-midday | 26.1 | 10, 15, 20 | Already done ✓, re-do if breathing changed |
| present-moment | 21.1 | 10, 15 | Add 15 if missing |
| lectio-divina | 19.2 | 10, 15 | Add 15 (core is 16min, enough) |
| open-hands | 16.3 | 10 | Only 10 (core 13min, too short for 15) |
| psalm-139 | 17.4 | 10 | Only 10 (core 14.7min, borderline for 15) |
| grief | 17.2 | 10 | Only 10 |
| identity | 11.6 | 10 | Only 10 (very short) |
| centering-prayer | 8.3 | — | Too short for any variant |

### Rule: Don't inflate. If full duration < target, don't offer that variant.

### Command:
```bash
npx tsx scripts/assemble-duration.ts --all --all-durations --lang=en
```

---

## Task 6: Build + deploy

```bash
cd /home/ubuntu/www/denis.me/vesper
pnpm build
# Copy to deploy target
cp -r dist/* /var/www/vesper-static/ 2>/dev/null || cp -r dist/* /var/www/denis.me/bible/
# Push to both repos
cd /home/ubuntu/www/denis.me && git add -A && git commit -m "feat(vesper): modular breathing + duration variants for all meditations" && git push origin main
# Also push to vesper repo if separate
```

---

## Meditations NOT getting modular breathing (keep narrated/natural)

| Meditation | Reason (expert panel) |
|---|---|
| grief | 9/9 unanimous. "Take a breath. It doesn't have to be deep." is perfect. Don't impose control on grief. |
| centering-prayer | 9/9 unanimous. Keating's tradition says don't focus on breathing as technique. |
| lectio-divina | 7-2. 1,500-year tradition with its own rhythm. Clip block would feel foreign. |
| identity | ACT defusion — counted breathing competes with observing the inner critic. |
| psalm-139 | Self-compassion — clip block pulls attention away from interoception toward performance. |

---

## Meditations getting modular clip-based breathing (5 total)

| Meditation | Technique | Pattern | Rounds | Placement |
|---|---|---|---|---|
| anxiety-release | Box Breathing | 4/4/4/4 | 3 | Opening | **DONE** |
| gratitude-midday | Deep Calm | 5/0/7/0 | 3 | Opening |
| stress-release | Deep Calm | 5/0/7/0 | 3 | Opening |
| present-moment | Deep Calm | 5/0/7/0 | 3 | Opening |
| open-hands | Deep Calm | 5/0/7/0 | 3 | Opening |

---

## BreathingCircle component

**SCRAPPED** — not needed. The breathing is audio-only (clip-based), no visual UI overlay.

---

## Clip bank status

Already generated in `audio-storage/clips/en/katherine/instructions/`:
- 42+ clips covering all phases and count variants
- Supports: inhale [3,4,5], hold [3,4,7], exhale [3,4,7,8], holdOut [3,4]
- Deep-calm (5-in, 7-out) is fully covered by existing clips
