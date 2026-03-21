/**
 * QA script for meditation audio — checks alignment, breathing, and duration integrity.
 *
 * Usage:
 *   npx tsx scripts/qa-meditations.ts                    # All meditations
 *   npx tsx scripts/qa-meditations.ts <slug>             # Single meditation
 *   npx tsx scripts/qa-meditations.ts --lang=en          # Specific language
 *   npx tsx scripts/qa-meditations.ts --verbose          # Show all checks, not just failures
 */

import { readFileSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = resolve(__dirname, '..')
const CONTENT_DIR = join(PROJECT_ROOT, 'src', 'content', 'meditations')
const AUDIO_DIR = join(PROJECT_ROOT, 'audio-storage')

// ─── Types ──────────────────────────────────────────────────────────────────

interface AlignmentJSON {
  lines: string[]
  timestamps: Array<{ start: number; end: number }>
  duration: number
}

interface MeditationJSON {
  slug: string
  category: string
  durationMin: number
  scriptEn: string
  scriptFr?: string
  breathing: {
    slug: string
    inhale: number
    holdIn: number
    exhale: number
    holdOut: number
    rounds: number
  } | null
  segments?: {
    en?: { available: boolean; durations: number[] }
  }
}

interface QAResult {
  slug: string
  lang: string
  checks: Array<{
    name: string
    status: 'pass' | 'warn' | 'fail'
    detail: string
  }>
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getAudioDuration(path: string): number {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'quiet', '-show_entries', 'format=duration',
      '-of', 'csv=p=0', path,
    ]).toString().trim()
    return parseFloat(out)
  } catch {
    return -1
  }
}

function check(
  results: QAResult['checks'],
  name: string,
  condition: boolean,
  detail: string,
  warnOnly = false,
): void {
  results.push({
    name,
    status: condition ? 'pass' : warnOnly ? 'warn' : 'fail',
    detail,
  })
}

// ─── QA Checks ──────────────────────────────────────────────────────────────

function qaMediation(slug: string, lang: string): QAResult {
  const checks: QAResult['checks'] = []
  const medPath = join(CONTENT_DIR, `${slug}.json`)
  const alignPath = join(AUDIO_DIR, lang, `${slug}.json`)
  const mp3Path = join(AUDIO_DIR, lang, `${slug}.mp3`)

  // 1. Files exist
  check(checks, 'meditation JSON exists', existsSync(medPath), medPath)
  if (!existsSync(medPath)) return { slug, lang, checks }

  const med: MeditationJSON = JSON.parse(readFileSync(medPath, 'utf-8'))

  check(checks, 'audio MP3 exists', existsSync(mp3Path), mp3Path)
  check(checks, 'alignment JSON exists', existsSync(alignPath), alignPath)
  if (!existsSync(alignPath) || !existsSync(mp3Path)) return { slug, lang, checks }

  const alignment: AlignmentJSON = JSON.parse(readFileSync(alignPath, 'utf-8'))

  // 2. Audio duration vs alignment duration
  const actualDuration = getAudioDuration(mp3Path)
  const durationDiff = Math.abs(actualDuration - alignment.duration)
  check(
    checks,
    'audio duration matches alignment',
    durationDiff < 3.0,
    `audio=${actualDuration.toFixed(1)}s, alignment=${alignment.duration.toFixed(1)}s, diff=${durationDiff.toFixed(1)}s`,
  )

  // 3. Lines/timestamps array length match
  check(
    checks,
    'lines count == timestamps count',
    alignment.lines.length === alignment.timestamps.length,
    `lines=${alignment.lines.length}, timestamps=${alignment.timestamps.length}`,
  )

  // 4. Timestamps are monotonically non-decreasing
  let monotonic = true
  let firstBadTs = -1
  for (let i = 1; i < alignment.timestamps.length; i++) {
    if (alignment.timestamps[i].start < alignment.timestamps[i - 1].start - 0.01) {
      monotonic = false
      firstBadTs = i
      break
    }
  }
  check(
    checks,
    'timestamps monotonically increasing',
    monotonic,
    monotonic ? 'OK' : `line ${firstBadTs}: ${alignment.timestamps[firstBadTs]?.start}s < ${alignment.timestamps[firstBadTs - 1]?.start}s`,
  )

  // 5. No BREATHING_SECTION markers remaining in processed audio
  const breathingMarkers = alignment.lines.filter(l => l.includes('BREATHING_SECTION')).length
  check(
    checks,
    'no BREATHING_SECTION markers in final alignment',
    breathingMarkers === 0,
    `found ${breathingMarkers} markers`,
  )

  // 6. Breathing section sanity (if breathing is configured)
  if (med.breathing) {
    const { inhale, holdIn, exhale, holdOut, rounds } = med.breathing
    const phases = [inhale, holdIn, exhale, holdOut].filter(v => v > 0)
    const INTER_PHASE_GAP = 0.5
    const INTER_ROUND_GAP = 2.0
    const cycleDur = phases.reduce((a, b) => a + b, 0)
    const gapsPerRound = (phases.length - 1) * INTER_PHASE_GAP
    // Clip instruction audio adds ~2-3s per phase
    const clipOverhead = phases.length * 2.5
    const expectedMin = (cycleDur + gapsPerRound) * rounds + (rounds - 1) * INTER_ROUND_GAP
    const expectedMax = expectedMin + clipOverhead * rounds

    // Find breathing instruction lines in alignment
    const breathingLines = alignment.lines.filter(l =>
      /breathe in|inhale|hold gently|breathe out|exhale|again.*in|one more/i.test(l)
    )

    check(
      checks,
      'breathing pattern configured',
      true,
      `${med.breathing.slug}: ${inhale}/${holdIn}/${exhale}/${holdOut} × ${rounds} rounds`,
    )

    check(
      checks,
      'breathing instruction clips present',
      breathingLines.length >= rounds * phases.length,
      `found ${breathingLines.length} instruction lines, expected ≥${rounds * phases.length}`,
    )
  } else {
    check(checks, 'breathing null (natural/narrated)', true, 'no clip-based breathing expected')
  }

  // 7. Script text vs alignment text comparison
  const scriptField = lang === 'fr' ? med.scriptFr : med.scriptEn
  if (scriptField) {
    // Extract spoken lines from script (strip [BREATHING:...], [Xs pause], stage directions)
    const scriptLines = scriptField
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('[') && l.length > 10)
      .slice(0, 5) // Check first 5 spoken lines

    const alignSpokenLines = alignment.lines
      .filter(l => l && !l.startsWith('[') && l.length > 10)
      .slice(0, 5)

    // Check if first few spoken lines match
    let matchCount = 0
    for (let i = 0; i < Math.min(scriptLines.length, alignSpokenLines.length); i++) {
      // Normalize whitespace and compare first 50 chars
      const s = scriptLines[i].replace(/\s+/g, ' ').slice(0, 50)
      const a = alignSpokenLines[i].replace(/\s+/g, ' ').slice(0, 50)
      if (s === a) matchCount++
    }

    check(
      checks,
      'script text matches alignment (first 5 lines)',
      matchCount >= 3,
      `${matchCount}/${Math.min(scriptLines.length, alignSpokenLines.length)} lines match`,
      true, // warn only
    )
  }

  // 8. Duration variants (assembled files)
  if (med.segments?.en?.available && med.segments.en.durations.length > 0) {
    for (const dur of med.segments.en.durations) {
      const assembledMp3 = join(AUDIO_DIR, lang, 'segments', slug, 'assembled', `${dur}min.mp3`)
      const assembledJson = join(AUDIO_DIR, lang, 'segments', slug, 'assembled', `${dur}min.json`)

      if (existsSync(assembledMp3)) {
        const assembledDuration = getAudioDuration(assembledMp3)
        const targetSeconds = dur * 60
        const ratio = assembledDuration / targetSeconds

        check(
          checks,
          `${dur}min variant duration`,
          ratio >= 0.5 && ratio <= 1.1,
          `actual=${(assembledDuration / 60).toFixed(1)}min (${(ratio * 100).toFixed(0)}% of target)`,
          ratio < 0.7, // warn if under 70% of target
        )

        // Check assembled alignment exists
        check(
          checks,
          `${dur}min alignment exists`,
          existsSync(assembledJson),
          assembledJson,
        )

        if (existsSync(assembledJson)) {
          const assembledAlign: AlignmentJSON = JSON.parse(readFileSync(assembledJson, 'utf-8'))
          const assembledDiff = Math.abs(assembledDuration - assembledAlign.duration)
          check(
            checks,
            `${dur}min alignment duration match`,
            assembledDiff < 3.0,
            `audio=${assembledDuration.toFixed(1)}s, align=${assembledAlign.duration.toFixed(1)}s`,
          )
        }
      } else {
        check(checks, `${dur}min variant exists`, false, `missing: ${assembledMp3}`)
      }
    }
  }

  // 9. Large timestamp gaps (potential sync issues)
  const largeGaps: string[] = []
  for (let i = 1; i < alignment.timestamps.length; i++) {
    const gap = alignment.timestamps[i].start - alignment.timestamps[i - 1].end
    if (gap > 30 && !alignment.lines[i - 1].includes('pause') && !alignment.lines[i].includes('pause')) {
      largeGaps.push(`line ${i}: ${gap.toFixed(1)}s gap`)
    }
  }
  check(
    checks,
    'no unexplained timestamp gaps >30s',
    largeGaps.length === 0,
    largeGaps.length === 0 ? 'OK' : largeGaps.slice(0, 3).join('; '),
    true,
  )

  return { slug, lang, checks }
}

// ─── Main ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const langArg = args.find(a => a.startsWith('--lang='))?.split('=')[1] ?? 'en'
const slugArg = args.find(a => !a.startsWith('--'))

// Find all meditate-family slugs
const allSlugs: string[] = []
if (slugArg) {
  allSlugs.push(slugArg)
} else {
  const { readdirSync } = await import('fs')
  const files = readdirSync(CONTENT_DIR)
  for (const f of files) {
    if (f.startsWith('meditate-') && f.endsWith('.json')) {
      allSlugs.push(f.replace('.json', ''))
    }
  }
  allSlugs.sort()
}

console.log(`\n=== Meditation QA ===`)
console.log(`Language: ${langArg}, Meditations: ${allSlugs.length}\n`)

let totalPass = 0
let totalWarn = 0
let totalFail = 0

for (const slug of allSlugs) {
  const result = qaMediation(slug, langArg)
  const fails = result.checks.filter(c => c.status === 'fail')
  const warns = result.checks.filter(c => c.status === 'warn')
  const passes = result.checks.filter(c => c.status === 'pass')

  totalPass += passes.length
  totalWarn += warns.length
  totalFail += fails.length

  const icon = fails.length > 0 ? '✗' : warns.length > 0 ? '⚠' : '✓'
  console.log(`  ${icon} ${slug} — ${passes.length} pass, ${warns.length} warn, ${fails.length} fail`)

  if (verbose || fails.length > 0 || warns.length > 0) {
    for (const c of result.checks) {
      if (verbose || c.status !== 'pass') {
        const statusIcon = c.status === 'pass' ? '  ✓' : c.status === 'warn' ? '  ⚠' : '  ✗'
        console.log(`    ${statusIcon} ${c.name}: ${c.detail}`)
      }
    }
  }
  console.log('')
}

console.log(`=== Summary: ${totalPass} pass, ${totalWarn} warn, ${totalFail} fail ===\n`)
process.exit(totalFail > 0 ? 1 : 0)
