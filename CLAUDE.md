# Vesper — Bible Meditation App (Astro Static)

## Stack
- **Framework**: Astro 5 (static output, `base: '/'` via ASTRO_BASE env)
- **Language**: TypeScript (strict)
- **UI**: React 19 + Framer Motion (client islands)
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **Data**: Static JSON files in `src/content/` (no database)
- **TTS**: ElevenLabs v3 API with character-level alignment

## Directory Structure
- `src/pages/` — Astro page routes
- `src/components/` — React components (MeditationPlayer, BibleReader, etc.)
- `src/content/meditations/` — Meditation JSON files (source of truth)
- `src/content/bible/` — Bible chapter data
- `src/content/breathing/` — Breathing pattern data
- `src/lib/` — constants, i18n, parseScript, lectionary
- `src/hooks/` — React hooks (useLocale, useBreathing)
- `scripts/` — Pipeline, TTS generation, content import
- `audio-storage/` — Generated audio (en/, en-v2/, fr/)

## Commands
- `pnpm dev` — dev server on port 3100
- `pnpm build` — static build (Astro)
- `npx tsx scripts/pipeline.ts status` — content status
- `npx tsx scripts/pipeline.ts create --category=sleep --count=2` — create meditations
- `npx tsx scripts/generate-tts.ts --missing` — generate missing TTS audio
- `npx tsx scripts/generate-tts.ts --dry-run <slug>` — preview TTS text
- `npx tsx scripts/pipeline.ts deploy` — build + copy + push

## Infrastructure
- **Deploy target**: `dist/` directory (any static host)
- **Audio**: Served from `/bible/audio/{en,en-v2,fr}/` via nginx
- No auth required — public static site
- No Docker, no systemd — pure static deployment

## Design System
- Warm, contemplative palette (earthy tones)
- Literata for scripture and headings, system font for UI
- Dark mode for `/sleep` routes
- CSS custom properties: `--bg`, `--surface`, `--primary`, `--accent`, `--text`, `--muted`

## Content Pipeline
See `CREATING-MEDITATIONS.md` for the full pipeline documentation.
- Scripts: `scripts/pipeline.ts` (orchestrator), `scripts/generate-tts.ts` (TTS), `scripts/prepare-tts.ts` (text prep)
- Data: `src/content/meditations/{slug}.json` is the single source of truth
- Audio: `audio-storage/{lang}/{slug}.mp3` + `.json` alignment files
