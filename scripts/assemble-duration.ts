/**
 * Variable-duration assembly for meditate-family meditations.
 *
 * Takes segmented audio (intro, breathing, core, outro) and assembles
 * time-targeted versions (10, 15, 20 min) by trimming the core at
 * detected cut points.
 *
 * Usage:
 *   npx tsx scripts/assemble-duration.ts <slug> --duration=10 --lang=en
 *   npx tsx scripts/assemble-duration.ts <slug> --all-durations --lang=en
 *   npx tsx scripts/assemble-duration.ts --all --lang=en
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, cpSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const AUDIO_DIR = join(PROJECT_ROOT, 'audio-storage')
const PUBLIC_AUDIO_DIR = join(PROJECT_ROOT, 'public', 'audio')

// ─── Types ──────────────────────────────────────────────────────────────────

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
  cutPoints: Array<{
    time: number
    alignLine: number
    label: string
  }>
  availableDurations: number[]
}

interface AlignmentJSON {
  lines: string[]
  timestamps: Array<{ start: number; end: number }>
  duration: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadMetadata(slug: string, lang: string): SegmentMetadata | null {
  const path = join(AUDIO_DIR, lang, 'segments', slug, 'metadata.json')
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function loadSegmentAlignment(slug: string, lang: string, segment: string): AlignmentJSON | null {
  const path = join(AUDIO_DIR, lang, 'segments', slug, `${segment}.json`)
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function getSegmentMp3(slug: string, lang: string, segment: string): string {
  return join(AUDIO_DIR, lang, 'segments', slug, `${segment}.mp3`)
}

function getSegmentedSlugs(lang: string): string[] {
  const segDir = join(AUDIO_DIR, lang, 'segments')
  if (!existsSync(segDir)) return []
  return readdirSync(segDir).filter(d =>
    existsSync(join(segDir, d, 'metadata.json'))
  ).sort()
}

// ─── Assembly ───────────────────────────────────────────────────────────────

function assembleDuration(
  slug: string,
  lang: string,
  targetMinutes: number,
): boolean {
  const meta = loadMetadata(slug, lang)
  if (!meta) {
    console.error(`  No metadata for ${slug} (${lang})`)
    return false
  }

  if (!meta.availableDurations.includes(targetMinutes)) {
    console.error(`  Duration ${targetMinutes}min not available for ${slug} (available: ${meta.availableDurations.join(', ')})`)
    return false
  }

  const targetSec = targetMinutes * 60

  // Calculate segment durations
  const intro = meta.segments['intro']
  const breathing = meta.segments['breathing']
  const core = meta.segments['core']
  const outro = meta.segments['outro']

  if (!intro || !breathing || !core || !outro) {
    console.error(`  Missing required segments for ${slug} (need: intro, breathing, core, outro)`)
    return false
  }

  const introDur = intro.timeEnd - intro.timeStart
  const breathingDur = breathing.timeEnd - breathing.timeStart
  const outroDur = outro.timeEnd - outro.timeStart
  const fixedDur = introDur + breathingDur + outroDur
  const targetCoreDur = targetSec - fixedDur

  if (targetCoreDur <= 0) {
    console.error(`  Target ${targetMinutes}min too short (fixed segments = ${(fixedDur / 60).toFixed(1)}min)`)
    return false
  }

  // Find best cut point: latest one that gives us ≤ targetCoreDur
  // Cut points are in full-audio time; convert to core-relative time
  const coreStart = core.timeStart
  const coreCutPoints = meta.cutPoints
    .map(cp => ({
      ...cp,
      coreRelativeTime: cp.time - coreStart,
    }))
    .filter(cp => cp.coreRelativeTime > 0 && cp.coreRelativeTime <= targetCoreDur)

  if (coreCutPoints.length === 0) {
    console.error(`  No suitable cut point for ${targetMinutes}min (target core: ${targetCoreDur.toFixed(1)}s)`)
    return false
  }

  const bestCut = coreCutPoints[coreCutPoints.length - 1]

  const actualCoreDur = bestCut.coreRelativeTime
  const actualTotalDur = fixedDur + actualCoreDur

  console.log(`    Target: ${targetMinutes}min (${targetSec}s)`)
  console.log(`    Fixed: intro=${introDur.toFixed(1)}s + breathing=${breathingDur.toFixed(1)}s + outro=${outroDur.toFixed(1)}s = ${fixedDur.toFixed(1)}s`)
  console.log(`    Core cut at ${bestCut.coreRelativeTime.toFixed(1)}s (${bestCut.label})`)
  console.log(`    Actual total: ${(actualTotalDur / 60).toFixed(1)}min`)

  // Paths
  const segDir = join(AUDIO_DIR, lang, 'segments', slug)
  const outDir = join(segDir, 'assembled')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const outMp3 = join(outDir, `${targetMinutes}min.mp3`)
  const outJson = join(outDir, `${targetMinutes}min.json`)

  // Verify all segment mp3s exist
  const introMp3 = getSegmentMp3(slug, lang, 'intro')
  const breathingMp3 = getSegmentMp3(slug, lang, 'breathing')
  const coreMp3 = getSegmentMp3(slug, lang, 'core')
  const outroMp3 = getSegmentMp3(slug, lang, 'outro')

  for (const [name, path] of [['intro', introMp3], ['breathing', breathingMp3], ['core', coreMp3], ['outro', outroMp3]]) {
    if (!existsSync(path)) {
      console.error(`  Missing segment mp3: ${name} (${path})`)
      return false
    }
  }

  // Step 1: Trim core with fade-out at cut point
  const trimmedCore = join(outDir, `_core_trimmed_${targetMinutes}.mp3`)

  try {
    // Trim core and add 2s fade-out at end
    const fadeStart = Math.max(0, bestCut.coreRelativeTime - 2)
    execFileSync('ffmpeg', [
      '-y', '-i', coreMp3,
      '-t', bestCut.coreRelativeTime.toFixed(3),
      '-af', `afade=t=out:st=${fadeStart.toFixed(3)}:d=2`,
      '-q:a', '2',
      trimmedCore,
    ], { stdio: 'pipe' })
  } catch (e) {
    console.error(`    Failed to trim core: ${e}`)
    return false
  }

  // Step 2: Concatenate intro + breathing + trimmed_core + outro
  // Create concat file list
  const concatList = join(outDir, `_concat_${targetMinutes}.txt`)
  const concatContent = [introMp3, breathingMp3, trimmedCore, outroMp3]
    .map(p => `file '${p}'`)
    .join('\n')
  writeFileSync(concatList, concatContent)

  try {
    execFileSync('ffmpeg', [
      '-y', '-f', 'concat', '-safe', '0',
      '-i', concatList,
      '-c', 'copy',
      outMp3,
    ], { stdio: 'pipe' })
  } catch {
    // If concat copy fails (different codecs), re-encode
    try {
      execFileSync('ffmpeg', [
        '-y', '-f', 'concat', '-safe', '0',
        '-i', concatList,
        '-q:a', '2',
        outMp3,
      ], { stdio: 'pipe' })
    } catch (e) {
      console.error(`    Failed to concatenate: ${e}`)
      return false
    }
  }

  // Step 3: Build combined alignment JSON
  const introAlign = loadSegmentAlignment(slug, lang, 'intro')
  const breathingAlign = loadSegmentAlignment(slug, lang, 'breathing')
  const coreAlign = loadSegmentAlignment(slug, lang, 'core')
  const outroAlign = loadSegmentAlignment(slug, lang, 'outro')

  if (!introAlign || !breathingAlign || !coreAlign || !outroAlign) {
    console.error(`    Missing segment alignment JSON`)
    return false
  }

  // Trim core alignment to cut point
  const coreAlignTrimmed: AlignmentJSON = {
    lines: [],
    timestamps: [],
    duration: actualCoreDur,
  }

  for (let i = 0; i < coreAlign.lines.length; i++) {
    const ts = coreAlign.timestamps[i]
    if (ts.start >= bestCut.coreRelativeTime) break
    coreAlignTrimmed.lines.push(coreAlign.lines[i])
    coreAlignTrimmed.timestamps.push({
      start: ts.start,
      end: Math.min(ts.end, bestCut.coreRelativeTime),
    })
  }

  // Concatenate alignments with offsets
  const combined: AlignmentJSON = {
    lines: [],
    timestamps: [],
    duration: actualTotalDur,
  }

  let timeOffset = 0

  for (const align of [introAlign, breathingAlign, coreAlignTrimmed, outroAlign]) {
    for (let i = 0; i < align.lines.length; i++) {
      combined.lines.push(align.lines[i])
      combined.timestamps.push({
        start: align.timestamps[i].start + timeOffset,
        end: align.timestamps[i].end + timeOffset,
      })
    }
    timeOffset += align.duration
  }

  writeFileSync(outJson, JSON.stringify(combined, null, 2) + '\n')

  // Cleanup temp files
  try { unlinkSync(trimmedCore) } catch { /* non-critical */ }
  try { unlinkSync(concatList) } catch { /* non-critical */ }

  console.log(`    Wrote ${targetMinutes}min.mp3 (${(actualTotalDur / 60).toFixed(1)}min actual)`)
  console.log(`    Wrote ${targetMinutes}min.json (${combined.lines.length} lines)`)

  // Copy to public/ so Astro serves them
  const publicDir = join(PUBLIC_AUDIO_DIR, lang, 'segments', slug, 'assembled')
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })
  cpSync(outMp3, join(publicDir, `${targetMinutes}min.mp3`))
  cpSync(outJson, join(publicDir, `${targetMinutes}min.json`))
  console.log(`    Copied to public/audio/${lang}/segments/${slug}/assembled/`)

  return true
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function main(): void {
  const args = process.argv.slice(2)
  const slugArg = args.find(a => !a.startsWith('--'))
  const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'en'
  const durationArg = args.find(a => a.startsWith('--duration='))?.split('=')[1]
  const allDurations = args.includes('--all-durations')
  const all = args.includes('--all')

  if (!slugArg && !all) {
    console.log('Usage:')
    console.log('  npx tsx scripts/assemble-duration.ts <slug> --duration=10 --lang=en')
    console.log('  npx tsx scripts/assemble-duration.ts <slug> --all-durations --lang=en')
    console.log('  npx tsx scripts/assemble-duration.ts --all --lang=en')
    process.exit(1)
  }

  const slugs = all ? getSegmentedSlugs(lang) : [slugArg!]

  console.log(`\n=== Duration Assembly ===`)
  console.log(`Language: ${lang}`)
  console.log(`Meditations: ${slugs.length}`)

  let success = 0
  let failed = 0

  for (const slug of slugs) {
    console.log(`\n  ${slug}:`)

    const meta = loadMetadata(slug, lang)
    if (!meta) {
      console.error(`  No metadata found`)
      failed++
      continue
    }

    let durations: number[]
    if (allDurations || all || !durationArg) {
      durations = meta.availableDurations
    } else {
      durations = [parseInt(durationArg)]
    }

    for (const dur of durations) {
      const ok = assembleDuration(slug, lang, dur)
      if (ok) success++
      else failed++
    }
  }

  console.log(`\n=== Done: ${success} assembled, ${failed} failed ===`)
}

main()
