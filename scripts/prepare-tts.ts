/**
 * TTS text preparation — transforms raw meditation scripts into
 * ElevenLabs v3-ready text with [long pause] / [short pause] audio tags.
 *
 * This is DIFFERENT from src/lib/parseScript.ts which is for display rendering.
 * This version adds pacing pauses, strips stage directions, and handles
 * breathing instructions for the TTS engine.
 */

/** Pacing config per category — controls pause density */
export const PACING = {
  sleep:    { sentencePause: 'long', questionPause: 'long long', ellipsisPause: 'long long', paragraphPauses: 3 },
  meditate: { sentencePause: 'long', questionPause: 'long', ellipsisPause: 'long', paragraphPauses: 2 },
  morning:  { sentencePause: 'short', questionPause: 'short', ellipsisPause: 'short', paragraphPauses: 1 },
  sos:      { sentencePause: 'short', questionPause: 'short', ellipsisPause: 'short', paragraphPauses: 1 },
  prayer:   { sentencePause: 'long', questionPause: 'long', ellipsisPause: 'long', paragraphPauses: 2 },
} as const

/** Voice settings per category for ElevenLabs */
export const VOICE_SETTINGS = {
  sleep: {
    stability: 0.80,
    similarity_boost: 0.75,
    style: 0.05,
    use_speaker_boost: true,
    speed: 0.70,
  },
  meditate: {
    stability: 0.70,
    similarity_boost: 0.75,
    style: 0.12,
    use_speaker_boost: true,
    speed: 0.70,
  },
  morning: {
    stability: 0.60,
    similarity_boost: 0.75,
    style: 0.20,
    use_speaker_boost: true,
    speed: 0.70,
  },
  sos: {
    stability: 0.60,
    similarity_boost: 0.75,
    style: 0.15,
    use_speaker_boost: true,
    speed: 0.75,
  },
  prayer: {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.10,
    use_speaker_boost: true,
    speed: 0.70,
  },
} as const

/** Pause multiplier — scales written pause durations per category */
export function getPauseMultiplier(category: string): number {
  if (category === 'morning' || category === 'sos') return 0.3
  if (category === 'sleep') return 0.7
  return 0.5
}

/** Build a v3 pause from chained [long pause] / [short pause] tags */
export function v3Pause(count: number, type: 'long' | 'short' = 'long'): string {
  if (count <= 0) return ''
  return Array(count).fill(`[${type} pause]`).join(' ')
}

/** Convert a pause descriptor like "long long" into chained tags */
export function v3PauseFromDesc(desc: string): string {
  const parts = desc.split(' ')
  return parts.map(p => `[${p} pause]`).join(' ')
}

/** Get voice settings for a category */
export function getVoiceSettings(category: string): Record<string, unknown> {
  if (category === 'sleep') return { ...VOICE_SETTINGS.sleep }
  if (category === 'morning') return { ...VOICE_SETTINGS.morning }
  if (category === 'sos') return { ...VOICE_SETTINGS.sos }
  if (category === 'prayer') return { ...VOICE_SETTINGS.prayer }
  return { ...VOICE_SETTINGS.meditate }
}

/**
 * Transform raw meditation script into TTS-ready text with v3 audio tag pauses.
 *
 * This function:
 * 1. Strips breathing instructions [BREATHING: ...]
 * 2. Converts timed pauses [15s pause] to chained [long pause] tags
 * 3. Strips pure stage directions [...]
 * 4. Strips inline stage directions within spoken text
 * 5. Adds sentence-level pauses after periods, questions, and ellipses
 * 6. Converts paragraph breaks to chained pause tags
 */
export function prepareScript(raw: string, category: string): string {
  const pauseMult = getPauseMultiplier(category)
  const lines = raw.split('\n')
  const output: string[] = []

  // Resolve pacing — use category-specific or fall back to meditate
  const pacingKey = category as keyof typeof PACING
  const pacing = PACING[pacingKey] ?? PACING.meditate

  for (const line of lines) {
    const trimmed = line.trim()

    // Empty line = paragraph break
    if (!trimmed) {
      output.push(v3Pause(pacing.paragraphPauses, 'long'))
      continue
    }

    // Skip breathing instructions
    if (/^\[BREATHING:/.test(trimmed) || /^\[RESPIRATION\s*:/.test(trimmed)) continue

    // Timed pause: [15s pause], [20s silence], etc.
    const timedPause = trimmed.match(/^\[(\d+)s?\s+(?:pause|silence|de pause|de silence).*\]$/i)
    if (timedPause) {
      const seconds = Math.max(1, Math.round(parseInt(timedPause[1]) * pauseMult))
      // ~3s per [long pause], chain as needed
      const longCount = Math.max(1, Math.round(seconds / 3))
      output.push(v3Pause(longCount, 'long'))
      continue
    }

    // Generic [pause] / [silence]
    if (/^\[(pause|silence)\]$/i.test(trimmed)) {
      output.push(v3Pause(Math.max(1, Math.round(3 * pauseMult / 3)), 'long'))
      continue
    }

    // Pure stage direction — skip
    if (/^\[.*\]$/.test(trimmed)) continue

    // Strip inline stage directions
    let cleaned = trimmed.replace(/\[[^\]]+\]/g, '').trim()

    // Add sentence-level pauses using v3 audio tags
    cleaned = cleaned
      .replace(/\.\.\.\s*/g, `... ${v3PauseFromDesc(pacing.ellipsisPause)} `)
      .replace(/\.\s+/g, `. ${v3PauseFromDesc(pacing.sentencePause)} `)
      .replace(/\?\s+/g, `? ${v3PauseFromDesc(pacing.questionPause)} `)

    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim()

    if (cleaned) {
      output.push(cleaned)
    }
  }

  return output.join('\n').trim()
}

/**
 * Split text at natural boundaries if over the char limit.
 * ElevenLabs v3 has a ~5000 char limit per request.
 */
export function chunkText(text: string, maxChars = 4500): string[] {
  if (text.length <= maxChars) return [text]

  const lines = text.split('\n')
  const chunks: string[] = []
  let current = ''

  for (const line of lines) {
    if (current.length + line.length + 1 > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = ''
    }
    current += line + '\n'
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks
}
