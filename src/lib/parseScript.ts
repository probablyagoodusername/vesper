export type LineType = 'stage-direction' | 'scripture' | 'body' | 'pause'

export interface ParsedLine {
  type: LineType
  text: string
  /** Weight for audio sync timing (only used by MeditationPlayer) */
  weight: number
}

const WORDS_PER_SEC = 1.3
const LINE_PAUSE_SEC = 1.5

/**
 * Parse a meditation script into structured lines.
 * Recognizes stage directions `[...]`, pause markers `[Xs pause]`,
 * and scripture quotes (starting with a quote mark and containing an em dash).
 */
export function parseScript(script: string): ParsedLine[] {
  const lines: ParsedLine[] = []

  for (const raw of script.split('\n')) {
    const trimmed = raw.trim()
    if (!trimmed) continue

    const pauseMatch = trimmed.match(/^\[(\d+)s\s+pause\]$/i)
    if (pauseMatch) {
      lines.push({ type: 'pause', text: '', weight: parseInt(pauseMatch[1]) * 0.4 })
      continue
    }

    if (/^\[.+\]$/.test(trimmed)) {
      lines.push({ type: 'stage-direction', text: trimmed.slice(1, -1), weight: 0 })
      continue
    }

    const wordCount = trimmed.split(/\s+/).length
    const spokenTime = wordCount / WORDS_PER_SEC + LINE_PAUSE_SEC

    if (/^[""\u201C]/.test(trimmed) && /[—\u2014]/.test(trimmed)) {
      lines.push({ type: 'scripture', text: trimmed, weight: spokenTime * 1.2 })
      continue
    }

    lines.push({ type: 'body', text: trimmed, weight: spokenTime })
  }

  return lines
}
