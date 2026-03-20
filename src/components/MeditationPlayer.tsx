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

  const audioPath = resolvedAudioPath
    ? isMusic
      ? `${BASE}${resolvedAudioPath}`
      : `${BASE}${activeVoice === 'v2'
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
  useEffect(() => {
    if (!audioPath) {
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

  const lines = parseScript(script)
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

  // For music mode, show progress within the loopable zone only
  const displayTime = musicZone
    ? Math.max(0, currentTime - musicZone.start)
    : currentTime
  const displayDuration = musicZone ? musicZone.length : duration
  const progress = displayDuration > 0 ? (displayTime / displayDuration) * 100 : 0

  return (
    <motion.main
      className="flex min-h-screen flex-col bg-[var(--bg)] px-6 pt-12 pb-8 text-[var(--text)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
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

      <header className="mb-6 flex items-center justify-between">
        <a
          href={backHref}
          className="flex items-center gap-1 text-sm text-[var(--muted)] transition-colors"
          aria-label={locale === 'fr' ? 'Retour' : 'Back'}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          {locale === 'fr' ? 'Retour' : 'Back'}
        </a>
        <span className="tabular-nums text-xs text-[var(--muted)]">
          {selectedDuration ?? meditation.durationMin} min
        </span>
      </header>

      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
          {desc}
        </p>
        {meditation.scienceUrl && (
          <a
            href={meditation.scienceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
          >
            <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {locale === 'fr' ? 'Voir la recherche' : 'View research'}
          </a>
        )}
      </div>

      {!isMusic && baseAudioPath && (hasV2 || activeVoice === 'v1') && (
        <div className="mb-5 flex justify-center">
          <div className="inline-flex rounded-lg bg-[var(--surface)] p-0.5">
            <button
              onClick={() => handleVoiceChange('v1')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                activeVoice === 'v1'
                  ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted)]'
              }`}
            >
              {locale === 'fr' ? VOICES.v1.nameFr : VOICES.v1.nameEn}
            </button>
            <button
              onClick={() => handleVoiceChange('v2')}
              disabled={!hasV2}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition-colors ${
                activeVoice === 'v2'
                  ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm'
                  : hasV2
                    ? 'text-[var(--muted)]'
                    : 'text-[var(--border)] opacity-50 cursor-default'
              }`}
            >
              {locale === 'fr' ? VOICES.v2.nameFr : VOICES.v2.nameEn}
            </button>
          </div>
        </div>
      )}

      {!isMusic && availableDurations.length > 0 && (
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg bg-[var(--surface)] p-0.5">
            <button
              onClick={() => handleDurationChange(null)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedDuration === null
                  ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm'
                  : 'text-[var(--muted)]'
              }`}
            >
              {locale === 'fr' ? 'Complet' : 'Full'}
            </button>
            {availableDurations.map(dur => (
              <button
                key={dur}
                onClick={() => handleDurationChange(dur)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedDuration === dur
                    ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm'
                    : 'text-[var(--muted)]'
                }`}
              >
                {dur} min
              </button>
            ))}
          </div>
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
            <div className="relative flex-1">
              <div className="h-1 rounded-full bg-[var(--border)]" />
              <div
                className="absolute top-0 left-0 h-1 rounded-full bg-[var(--accent)] transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
              <input
                type="range"
                min={musicZone ? musicZone.start : 0}
                max={musicZone ? musicZone.end : (duration || 0)}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="absolute top-0 left-0 h-1 w-full cursor-pointer opacity-0"
                aria-label="Seek"
              />
            </div>
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

      {isMusic ? (
        <div className="flex-1" />
      ) : (
        <div
          ref={textRef}
          className="mx-auto max-w-prose flex-1 space-y-5 overflow-y-auto"
          style={{ maxHeight: 'calc(100dvh - 320px)' }}
        >
          {lines.map((line, i) => {
            if (line.type === 'pause') return null

            const isActive = i === activeLineIndex
            const isPast = i < activeLineIndex
            const opacity = activeLineIndex < 0 ? 1 : isActive ? 1 : isPast ? 0.3 : 0.15

            if (line.type === 'stage-direction') {
              return (
                <p key={i} className="text-xs italic leading-relaxed text-[var(--muted)] transition-opacity duration-500" style={{ opacity }}>
                  {line.text}
                </p>
              )
            }

            if (line.type === 'scripture') {
              return (
                <p key={i} className="font-[family-name:var(--font-serif)] text-xl leading-[1.8] text-[var(--accent)] transition-opacity duration-500" style={{ opacity }}>
                  {line.text}
                </p>
              )
            }

            return (
              <p key={i} className="leading-[1.8] text-[var(--text)] transition-opacity duration-500" style={{ opacity }}>
                {line.text}
              </p>
            )
          })}
        </div>
      )}
    </motion.main>
  )
}
