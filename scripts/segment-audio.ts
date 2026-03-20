/**
 * Audio segmentation for meditate-family meditations.
 *
 * Detects 4 segment boundaries (intro, breathing, core, outro) from
 * alignment data, then slices MP3 + alignment JSON via ffmpeg.
 *
 * Usage:
 *   npx tsx scripts/segment-audio.ts <slug> --lang=en
 *   npx tsx scripts/segment-audio.ts --all --lang=en
 *   npx tsx scripts/segment-audio.ts <slug> --dry-run
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CONTENT_DIR = join(PROJECT_ROOT, 'src', 'content', 'meditations')
const AUDIO_DIR = join(PROJECT_ROOT, 'audio-storage')
const PUBLIC_AUDIO_DIR = join(PROJECT_ROOT, 'public', 'audio')
const DEPLOYED_AUDIO_DIR = '/var/www/vesper-static/audio'

// ─── Types ──────────────────────────────────────────────────────────────────

interface MeditationJSON {
  slug: string
  category: string
  scriptEn: string
  scriptFr: string
  breathing: {
    slug: string
    inhale: number
    holdIn: number
    exhale: number
    holdOut: number
    rounds: number
  } | null
  segments?: Record<string, { available: boolean; durations: number[] }>
}

interface AlignmentJSON {
  lines: string[]
  timestamps: Array<{ start: number; end: number }>
  duration: number
}

interface SegmentBoundary {
  name: 'intro' | 'breathing' | 'core' | 'outro'
  alignLineStart: number
  alignLineEnd: number
  timeStart: number
  timeEnd: number
}

interface CutPoint {
  time: number
  alignLine: number
  label: string
}

interface SegmentMetadata {
  slug: string
  lang: string
  fullDuration: number
  segments: Record<string, {
    timeStart: number
    timeEnd: number
    alignLineStart: number
    alignLineEnd: number
  }>
  cutPoints: CutPoint[]
  availableDurations: number[]
}

// ─── Boundary detection patterns ────────────────────────────────────────────

// Patterns that signal the start of breathing section
const BREATHING_START_EN = [
  /\btake\s+(?:a|one)\s+(?:slow\s+)?breath\b/i,
  /\bbreathe\s+in\s+through\b/i,
  /\binhale\b.*\b(?:one|two|three|four|five)\b/i,
  /\bin\s*\.\.\.\s*(?:two|one)\b/i,
  /\bbegin\s+(?:to\s+)?(?:breathe|breathing)\b/i,
  /\blet['']?s\s+(?:start|begin)\s+(?:with\s+)?(?:the\s+)?breath/i,
]

const BREATHING_START_FR = [
  /\bprenez\s+une?\s+(?:lent[e]?\s+)?(?:respiration|inspiration|souffle)\b/i,
  /\binspirez\s+par\b/i,
  /\bcommençons?\s+(?:par\s+)?(?:la\s+)?respir/i,
]

// Patterns that signal breathing section is over → core begins
const CORE_START_EN = [
  /\blet\s+(?:your\s+)?breathing\s+settle\b/i,
  /\bbreathe\s+naturally\b/i,
  /\blet\s+the\s+(?:box\s+)?pattern\s+(?:soften|go|dissolve)\b/i,
  /\byou\s+don['']?t\s+need\s+to\s+(?:guide|control|manage)\s+it\b/i,
  /\blet\s+(?:your\s+)?breath(?:ing)?\s+return\s+to\b/i,
  /\bthe\s+breathing\s+(?:has\s+done|did)\s+its\s+work\b/i,
  /\brelease\s+the\s+(?:counting|pattern|rhythm)\b/i,
  /\blet\s+the\s+breathing\s+(?:go|find)\s+(?:natural|its\s+own)\b/i,
  /\blet\s+(?:your\s+)?breathing\s+find\s+its\s+own\b/i,
]

// Fallback patterns: used only if primary core-start markers aren't found
// (for meditations with minimal breathing that transition directly to content)
const CORE_START_FALLBACK_EN = [
  /\bi\s+want\s+to\s+start\s+with\b/i,
  /\byou['']?re\s+here\s+because\b/i,
  /\bnow\s+bring\s+your\s+attention\b/i,
  /\bthere\s+is\s+a\s+voice\b/i,
]

const CORE_START_FR = [
  /\blaissez?\s+(?:votre\s+)?respiration\s+(?:se\s+)?(?:calmer|poser|installer)\b/i,
  /\brespir(?:ez|ons)\s+naturellement\b/i,
  /\blaissez?\s+le\s+(?:rythme|pattern)\s+(?:s[''])?(?:adoucir|effacer|dissoudre)\b/i,
  /\blaissez?\s+(?:votre\s+)?respiration\s+(?:trouver|retrouver)\b/i,
  /\bje\s+(?:veux|voudrais)\s+commencer\s+(?:par|avec)\b/i,
  /\bportez\s+votre\s+attention\s+(?:sur|vers)\b/i,
]

// Patterns that signal the outro (closing prayer / return)
const OUTRO_START_EN = [
  /\blet\s+me\s+pray\b/i,
  /\blet\s+me\s+close\s+with\s+a\s+prayer\b/i,
  /\bas\s+you\s+prepare\s+to\s+return\b/i,
  /\bgently\s+begin\s+to\s+return\b/i,
  /\bas\s+(?:we|you)\s+(?:close|end|finish)\b/i,
  /\bi['']?d\s+like\s+to\s+pray\b/i,
  /\blet['']?s?\s+(?:close|end)\s+(?:with|in)\s+prayer\b/i,
]

const OUTRO_START_FR = [
  /\blaissez-moi\s+prier\b/i,
  /\bpermettez-moi\s+de\s+prier\b/i,
  /\bterminons?\s+(?:par|avec)\s+une?\s+prière\b/i,
  /\bprions\b/i,
  /\bcommencez?\s+doucement\s+à\s+revenir\b/i,
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function stripPauseMarkers(line: string): string {
  return line.replace(/\[(long|short)\s+pause\]/g, '').trim()
}

function isPauseOnlyLine(line: string): boolean {
  return stripPauseMarkers(line).length === 0
}

function loadMeditation(slug: string): MeditationJSON | null {
  const path = join(CONTENT_DIR, `${slug}.json`)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function loadAlignment(slug: string, lang: string): AlignmentJSON | null {
  // Check audio-storage first, then public/audio, then deployed
  for (const dir of [AUDIO_DIR, PUBLIC_AUDIO_DIR, DEPLOYED_AUDIO_DIR]) {
    const path = join(dir, lang, `${slug}.json`)
    if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf-8'))
  }
  return null
}

function findMp3Path(slug: string, lang: string): string | null {
  for (const dir of [AUDIO_DIR, PUBLIC_AUDIO_DIR, DEPLOYED_AUDIO_DIR]) {
    const path = join(dir, lang, `${slug}.mp3`)
    if (existsSync(path)) return path
  }
  return null
}

const MEDITATE_CATEGORIES = new Set(['meditate', 'anxiety', 'self-compassion', 'contemplative'])

function getMeditateFamilySlugs(): string[] {
  const slugs: string[] = []

  for (const file of readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.json')) continue
    const data: MeditationJSON = JSON.parse(readFileSync(join(CONTENT_DIR, file), 'utf-8'))
    if (MEDITATE_CATEGORIES.has(data.category) || data.slug.startsWith('meditate-')) {
      slugs.push(data.slug)
    }
  }

  return slugs.sort()
}

// ─── Boundary detection ─────────────────────────────────────────────────────

function findBoundaryLine(
  alignment: AlignmentJSON,
  patterns: RegExp[],
  startFrom: number,
  searchDirection: 'forward' | 'backward' = 'forward',
): number | null {
  const { lines } = alignment
  if (searchDirection === 'forward') {
    for (let i = startFrom; i < lines.length; i++) {
      const clean = stripPauseMarkers(lines[i])
      if (!clean) continue
      for (const pat of patterns) {
        if (pat.test(clean)) return i
      }
    }
  } else {
    for (let i = startFrom; i >= 0; i--) {
      const clean = stripPauseMarkers(lines[i])
      if (!clean) continue
      for (const pat of patterns) {
        if (pat.test(clean)) return i
      }
    }
  }
  return null
}

function findLastBreathingLine(
  alignment: AlignmentJSON,
  breathingStart: number,
  lang: string,
): number {
  const breathPatterns = lang === 'fr'
    ? [/\brespir/i, /\binspir/i, /\bexpir/i, /\bsouffle\b/i]
    : [/\bbreath/i, /\binhale\b/i, /\bexhale\b/i, /\bin\.\.\./i, /\bout\.\.\./i]

  let lastBreathLine = breathingStart
  // Search up to 20 lines after breathing start
  const searchEnd = Math.min(breathingStart + 20, alignment.lines.length - 1)

  for (let i = breathingStart; i <= searchEnd; i++) {
    const clean = stripPauseMarkers(alignment.lines[i])
    if (!clean) continue
    for (const pat of breathPatterns) {
      if (pat.test(clean)) {
        lastBreathLine = i
        break
      }
    }
  }

  return lastBreathLine
}

function detectSegments(
  alignment: AlignmentJSON,
  lang: string,
): SegmentBoundary[] | null {
  if (alignment.lines.length !== alignment.timestamps.length) {
    console.error(`  Alignment mismatch: ${alignment.lines.length} lines vs ${alignment.timestamps.length} timestamps`)
    return null
  }
  if (alignment.lines.length < 4) {
    console.error(`  Alignment too short: ${alignment.lines.length} lines`)
    return null
  }

  const breathingPatterns = lang === 'fr' ? BREATHING_START_FR : BREATHING_START_EN
  const corePatterns = lang === 'fr' ? CORE_START_FR : CORE_START_EN
  const outroPatterns = lang === 'fr' ? OUTRO_START_FR : OUTRO_START_EN

  const lastLine = alignment.lines.length - 1
  const duration = alignment.duration

  // 1. Find breathing start (must be at line 1+ to leave room for intro)
  const breathingLine = findBoundaryLine(alignment, breathingPatterns, 0)
  if (breathingLine === null) {
    console.error('  Could not detect breathing start')
    return null
  }
  if (breathingLine === 0) {
    console.error('  Breathing detected at line 0 — no intro segment possible')
    return null
  }

  // 2. Find core start (after breathing)
  let coreLine = findBoundaryLine(alignment, corePatterns, breathingLine + 1)
  if (coreLine === null) {
    // Fallback: for meditations with minimal breathing, look for thematic start
    const fallback = lang === 'fr' ? [] : CORE_START_FALLBACK_EN
    if (fallback.length > 0) {
      coreLine = findBoundaryLine(alignment, fallback, breathingLine + 1)
    }
    // Last resort: core starts right after the last breathing-related line
    if (coreLine === null) {
      const breathEnd = findLastBreathingLine(alignment, breathingLine, lang)
      if (breathEnd + 1 >= alignment.lines.length) {
        console.error('  Fallback core detection landed past end of alignment')
        return null
      }
      coreLine = breathEnd + 1
      console.log(`    Note: using fallback core detection at line ${coreLine}`)
    }
  }

  // 3. Find outro start (search backward from end for reliability)
  const outroLine = findBoundaryLine(alignment, outroPatterns, lastLine, 'backward')
  if (outroLine === null) {
    console.error('  Could not detect outro start')
    return null
  }

  // Validate ordering
  if (!(breathingLine < coreLine && coreLine < outroLine)) {
    console.error(`  Invalid segment ordering: breathing=${breathingLine} core=${coreLine} outro=${outroLine}`)
    return null
  }

  const ts = alignment.timestamps

  return [
    {
      name: 'intro',
      alignLineStart: 0,
      alignLineEnd: breathingLine - 1,
      timeStart: 0,
      timeEnd: ts[breathingLine].start,
    },
    {
      name: 'breathing',
      alignLineStart: breathingLine,
      alignLineEnd: coreLine - 1,
      timeStart: ts[breathingLine].start,
      timeEnd: ts[coreLine].start,
    },
    {
      name: 'core',
      alignLineStart: coreLine,
      alignLineEnd: outroLine - 1,
      timeStart: ts[coreLine].start,
      timeEnd: ts[outroLine].start,
    },
    {
      name: 'outro',
      alignLineStart: outroLine,
      alignLineEnd: lastLine,
      timeStart: ts[outroLine].start,
      timeEnd: duration,
    },
  ]
}

// ─── Cut point detection ────────────────────────────────────────────────────

function findCutPoints(alignment: AlignmentJSON, coreStart: number, coreEnd: number): CutPoint[] {
  const points: CutPoint[] = []
  const { lines, timestamps } = alignment

  // Look for natural silence/pause clusters within the core section
  // Good cut points: pause-only lines that are followed by a thematic shift
  for (let i = coreStart + 5; i < coreEnd - 5; i++) {
    // A pause-only line (silence) is a potential cut point
    if (!isPauseOnlyLine(lines[i])) continue

    // Check if surrounding lines also have pauses (cluster of silence)
    let pauseCount = 0
    for (let j = Math.max(coreStart, i - 2); j <= Math.min(coreEnd, i + 2); j++) {
      if (isPauseOnlyLine(lines[j])) pauseCount++
    }

    // Need at least 2 consecutive pause lines for a meaningful break
    if (pauseCount < 2) continue

    // Skip if too close to last cut point (minimum 60s apart)
    if (points.length > 0) {
      const lastTime = points[points.length - 1].time
      if (timestamps[i].start - lastTime < 60) continue
    }

    // Get label from next spoken line
    let label = ''
    for (let j = i + 1; j < Math.min(coreEnd, i + 5); j++) {
      const clean = stripPauseMarkers(lines[j])
      if (clean) {
        label = `After: "${clean.slice(0, 50)}${clean.length > 50 ? '...' : ''}"`
        break
      }
    }

    points.push({
      time: timestamps[i].start,
      alignLine: i,
      label,
    })
  }

  return points
}

// ─── FFmpeg slicing ─────────────────────────────────────────────────────────

function sliceAudio(
  inputMp3: string,
  outputMp3: string,
  start: number,
  end: number,
): boolean {
  try {
    execFileSync('ffmpeg', [
      '-y', '-i', inputMp3,
      '-ss', start.toFixed(3),
      '-to', end.toFixed(3),
      '-q:a', '2',  // re-encode for precise cuts
      outputMp3,
    ], { stdio: 'pipe' })
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`    ffmpeg error: ${msg}`)
    return false
  }
}

function sliceAlignment(
  alignment: AlignmentJSON,
  lineStart: number,
  lineEnd: number,
  timeOffset: number,
): AlignmentJSON {
  const slicedLines = alignment.lines.slice(lineStart, lineEnd + 1)
  const slicedTs = alignment.timestamps.slice(lineStart, lineEnd + 1).map(ts => ({
    start: Math.max(0, ts.start - timeOffset),
    end: Math.max(0, ts.end - timeOffset),
  }))
  const duration = slicedTs.length > 0
    ? slicedTs[slicedTs.length - 1].end
    : 0

  return {
    lines: slicedLines,
    timestamps: slicedTs,
    duration,
  }
}

// ─── Main segmentation ─────────────────────────────────────────────────────

function segmentMeditation(slug: string, lang: string, dryRun: boolean): boolean {
  console.log(`\n  Processing ${slug} (${lang})...`)

  const med = loadMeditation(slug)
  if (!med) {
    console.error(`  Meditation not found: ${slug}`)
    return false
  }

  const alignment = loadAlignment(slug, lang)
  if (!alignment) {
    console.error(`  Alignment not found for ${slug} (${lang})`)
    return false
  }

  const mp3Path = findMp3Path(slug, lang)
  if (!mp3Path) {
    console.error(`  MP3 not found for ${slug} (${lang})`)
    return false
  }

  // Detect segments
  const segments = detectSegments(alignment, lang)
  if (!segments) {
    console.error(`  Failed to detect segments for ${slug}`)
    return false
  }

  // Find cut points in core
  const coreSegment = segments.find(s => s.name === 'core')!
  const cutPoints = findCutPoints(alignment, coreSegment.alignLineStart, coreSegment.alignLineEnd)

  // Calculate available durations based on fixed segments + core flexibility
  const introDur = segments[0].timeEnd - segments[0].timeStart
  const breathingDur = segments[1].timeEnd - segments[1].timeStart
  const outroDur = segments[3].timeEnd - segments[3].timeStart
  const fixedDur = introDur + breathingDur + outroDur
  const coreDur = coreSegment.timeEnd - coreSegment.timeStart

  const availableDurations: number[] = []
  for (const targetMin of [10, 15, 20]) {
    const targetSec = targetMin * 60
    const neededCore = targetSec - fixedDur
    // Core must be at least 30s and not exceed actual core + 30s tolerance
    if (neededCore >= 30 && neededCore <= coreDur + 30) {
      availableDurations.push(targetMin)
    }
  }

  // Print results
  console.log(`    Segments detected:`)
  for (const seg of segments) {
    const dur = seg.timeEnd - seg.timeStart
    console.log(`      ${seg.name.padEnd(12)} ${seg.timeStart.toFixed(1)}s - ${seg.timeEnd.toFixed(1)}s (${dur.toFixed(1)}s, lines ${seg.alignLineStart}-${seg.alignLineEnd})`)
  }
  console.log(`    Fixed duration (intro+breathing+outro): ${fixedDur.toFixed(1)}s`)
  console.log(`    Core duration: ${coreDur.toFixed(1)}s`)
  console.log(`    Cut points: ${cutPoints.length}`)
  for (const cp of cutPoints) {
    console.log(`      ${cp.time.toFixed(1)}s (line ${cp.alignLine}) — ${cp.label}`)
  }
  console.log(`    Available durations: ${availableDurations.join(', ')} min`)

  if (dryRun) return true

  // Create output directory
  const outDir = join(AUDIO_DIR, lang, 'segments', slug)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  // Slice audio + alignment for each segment
  for (const seg of segments) {
    const segMp3 = join(outDir, `${seg.name}.mp3`)
    const segJson = join(outDir, `${seg.name}.json`)

    // Slice MP3
    if (!sliceAudio(mp3Path, segMp3, seg.timeStart, seg.timeEnd)) {
      console.error(`    Failed to slice ${seg.name}.mp3`)
      return false
    }

    // Slice alignment
    const segAlignment = sliceAlignment(alignment, seg.alignLineStart, seg.alignLineEnd, seg.timeStart)
    writeFileSync(segJson, JSON.stringify(segAlignment, null, 2) + '\n')

    console.log(`    Wrote ${seg.name}.mp3 + .json`)
  }

  // Write metadata
  const metadata: SegmentMetadata = {
    slug,
    lang,
    fullDuration: alignment.duration,
    segments: Object.fromEntries(
      segments.map(seg => [seg.name, {
        timeStart: seg.timeStart,
        timeEnd: seg.timeEnd,
        alignLineStart: seg.alignLineStart,
        alignLineEnd: seg.alignLineEnd,
      }])
    ),
    cutPoints,
    availableDurations,
  }

  writeFileSync(join(outDir, 'metadata.json'), JSON.stringify(metadata, null, 2) + '\n')
  console.log(`    Wrote metadata.json`)

  // Update meditation JSON with segment info
  if (!med.segments) med.segments = {}
  med.segments[lang] = { available: true, durations: availableDurations }
  writeFileSync(join(CONTENT_DIR, `${slug}.json`), JSON.stringify(med, null, 2) + '\n')
  console.log(`    Updated ${slug}.json with segment info`)

  return true
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2)
  const slugArg = args.find(a => !a.startsWith('--'))
  const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'en'
  const dryRun = args.includes('--dry-run')
  const all = args.includes('--all')

  if (!slugArg && !all) {
    console.log('Usage:')
    console.log('  npx tsx scripts/segment-audio.ts <slug> --lang=en')
    console.log('  npx tsx scripts/segment-audio.ts --all --lang=en')
    console.log('  npx tsx scripts/segment-audio.ts <slug> --dry-run')
    process.exit(1)
  }

  const slugs = all ? getMeditateFamilySlugs() : [slugArg!]

  console.log(`\n=== Audio Segmentation ${dryRun ? '(DRY RUN)' : ''} ===`)
  console.log(`Language: ${lang}`)
  console.log(`Meditations: ${slugs.length}`)

  let success = 0
  let failed = 0

  for (const slug of slugs) {
    const ok = segmentMeditation(slug, lang, dryRun)
    if (ok) success++
    else failed++
  }

  console.log(`\n=== Done: ${success} OK, ${failed} failed ===`)
}

main()
