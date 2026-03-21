/**
 * Generate breathing count clips (1-8) via ElevenLabs TTS for all voices.
 *
 * Creates 2 variations per number per voice for organic feel.
 * Also extracts instruction phrases from existing meditation audio.
 *
 * Usage:
 *   npx tsx scripts/generate-breathing-clips.ts --generate-numbers
 *   npx tsx scripts/generate-breathing-clips.ts --extract-instructions <slug>
 *   npx tsx scripts/generate-breathing-clips.ts --all
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CLIPS_DIR = join(PROJECT_ROOT, 'audio-storage', 'clips')

const API_BASE = 'https://api.elevenlabs.io/v1/text-to-speech'
const API_KEY = process.env.ELEVENLABS_API_KEY ?? ''
const MODEL_ID = 'eleven_v3'

// ─── Voice config ───────────────────────────────────────────────────────────

interface VoiceConfig {
  id: string
  name: string
  lang: string
  settings: Record<string, unknown>
}

const VOICES: VoiceConfig[] = [
  {
    id: 'NtS6nEHDYMQC9QczMQuq',
    name: 'katherine',
    lang: 'en',
    settings: { stability: 0.75, similarity_boost: 0.75, style: 0.08, use_speaker_boost: true, speed: 0.75 },
  },
  {
    id: 'EkK5I93UQWFDigLMpZcX',
    name: 'james',
    lang: 'en',
    settings: { stability: 0.75, similarity_boost: 0.75, style: 0.08, use_speaker_boost: true, speed: 0.75 },
  },
  {
    id: 'TojRWZatQyy9dujEdiQ1',
    name: 'koraly',
    lang: 'fr',
    settings: { stability: 0.75, similarity_boost: 0.75, style: 0.08, use_speaker_boost: true, speed: 0.75 },
  },
]

// ─── Number words ───────────────────────────────────────────────────────────

const EN_NUMBERS: Record<number, string[]> = {
  1: ['one', 'one'],
  2: ['two', 'two'],
  3: ['three', 'three'],
  4: ['four', 'four'],
  5: ['five', 'five'],
  6: ['six', 'six'],
  7: ['seven', 'seven'],
  8: ['eight', 'eight'],
}

const FR_NUMBERS: Record<number, string[]> = {
  1: ['un', 'un'],
  2: ['deux', 'deux'],
  3: ['trois', 'trois'],
  4: ['quatre', 'quatre'],
  5: ['cinq', 'cinq'],
  6: ['six', 'six'],
  7: ['sept', 'sept'],
  8: ['huit', 'huit'],
}

// ─── Instruction phrase templates ────────────────────────────────────────────

const EN_COUNT_WORDS: Record<number, string> = { 3: 'three', 4: 'four', 5: 'five', 7: 'seven', 8: 'eight' }
const FR_COUNT_WORDS: Record<number, string> = { 3: 'trois', 4: 'quatre', 5: 'cinq', 7: 'sept', 8: 'huit' }

// Templates use {count} placeholder
const EN_INSTRUCTION_TEMPLATES: Record<string, string> = {
  'breathe-in-long': 'Breathe in through your nose for {count}.',
  'in': 'In for {count}.',
  'again-in': 'Again. In for {count}.',
  'one-more-in': 'One more. In for {count}.',
  'hold': 'Hold for {count}.',
  'hold-gently': 'Hold gently for {count}.',
  'breathe-out-long': 'Exhale slowly through your mouth for {count}.',
  'out': 'Out for {count}.',
  'out-slowly': 'Out slowly for {count}.',
  'hold-bottom': 'And hold for {count}.',
}

const FR_INSTRUCTION_TEMPLATES: Record<string, string> = {
  'breathe-in-long': 'Inspirez par le nez sur {count} temps.',
  'in': 'Inspirez sur {count}.',
  'again-in': 'Encore. Inspirez sur {count}.',
  'one-more-in': 'Une dernière fois. Inspirez sur {count}.',
  'hold': 'Retenez sur {count}.',
  'hold-gently': 'Retenez doucement sur {count}.',
  'breathe-out-long': 'Expirez lentement par la bouche sur {count}.',
  'out': 'Expirez sur {count}.',
  'out-slowly': 'Expirez lentement sur {count}.',
  'hold-bottom': 'Et retenez sur {count}.',
}

// Counts needed per phase type (derived from all breathing patterns in use)
const COUNTS_NEEDED: Record<string, number[]> = {
  inhale: [3, 4, 5],
  hold: [3, 4, 7],
  exhale: [3, 4, 7, 8],
  holdOut: [3, 4],
}

const PHASE_CLIPS: Record<string, string[]> = {
  inhale: ['breathe-in-long', 'in', 'again-in', 'one-more-in'],
  hold: ['hold', 'hold-gently'],
  exhale: ['breathe-out-long', 'out', 'out-slowly'],
  holdOut: ['hold-bottom'],
}

// Legacy compat: keep the old format for generateInstructions fallback
const EN_INSTRUCTIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(EN_INSTRUCTION_TEMPLATES).map(([k, v]) => [k, [v.replace('{count}', 'four')]])
)
const FR_INSTRUCTIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(FR_INSTRUCTION_TEMPLATES).map(([k, v]) => [k, [v.replace('{count}', 'quatre')]])
)

// ─── TTS API call ───────────────────────────────────────────────────────────

async function generateClip(
  text: string,
  voice: VoiceConfig,
  outputPath: string,
): Promise<{ duration: number }> {
  const url = `${API_BASE}/${voice.id}/with-timestamps?output_format=mp3_44100_128`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: voice.settings,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`)
  }

  const json = await response.json() as Record<string, unknown>
  const audio = Buffer.from(json.audio_base64 as string, 'base64')

  writeFileSync(outputPath, audio)

  // Get duration via ffprobe
  const durationStr = execFileSync('ffprobe', [
    '-v', 'quiet', '-show_entries', 'format=duration',
    '-of', 'csv=p=0', outputPath,
  ], { encoding: 'utf-8' }).trim()

  return { duration: parseFloat(durationStr) }
}

// ─── Generate number clips ─────────────────────────────────────────────────

async function generateNumbers(voice: VoiceConfig): Promise<void> {
  const numbers = voice.lang === 'fr' ? FR_NUMBERS : EN_NUMBERS
  const outDir = join(CLIPS_DIR, voice.lang, voice.name, 'numbers')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const metadata: Record<string, { duration: number; text: string }> = {}

  for (const [numStr, texts] of Object.entries(numbers)) {
    for (let variation = 0; variation < texts.length; variation++) {
      const text = texts[variation]
      const label = String.fromCharCode(97 + variation) // a, b
      const filename = `${numStr}_${label}.mp3`
      const outPath = join(outDir, filename)

      if (existsSync(outPath)) {
        console.log(`    Skip (exists): ${filename}`)
        continue
      }

      console.log(`    Generating: ${filename} ("${text}")`)
      const result = await generateClip(text, voice, outPath)
      metadata[filename] = { duration: result.duration, text }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return
}

// ─── Generate instruction clips ─────────────────────────────────────────────

async function generateInstructions(voice: VoiceConfig): Promise<void> {
  const instructions = voice.lang === 'fr' ? FR_INSTRUCTIONS : EN_INSTRUCTIONS
  const outDir = join(CLIPS_DIR, voice.lang, voice.name, 'instructions')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  for (const [name, texts] of Object.entries(instructions)) {
    const filename = `${name}.mp3`
    const outPath = join(outDir, filename)

    if (existsSync(outPath)) {
      console.log(`    Skip (exists): ${filename}`)
      continue
    }

    console.log(`    Generating: ${filename} ("${texts[0]}")`)
    await generateClip(texts[0], voice, outPath)
    await new Promise(r => setTimeout(r, 200))
  }
}

// ─── Generate count-specific instruction clips ──────────────────────────────

async function generateAllCountInstructions(voice: VoiceConfig): Promise<void> {
  const templates = voice.lang === 'fr' ? FR_INSTRUCTION_TEMPLATES : EN_INSTRUCTION_TEMPLATES
  const countWords = voice.lang === 'fr' ? FR_COUNT_WORDS : EN_COUNT_WORDS
  const outDir = join(CLIPS_DIR, voice.lang, voice.name, 'instructions')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  for (const [phase, clipNames] of Object.entries(PHASE_CLIPS)) {
    const counts = COUNTS_NEEDED[phase] ?? [4]
    for (const clipName of clipNames) {
      const template = templates[clipName]
      if (!template) continue

      for (const count of counts) {
        const word = countWords[count]
        if (!word) continue
        const text = template.replace('{count}', word)
        const filename = `${clipName}-${count}.mp3`
        const outPath = join(outDir, filename)

        if (existsSync(outPath)) {
          console.log(`    Skip (exists): ${filename}`)
          continue
        }

        console.log(`    Generating: ${filename} ("${text}")`)
        await generateClip(text, voice, outPath)
        await new Promise(r => setTimeout(r, 200))
      }
    }
  }
}

// ─── Build metadata ─────────────────────────────────────────────────────────

function buildMetadata(voice: VoiceConfig): void {
  const voiceDir = join(CLIPS_DIR, voice.lang, voice.name)
  const meta: Record<string, { duration: number; file: string }> = {}

  // Scan numbers
  const numbersDir = join(voiceDir, 'numbers')
  if (existsSync(numbersDir)) {
    for (const f of readdirSync(numbersDir)) {
      if (!f.endsWith('.mp3')) continue
      const path = join(numbersDir, f)
      const dur = parseFloat(
        execFileSync('ffprobe', [
          '-v', 'quiet', '-show_entries', 'format=duration',
          '-of', 'csv=p=0', path,
        ], { encoding: 'utf-8' }).trim()
      )
      meta[`numbers/${f}`] = { duration: dur, file: f }
    }
  }

  // Scan instructions
  const instrDir = join(voiceDir, 'instructions')
  if (existsSync(instrDir)) {
    for (const f of readdirSync(instrDir)) {
      if (!f.endsWith('.mp3')) continue
      const path = join(instrDir, f)
      const dur = parseFloat(
        execFileSync('ffprobe', [
          '-v', 'quiet', '-show_entries', 'format=duration',
          '-of', 'csv=p=0', path,
        ], { encoding: 'utf-8' }).trim()
      )
      meta[`instructions/${f}`] = { duration: dur, file: f }
    }
  }

  writeFileSync(join(voiceDir, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n')
  console.log(`    Wrote metadata.json (${Object.keys(meta).length} clips)`)
}

// ─── CLI ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const genNumbers = args.includes('--generate-numbers') || args.includes('--all')
  const genInstructions = args.includes('--generate-instructions') || args.includes('--all')
  const genAllCounts = args.includes('--generate-all-counts') || args.includes('--all')
  const buildMeta = args.includes('--metadata') || args.includes('--all')

  if (!genNumbers && !genInstructions && !genAllCounts && !buildMeta) {
    console.log('Usage:')
    console.log('  npx tsx scripts/generate-breathing-clips.ts --generate-numbers')
    console.log('  npx tsx scripts/generate-breathing-clips.ts --generate-instructions')
    console.log('  npx tsx scripts/generate-breathing-clips.ts --generate-all-counts')
    console.log('  npx tsx scripts/generate-breathing-clips.ts --metadata')
    console.log('  npx tsx scripts/generate-breathing-clips.ts --all')
    process.exit(1)
  }

  if ((genNumbers || genInstructions) && !API_KEY) {
    console.error('ELEVENLABS_API_KEY not set')
    process.exit(1)
  }

  console.log('\n=== Breathing Clip Generation ===\n')

  for (const voice of VOICES) {
    console.log(`  Voice: ${voice.name} (${voice.lang})`)

    if (genNumbers) {
      console.log('  → Numbers (1-8):')
      await generateNumbers(voice)
    }

    if (genInstructions) {
      console.log('  → Instructions (default):')
      await generateInstructions(voice)
    }

    if (genAllCounts) {
      console.log('  → Instructions (all counts):')
      await generateAllCountInstructions(voice)
    }

    if (buildMeta) {
      console.log('  → Metadata:')
      buildMetadata(voice)
    }

    console.log('')
  }

  console.log('=== Done ===')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
