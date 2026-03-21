# Session TODO — Vesper fixes + full modular breathing rollout

## Quick fixes (do first)

### 1. Prayer pause inflation
- `prayer-hail-mary`: 30s of speech inflated to 817s by massive pauses
- `prayer-our-father`: same issue, first pause way too long
- **Fix**: Re-generate TTS with reduced pause multiplier for prayer category
- Or: manually trim the audio and rebuild alignment

### 2. Fixed-width center column for web
- On large screens, player controls spread too far apart
- **Fix**: Add `max-w-2xl mx-auto` wrapper to the player main content area

### 3. Lectio-divina breathing should be null (expert panel)
- Still shows `deep-calm rounds=6` — was fixed but lost in git churn
- **Fix**: Set breathing to null in JSON

### 4. gratitude-midday + present-moment rounds
- Should be 3, currently 6 in JSON (also lost in git)
- **Fix**: Set rounds to 3

## Full modular breathing rollout

### Patterns available (all clip-supported):
| Pattern | Timing | Clips exist? |
|---------|--------|------|
| box-breathing | 4/4/4/4 | YES |
| deep-calm | 5/0/7/0 | YES |
| 4-7-8 | 4/7/8/0 | YES |
| energizing | 3/3/3/0 | YES |
| sleep-preparation | 4/0/8/3 | YES |

### Meditations that need processing:
| Slug | Category | Pattern | Needs TTS? | Needs insert-breathing? | Needs segment+assemble? |
|------|----------|---------|------------|------------------------|------------------------|
| morning-armor-of-god | morning | energizing 3/3/3/0 | Check | YES | YES |
| morning-courage | morning | energizing 3/3/3/0 | Check | YES | YES |
| morning-isaiah-renew | morning | energizing 3/3/3/0 | Check | YES | YES |
| morning-new-mercies | morning | energizing 3/3/3/0 | Check | YES | YES |
| morning-peace-anxious | morning | 4-7-8 4/7/8/0 | Check | YES | YES |
| morning-philippians-mind | morning | box-breathing 4/4/4/4 | Check | YES | YES |
| morning-proverbs-wisdom | morning | box-breathing 4/4/4/4 | Check | YES | YES |
| morning-purpose | morning | box-breathing 4/4/4/4 | Check | YES | YES |
| morning-resilience | morning | energizing 3/3/3/0 | Check | YES | YES |
| morning-strength-joy | morning | energizing 3/3/3/0 | Check | YES | YES |
| sleep-be-still | sleep | deep-calm 5/0/7/0 | Check | YES | YES |
| sleep-body-scan-peace | sleep | deep-calm 5/0/7/0 | Check | YES | YES |
| sleep-casting-anxiety | sleep | sleep-preparation 4/0/8/3 | Check | YES | YES |
| sleep-loving-kindness | sleep | deep-calm 5/0/7/0 | Check | YES | YES |
| sleep-psalm-23-imagery | sleep | sleep-preparation 4/0/8/3 | Check | YES | YES |
| sleep-rain-release | sleep | sleep-preparation 4/0/8/3 | Check | YES | YES |
| sleep-still-waters | sleep | deep-calm 5/0/7/0 | Check | YES | YES |

### Pipeline for each:
1. Check if audio-storage has the MP3 + alignment JSON
2. Check if alignment has BREATHING_SECTION marker
3. If no marker → need TTS re-gen (costs characters)
4. If marker exists → run insert-breathing.ts
5. Run segment-audio.ts
6. Run assemble-duration.ts
7. Copy to public/

### Meditations to SKIP (no modular breathing):
- centering-prayer (null — Keating tradition)
- grief (null — don't impose control on grief)
- identity (null — ACT defusion)
- psalm-139 (null — self-compassion interoception)
- lectio-divina (null — 1500-year tradition)
- breathe-* (standalone breathing exercises)
- sos-* (emergency protocols, own rhythm)
- prayer-* (liturgical, own rhythm)
- music-* (no breathing)
