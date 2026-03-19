/**
 * Rebuild alignment JSON from existing audio files — NO API calls.
 *
 * Reads the meditation script, runs it through prepareScript to get the same
 * lines the TTS engine saw, then estimates per-line timestamps based on:
 * - Audio duration from ffprobe
 * - Pause markers: [long pause] ≈ 3s, [short pause] ≈ 1.5s
 * - Spoken text distributed by word count
 *
 * Usage:
 *   npx tsx scripts/rebuild-alignment.ts <slug> --lang=fr
 *   npx tsx scripts/rebuild-alignment.ts --all --lang=fr
 *   npx tsx scripts/rebuild-alignment.ts <slug> --lang=en
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'
import { prepareScript } from './prepare-tts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CONTENT_DIR = join(PROJECT_ROOT, 'src', 'content', 'meditations')
const AUDIO_DIR = join(PROJECT_ROOT, 'audio-storage')

// These are initial estimates — calibrated per-file from actual audio duration
const LONG_PAUSE_SEC_ESTIMATE = 3.0
const SHORT_PAUSE_SEC_ESTIMATE = 1.5

// Speech rate at ElevenLabs speed=0.7 (words per second)
// Normal English TTS ≈ 2.5 wps, at 0.7x ≈ 1.75 wps
const SPEECH_RATE_WPS = 1.75

interface MeditationJSON {
  slug: string
  category: string
  scriptEn: string
  scriptFr: string
  [key: string]: unknown
}

/** Get audio duration in seconds via ffprobe */
function getAudioDuration(mp3Path: string): number {
  const result = execFileSync('ffprobe', [
    '-v', 'quiet',
    '-show_entries', 'format=duration',
    '-of', 'csv=p=0',
    mp3Path,
  ], { encoding: 'utf-8' })
  return parseFloat(result.trim())
}

/** Count pause markers in a line */
function countPauses(line: string): { long: number; short: number } {
  const long = (line.match(/\[long pause\]/gi) ?? []).length
  const short = (line.match(/\[short pause\]/gi) ?? []).length
  return { long, short }
}

/** Count speakable words in a line (excluding pause markers) */
function countWords(line: string): number {
  const stripped = line.replace(/\[(long|short)\s+pause\]/gi, '').trim()
  if (!stripped) return 0
  return stripped.split(/\s+/).length
}

function rebuildAlignment(slug: string, lang: 'en' | 'fr', audioSubdir?: string): boolean {
  const subdir = audioSubdir ?? lang
  const medPath = join(CONTENT_DIR, `${slug}.json`)
  if (!existsSync(medPath)) {
    console.error(`  Meditation not found: ${slug}`)
    return false
  }

  const med: MeditationJSON = JSON.parse(readFileSync(medPath, 'utf-8'))
  const script = lang === 'fr' ? med.scriptFr : med.scriptEn
  if (!script?.trim()) {
    console.log(`  Skipping ${slug} (${subdir}) — no script`)
    return false
  }

  const mp3Path = join(AUDIO_DIR, subdir, `${slug}.mp3`)
  if (!existsSync(mp3Path)) {
    console.log(`  Skipping ${slug} (${subdir}) — no audio file`)
    return false
  }

  const duration = getAudioDuration(mp3Path)
  const prepared = prepareScript(script, med.category)
  const preparedLines = prepared.split('\n').filter(l => l.trim().length > 0)

  // Calculate time budget using calibrated pause durations
  //
  // Strategy: we know total duration, total words, and total pause markers.
  // Estimate speech time from word count, then solve for actual pause duration.
  //
  //   duration = (totalWords / speechRate) + (longPauses * longDur) + (shortPauses * shortDur)
  //   Constraint: longDur = 2 * shortDur
  //   Solve for shortDur, then derive longDur.

  const linePauses: Array<{ long: number; short: number }> = []
  const lineWordCounts: number[] = []
  let totalLong = 0
  let totalShort = 0

  for (const line of preparedLines) {
    const pauses = countPauses(line)
    const words = countWords(line)
    linePauses.push(pauses)
    lineWordCounts.push(words)
    totalLong += pauses.long
    totalShort += pauses.short
  }

  const totalWords = lineWordCounts.reduce((a, b) => a + b, 0)
  const estimatedSpeechTime = totalWords / SPEECH_RATE_WPS

  // Solve: duration = speechTime + totalLong * longDur + totalShort * shortDur
  // With longDur = 2 * shortDur:
  //   duration = speechTime + (2 * totalLong + totalShort) * shortDur
  const pauseUnits = 2 * totalLong + totalShort // in "short pause" units
  let shortDur: number
  let longDur: number

  if (pauseUnits > 0) {
    shortDur = Math.max(0.2, (duration - estimatedSpeechTime) / pauseUnits)
    longDur = shortDur * 2
  } else {
    shortDur = SHORT_PAUSE_SEC_ESTIMATE
    longDur = LONG_PAUSE_SEC_ESTIMATE
  }

  const calibratedPauseTime = totalLong * longDur + totalShort * shortDur
  const calibratedSpeechTime = duration - calibratedPauseTime

  console.log(`  ${slug} (${subdir}): ${duration.toFixed(0)}s audio, ${preparedLines.length} lines`)
  console.log(`    ${totalWords} words (est ${estimatedSpeechTime.toFixed(0)}s speech), ${totalLong} long + ${totalShort} short pauses`)
  console.log(`    Calibrated: longPause=${longDur.toFixed(2)}s, shortPause=${shortDur.toFixed(2)}s`)
  console.log(`    Split: ${calibratedSpeechTime.toFixed(0)}s speech + ${calibratedPauseTime.toFixed(0)}s pauses = ${duration.toFixed(0)}s`)

  // Build timestamps: each line gets pause time + speech time
  const timestamps: Array<{ start: number; end: number }> = []
  let cursor = 0

  for (let i = 0; i < preparedLines.length; i++) {
    const start = cursor
    const pauseTime = linePauses[i].long * longDur + linePauses[i].short * shortDur
    const wordTime = totalWords > 0
      ? (lineWordCounts[i] / totalWords) * calibratedSpeechTime
      : 0

    cursor += pauseTime + wordTime
    timestamps.push({ start, end: cursor })
  }

  // Final normalization to exactly match audio duration (handles rounding)
  if (cursor > 0) {
    const scale = duration / cursor
    for (const ts of timestamps) {
      ts.start *= scale
      ts.end *= scale
    }
  }

  // Round to 3 decimal places
  for (const ts of timestamps) {
    ts.start = Math.round(ts.start * 1000) / 1000
    ts.end = Math.round(ts.end * 1000) / 1000
  }

  // Validate
  const lastEnd = timestamps[timestamps.length - 1]?.end ?? 0
  const driftPct = Math.abs(lastEnd - duration) / duration * 100
  if (driftPct > 1) {
    console.warn(`    WARNING: ${driftPct.toFixed(1)}% drift from actual duration`)
  }

  // Write
  const alignPath = join(AUDIO_DIR, subdir, `${slug}.json`)
  const output = {
    lines: preparedLines,
    timestamps,
    duration,
  }
  writeFileSync(alignPath, JSON.stringify(output))
  console.log(`    Written: ${alignPath} (${timestamps.length} lines, duration=${duration.toFixed(1)}s)`)

  return true
}

// --- CLI ---
const args = process.argv.slice(2)
const slugArg = args.find(a => !a.startsWith('--'))
const langArg = (args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'fr') as 'en' | 'fr'
const dirArg = args.find(a => a.startsWith('--dir='))?.split('=')[1]
const allFlag = args.includes('--all')

if (!slugArg && !allFlag) {
  console.log('Usage:')
  console.log('  npx tsx scripts/rebuild-alignment.ts <slug> --lang=fr')
  console.log('  npx tsx scripts/rebuild-alignment.ts --all --lang=en')
  console.log('  npx tsx scripts/rebuild-alignment.ts --all --lang=en --dir=en-v2')
  process.exit(0)
}

console.log(`=== Rebuild Alignment (no API calls) ===`)
console.log(`Language: ${langArg}, Audio dir: ${dirArg ?? langArg}`)
console.log()

if (allFlag) {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'))
  let rebuilt = 0
  for (const f of files) {
    const slug = f.replace('.json', '')
    if (rebuildAlignment(slug, langArg, dirArg)) rebuilt++
  }
  console.log(`\nRebuilt ${rebuilt} alignment files.`)
} else if (slugArg) {
  rebuildAlignment(slugArg, langArg, dirArg)
}

console.log('\nDone!')
