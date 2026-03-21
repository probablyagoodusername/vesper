import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import { useCrossfadeLoop } from '@/hooks/useCrossfadeLoop'
import { BASE, VOICES } from '@/lib/constants'
import { parseScript } from '@/lib/parseScript'
import { RelaxAnimation } from '@/components/RelaxAnimation'
import musicTracks from '@/content/music.json'
import type { MeditationData } from '@/types'
import type { ParsedLine } from '@/lib/parseScript'

interface MeditationPlayerProps {
  meditation: MeditationData
  backHref: string
}

interface AlignmentData {
  lines: string[]
  timestamps: Array<{ start: number; end: number }>
  duration: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Build per-display-line time boundaries from alignment data.
 *
 * Alignment lines (from TTS) include pauses as `[long pause]` entries and
 * spoken lines with `[long pause]` markers inside them. Display lines (from
 * parseScript) have stage-directions, pauses, body, and scripture — in the
 * same spoken order but with different pause representation.
 *
 * Strategy: match spoken lines sequentially. For each display line:
 * - spoken lines (body/scripture) → map to the corresponding alignment spoken
 *   line's timestamp range, extended backward to include preceding pauses
 * - stage-direction (weight=0) → gets a zero-width boundary at the start of
 *   the next spoken line
 * - pause → gets the gap between the previous and next spoken lines
 */
function buildAlignmentBoundaries(
  lines: ParsedLine[],
  alignment: AlignmentData,
): number[] {
  const { timestamps, lines: alignLines } = alignment

  // Identify which alignment lines are "spoken" (not pure pause markers)
  const isPause = (text: string) => /^\[.*pause.*\]$/i.test(text.trim())
  const spokenAlignIndices: number[] = []
  for (let i = 0; i < alignLines.length; i++) {
    if (!isPause(alignLines[i])) {
      spokenAlignIndices.push(i)
    }
  }

  // For each spoken alignment line, compute the time range including
  // preceding pauses (so the spoken line "owns" the silence before it).
  const spokenRanges: Array<{ start: number; end: number }> = []
  for (let si = 0; si < spokenAlignIndices.length; si++) {
    const alignIdx = spokenAlignIndices[si]
    const prevAlignIdx = si > 0 ? spokenAlignIndices[si - 1] : -1

    // Start = end of previous spoken line (or 0 for the first one)
    const start = prevAlignIdx >= 0 ? timestamps[prevAlignIdx].end : 0
    const end = timestamps[alignIdx].end
    spokenRanges.push({ start, end })
  }

  // Map display lines to spoken ranges sequentially
  let spokenIdx = 0
  const boundaries: number[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.type === 'body' || line.type === 'scripture') {
      if (spokenIdx < spokenRanges.length) {
        boundaries.push(spokenRanges[spokenIdx].end)
        spokenIdx++
      } else {
        // Shouldn't happen, but fallback to end
        boundaries.push(alignment.duration)
      }
    } else if (line.type === 'stage-direction') {
      // Stage direction gets boundary at the start of the next spoken line
      if (spokenIdx < spokenRanges.length) {
        boundaries.push(spokenRanges[spokenIdx].start)
      } else {
        boundaries.push(alignment.duration)
      }
    } else if (line.type === 'pause') {
      // Pause: assign the gap between previous spoken end and next spoken start.
      // Since spoken ranges already include preceding pauses, give pause lines
      // a boundary at the start of the next spoken range.
      if (spokenIdx < spokenRanges.length) {
        boundaries.push(spokenRanges[spokenIdx].start)
      } else {
        boundaries.push(alignment.duration)
      }
    }
  }

  return boundaries
}

export function MeditationPlayer({ meditation, backHref }: MeditationPlayerProps) {
  const { locale } = useLocale()
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const textRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeLineIndex, setActiveLineIndex] = useState(-1)
  const [activeVoice, setActiveVoice] = useState<'v1' | 'v2'>(() => {
    if (typeof window === 'undefined') return 'v1'
    return localStorage.getItem('vesper-voice') === 'alt' ? 'v2' : 'v1'
  })
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [musicOn, setMusicOn] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('vesper-music') !== 'off'
  })
  const [musicVolume, setMusicVolume] = useState(() => {
    if (typeof window === 'undefined') return 0.015
    const stored = localStorage.getItem('vesper-music-volume')
    return stored ? parseFloat(stored) : 0.015
  })

  // Random track each session — no stored preference
  const [ambientTrackUrl] = useState(() => {
    const track = musicTracks[Math.floor(Math.random() * musicTracks.length)]
    return `${BASE}${track.file}`
  })

  const isMusic = meditation.category === 'music' && !meditation.scriptEn

  // Crossfade loop for ambient background music (non-music meditations)
  const ambient = useCrossfadeLoop(!isMusic ? ambientTrackUrl : null)

  const title = locale === 'fr' ? meditation.titleFr : meditation.titleEn
  const desc = locale === 'fr' ? meditation.descFr : meditation.descEn
  const script = locale === 'fr' ? meditation.scriptFr : meditation.scriptEn
  const baseAudioPath = locale === 'fr' ? meditation.audioPathFr : meditation.audioPathEn

  // Available duration variants from segmentation
  const langKey = locale === 'fr' ? 'fr' : 'en'
  const availableDurations = meditation.segments?.[langKey]?.durations ?? []

  // Build audio path: if a duration variant is selected, use the assembled file
  const resolvedAudioPath = useMemo(() => {
    if (!baseAudioPath) return null

    if (selectedDuration && availableDurations.includes(selectedDuration)) {
      // Assembled variant: /audio/en/segments/{slug}/assembled/{duration}min.mp3
      const langDir = locale === 'fr' ? 'fr' : 'en'
      return `/audio/${langDir}/segments/${meditation.slug}/assembled/${selectedDuration}min.mp3`
    }

    return baseAudioPath
  }, [baseAudioPath, selectedDuration, availableDurations, locale, meditation.slug])

  // Don't apply v2 voice replacement to assembled duration variants
  // (they only exist in the base voice directory)
  const isDurationVariant = selectedDuration !== null
  const audioPath = resolvedAudioPath
    ? isMusic
      ? `${BASE}${resolvedAudioPath}`
      : `${BASE}${activeVoice === 'v2' && !isDurationVariant
        ? resolvedAudioPath.replace('/audio/en/', '/audio/en-v2/').replace('/audio/fr/', '/audio/fr-v2/')
        : resolvedAudioPath}`
    : null

  const [hasV2, setHasV2] = useState(false)
  useEffect(() => {
    if (!baseAudioPath) return
    const v2Path = `${BASE}${baseAudioPath.replace('/audio/en/', '/audio/en-v2/').replace('/audio/fr/', '/audio/fr-v2/')}`
    fetch(v2Path, { method: 'HEAD' })
      .then(r => setHasV2(r.ok))
      .catch(() => setHasV2(false))
  }, [baseAudioPath])

  const [alignment, setAlignment] = useState<AlignmentData | null>(null)
  useEffect(function fetchAlignment() {
    if (!audioPath || isMusic) {
      setAlignment(null)
      return
    }
    const jsonPath = audioPath.replace(/\.mp3$/, '.json')
    fetch(jsonPath)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.json() as Promise<AlignmentData>
      })
      .then(data => {
        if (data.timestamps && data.lines && data.duration) {
          setAlignment(data)
        }
      })
      .catch(() => setAlignment(null))
  }, [audioPath])

  const handleVoiceChange = useCallback((voice: 'v1' | 'v2') => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setActiveLineIndex(-1)
    setActiveVoice(voice)
    localStorage.setItem('vesper-voice', voice === 'v2' ? 'alt' : 'default')
  }, [])

  const handleDurationChange = useCallback((dur: number | null) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setActiveLineIndex(-1)
    setAlignment(null)
    setSelectedDuration(dur)
    ambient.pause()
  }, [])

  const allLines = parseScript(script)

  // For duration variants, trim display lines to match the assembled alignment.
  // The assembled alignment has fewer spoken lines than the full script.
  const lines = useMemo(() => {
    if (!isDurationVariant || !alignment) return allLines

    // Count spoken lines in the alignment (non-pause lines)
    const isPause = (text: string) => /^\[.*pause.*\]$/i.test(text.trim())
    const alignSpokenCount = alignment.lines.filter(l => !isPause(l)).length

    // Walk through display lines, counting spoken ones (body/scripture)
    let spokenSeen = 0
    let cutIndex = allLines.length
    for (let i = 0; i < allLines.length; i++) {
      if (allLines[i].type === 'body' || allLines[i].type === 'scripture') {
        spokenSeen++
        if (spokenSeen > alignSpokenCount) {
          cutIndex = i
          break
        }
      }
    }

    return allLines.slice(0, cutIndex)
  }, [allLines, alignment, isDurationVariant])

  const totalWeight = lines.reduce((sum, l) => sum + l.weight, 0)

  const lineBoundaries = useMemo(() => {
    // Use real alignment timestamps when available
    if (alignment) {
      return buildAlignmentBoundaries(lines, alignment)
    }
    // Fallback: weight-based estimation
    return lines.reduce<number[]>((acc, line) => {
      const prev = acc.length > 0 ? acc[acc.length - 1] : 0
      acc.push(prev + (duration > 0 ? (line.weight / totalWeight) * duration : 0))
      return acc
    }, [])
  }, [alignment, lines, duration, totalWeight])

  // Map from line index to rendered DOM child index (pauses render null)
  const domIndexMap = useMemo(() => {
    const map = new Map<number, number>()
    let domIdx = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].type !== 'pause') {
        map.set(i, domIdx)
        domIdx++
      }
    }
    return map
  }, [lines])

  // For music sessions: the playable zone between fade-in and fade-out
  const musicZone = useMemo(() => {
    if (!isMusic || duration <= 120) return null
    const fadeIn = 95 // skip past 90s ISO fade-in
    const fadeOutStart = duration - 35 // 30s fade-out + 5s buffer
    return { start: fadeIn, end: fadeOutStart, length: fadeOutStart - fadeIn }
  }, [isMusic, duration])

  const handleTimeUpdateWithScroll = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const time = audio.currentTime

    // Music seamless loop: jump past fade-in before the fade-out starts
    if (musicZone && time >= musicZone.end) {
      audio.currentTime = musicZone.start
      return
    }

    setCurrentTime(time)

    if (isMusic) return // no script lines to track

    let idx = lineBoundaries.findIndex((boundary) => time < boundary)
    let newIndex = idx === -1 ? lines.length - 1 : idx

    // Skip past pause lines (not rendered) to the next visible line
    while (newIndex < lines.length && lines[newIndex].type === 'pause') {
      newIndex++
    }
    if (newIndex >= lines.length) newIndex = lines.length - 1

    setActiveLineIndex(newIndex)

    if (newIndex >= 0 && textRef.current) {
      const domIdx = domIndexMap.get(newIndex)
      if (domIdx !== undefined) {
        const lineEl = textRef.current.children[domIdx] as HTMLElement
        if (lineEl) lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [duration, isMusic, musicZone, lineBoundaries, lines, domIndexMap])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioPath) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: 'Vesper',
      album: meditation.category,
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
      if (musicOn) ambient.play()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      ambient.pause()
    })
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15)
    })
    navigator.mediaSession.setActionHandler('seekforward', () => {
      if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 15)
    })
  }, [title, meditation.category, audioPath, musicOn])

  useEffect(() => {
    ambient.setVolume(musicVolume)
  }, [musicVolume])

  const toggleMusic = useCallback(() => {
    const next = !musicOn
    setMusicOn(next)
    localStorage.setItem('vesper-music', next ? 'on' : 'off')
    
    if (next && isPlaying) {
      ambient.play()
    } else {
      ambient.pause()
    }
  }, [musicOn, isPlaying])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setMusicVolume(vol)
    localStorage.setItem('vesper-music-volume', String(vol))
    ambient.setVolume(vol)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      ambient.pause()
    } else {
      audio.play().catch(() => {})
      if (musicOn) {
        ambient.play()
      }
    }
  }, [isPlaying, musicOn])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration)
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let time = parseFloat(e.target.value)
    // For music mode, clamp seeks within the playable zone
    if (musicZone) {
      time = Math.max(musicZone.start, Math.min(time, musicZone.end - 1))
    }
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [musicZone])

  const handleLineClick = useCallback((lineIndex: number) => {
    if (!audioRef.current || !lineBoundaries.length) return

    // Seek to the start of this line's time boundary
    // The boundary at index i is the END time of line i
    // So the START time of line i = boundary of line i-1 (or 0 for first line)
    const startTime = lineIndex > 0 ? lineBoundaries[lineIndex - 1] : 0

    audioRef.current.currentTime = startTime
    setCurrentTime(startTime)
    setActiveLineIndex(lineIndex)

    // Auto-play if not already playing
    if (!isPlaying) {
      audioRef.current.play().catch(() => {})
      if (musicOn) ambient.play()
    }
  }, [lineBoundaries, isPlaying, musicOn])

  // For music mode, show progress within the loopable zone only
  const displayTime = musicZone
    ? Math.max(0, currentTime - musicZone.start)
    : currentTime
  const displayDuration = musicZone ? musicZone.length : duration
  const progress = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0

  return (
    <motion.main
      className="mx-auto flex min-h-screen max-w-2xl flex-col bg-[var(--bg)] px-6 pt-12 pb-8 text-[var(--text)]"
      suppressHydrationWarning
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
    >
      {audioPath && (
        <audio
          ref={audioRef}
          src={audioPath}
          preload="metadata"
          loop={isMusic}
          onTimeUpdate={handleTimeUpdateWithScroll}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (!isMusic) {
              setIsPlaying(false)
              setActiveLineIndex(-1)
              ambient.pause()
            }
          }}
        />
      )}

      <header className="mb-6 flex items-center justify-end">
        <span className="tabular-nums text-xs text-[var(--muted)]">
          {selectedDuration ?? meditation.durationMin} min
        </span>
      </header>

      <div className="mb-6 px-4">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
          {title}
        </h1>
        {(desc || '').split('\n\n').map((paragraph, i) => (
          <p key={i} className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {paragraph}
          </p>
        ))}

        {meditation.scienceUrl && (
          <a
            href={meditation.scienceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-[var(--accent)] hover:underline"
          >
            {locale === 'fr' ? 'Recherche' : 'Research'}
          </a>
        )}
      </div>

      {!isMusic && (
        <div className="mb-5 flex justify-center gap-2">
          {baseAudioPath && (hasV2 || activeVoice === 'v1') && (
            <select
              value={activeVoice}
              onChange={(e) => handleVoiceChange(e.target.value as 'v1' | 'v2')}
              className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none transition-colors"
              style={{ appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '24px' }}
            >
              <option value="v1">{locale === 'fr' ? VOICES.v1.nameFr : VOICES.v1.nameEn}</option>
              {hasV2 && <option value="v2">{locale === 'fr' ? VOICES.v2.nameFr : VOICES.v2.nameEn}</option>}
            </select>
          )}
          {availableDurations.length > 0 && (
            <select
              value={selectedDuration ?? ''}
              onChange={(e) => handleDurationChange(e.target.value === '' ? null : parseInt(e.target.value))}
              className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none transition-colors"
              style={{ appearance: 'none', WebkitAppearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: '24px' }}
            >
              <option value="">{locale === 'fr' ? 'Complet' : 'Full'}</option>
              {availableDurations.map(dur => (
                <option key={dur} value={dur}>{dur} min</option>
              ))}
            </select>
          )}
        </div>
      )}

      {audioPath ? (
        <div className="mb-8 flex flex-col items-center gap-4">
          {/* Play button — ripple emission for music only */}
          <div className="relative flex items-center justify-center" style={{ overflow: 'visible' }}>
            {isMusic && <RelaxAnimation playing={isPlaying} />}
            <motion.button
              onClick={togglePlay}
              className="relative z-20 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
            {isPlaying ? (
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="var(--bg)" stroke="none">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="var(--bg)" stroke="none">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>
          </div>

          <div className="flex w-full max-w-sm items-center gap-3">
            <span className="w-10 text-right tabular-nums text-xs text-[var(--muted)]">
              {formatTime(displayTime)}
            </span>
            <input
              type="range"
              min={musicZone ? musicZone.start : 0}
              max={musicZone ? musicZone.end : (duration || 0)}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="vesper-seek flex-1"
              style={{ '--seek-progress': `${progress}%` } as React.CSSProperties}
              aria-label="Seek"
            />
            <span className="w-10 tabular-nums text-xs text-[var(--muted)]">
              {formatTime(displayDuration)}
            </span>
          </div>

          {/* Music control — hidden for music-only sessions */}
          {!isMusic && <div className="flex items-center justify-center gap-2.5">
            <button
              onClick={toggleMusic}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors"
              style={{
                backgroundColor: musicOn ? `color-mix(in srgb, var(--accent) 12%, transparent)` : 'transparent',
                color: musicOn ? 'var(--accent)' : 'var(--muted)',
              }}
              aria-label={musicOn ? 'Disable background music' : 'Enable background music'}
            >
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </button>

            <input
              type="range"
              min={0}
              max={0.1}
              step={0.005}
              value={musicOn ? musicVolume : 0}
              onChange={handleVolumeChange}
              disabled={!musicOn}
              className="vesper-range w-20 transition-opacity"
              style={{ opacity: musicOn ? 1 : 0.25 }}
              aria-label="Music volume"
            />

          </div>}
        </div>
      ) : (
        <p className="mb-8 text-center text-sm text-[var(--muted)]">
          {locale === 'fr' ? 'Audio bientôt disponible' : 'Audio coming soon'}
        </p>
      )}

      <div className="flex-1" />
    </motion.main>
  )
}
