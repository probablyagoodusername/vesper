export type LineType = 'stage-direction' | 'scripture' | 'body' | 'pause' | 'breathing'

export interface BreathingConfig {
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  rounds: number
}

export interface ParsedLine {
  type: LineType
  text: string
  /** Weight for audio sync timing (only used by MeditationPlayer) */
  weight: number
  /** Breathing config — only for type 'breathing' */
  breathingConfig?: BreathingConfig
}

const WORDS_PER_SEC = 1.3
const LINE_PAUSE_SEC = 1.5

/** Known breathing patterns — maps keywords to configs */
const BREATHING_PATTERNS: Record<string, BreathingConfig> = {
  'box': { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 4 },
  'carré': { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 4 },
  'carrée': { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 4 },
  '4-7-8': { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 4 },
  'energizing': { inhale: 4, holdIn: 2, exhale: 4, holdOut: 0, rounds: 6 },
  'énergisante': { inhale: 4, holdIn: 2, exhale: 4, holdOut: 0, rounds: 6 },
  'deep-calm': { inhale: 5, holdIn: 3, exhale: 7, holdOut: 0, rounds: 4 },
  'calme': { inhale: 5, holdIn: 3, exhale: 7, holdOut: 0, rounds: 4 },
  'sleep': { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 3 },
  'sommeil': { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 3 },
}

function parseBreathingTag(text: string): BreathingConfig | undefined {
  const lower = text.toLowerCase()
  for (const [key, config] of Object.entries(BREATHING_PATTERNS)) {
    if (lower.includes(key)) return config
  }
  // Try to extract numbers: "inspirer X temps, retenir X, expirer X, retenir X, Y cycles"
  const nums = text.match(/(\d+)/g)
  if (nums && nums.length >= 4) {
    return {
      inhale: parseInt(nums[0]),
      holdIn: parseInt(nums[1]),
      exhale: parseInt(nums[2]),
      holdOut: parseInt(nums[3]),
      rounds: nums[5] ? parseInt(nums[5]) : 4,
    }
  }
  return undefined
}

/**
 * Parse a meditation script into structured lines.
 * Recognizes stage directions `[...]`, pause markers `[Xs pause]`,
 * breathing tags `[BREATHING: ...]`, and scripture quotes.
 */
export function parseScript(script: string): ParsedLine[] {
  const lines: ParsedLine[] = []

  for (const raw of script.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    const pauseMatch = trimmed.match(/^\[(\d+)s?\s+(?:de\s+)?(?:pause|silence)\]$/i)
    if (pauseMatch) {
      lines.push({ type: 'pause', text: '', weight: parseInt(pauseMatch[1]) * 0.4 })
      continue
    }

    // Breathing tag: [BREATHING: ...description...]
    const breathingMatch = trimmed.match(/^\[BREATHING:\s*(.+)\]$/i)
    if (breathingMatch) {
      const config = parseBreathingTag(breathingMatch[1])
      const cycleDuration = config ? (config.inhale + config.holdIn + config.exhale + config.holdOut) * config.rounds : 60
      lines.push({
        type: 'breathing',
        text: breathingMatch[1],
        weight: cycleDuration * 0.3,
        breathingConfig: config,
      })
      continue
    }

    if (/^\[.+\]$/.test(trimmed)) {
      lines.push({ type: 'stage-direction', text: trimmed.slice(1, -1), weight: 0 })
      continue
    }

    const wordCount = trimmed.split(/\s+/).length
    const spokenTime = wordCount / WORDS_PER_SEC + LINE_PAUSE_SEC

    if (/^[""\u201C«]/.test(trimmed) && (/[—\u2014]/.test(trimmed) || /[»"]$/.test(trimmed))) {
      lines.push({ type: 'scripture', text: trimmed, weight: spokenTime * 1.2 })
      continue
    }

    lines.push({ type: 'body', text: trimmed, weight: spokenTime })
  }

  return lines
}
