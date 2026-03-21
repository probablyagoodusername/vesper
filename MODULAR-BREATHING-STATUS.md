# Modular Breathing & Duration Variants — Status

## What's done

### Meditate family (10 meditations) — COMPLETE
| Meditation | Breathing | Clip-based? | Duration variants |
|---|---|---|---|
| anxiety-release | box-breathing 4/4/4/4 x3 | YES | 10, 15, 20 |
| stress-release | deep-calm 5/0/7/0 x3 | YES | 10, 15, 20 |
| gratitude-midday | deep-calm 5/0/7/0 x3 | YES | 10, 15, 20 |
| present-moment | deep-calm 5/0/7/0 x3 | YES | 10, 15 |
| open-hands | deep-calm 5/0/7/0 x3 | YES | 10 |
| centering-prayer | null (tradition) | N/A | too short |
| grief | null (don't impose) | N/A | 10 |
| identity | null (ACT defusion) | N/A | 10 |
| psalm-139 | null (interoception) | N/A | 10 |
| lectio-divina | null (tradition) | N/A | 10 |

### Morning family (10 meditations) — TTS regenerated, NOT modular
- All 10 have fresh TTS with updated prepare-tts.ts
- Breathing is woven inline into narration ("in for four... hold for four...")
- NOT separable into clip-based blocks without script rewrites
- Duration variants not applicable (5-8 min, short enough already)

### Sleep family (7 meditations) — TTS regenerated, NOT modular
- 7 of 9 have fresh TTS (sleep-forgiveness + sleep-gratitude-night + sleep-psalms-breath missing audio)
- Breathing integrated into narrative flow
- Could benefit from duration variants but segment-audio.ts doesn't support sleep structure
- Would need different segmentation logic (no clear core/outro split)

## What's NOT applicable
- **breathe-***: Standalone breathing exercises, own system
- **sos-***: Emergency protocols, fixed format
- **prayer-***: Liturgical, own rhythm
- **music-***: No narration

## Pipeline scripts
- `insert-breathing.ts` — works for meditate family
- `segment-audio.ts` — meditate family only (hardcoded category filter)
- `assemble-duration.ts` — depends on segment output
- `qa-meditations.ts` — works for all categories

## Next steps to expand
1. **Sleep duration variants**: Extend segment-audio.ts to detect sleep-family boundaries (intro → body scan/narrative → closing prayer). Sleep doesn't have a "core" that can be trimmed cleanly — it's one continuous descent. Might need a different approach: cut from the END of the body content, before the closing prayer.
2. **Morning modular breathing**: Would require rewriting scripts to separate the inline counting into its own block. Low priority since mornings are already short.
