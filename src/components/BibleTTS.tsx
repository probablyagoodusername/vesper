import { useState, useCallback, useEffect, useRef } from 'react'
import type { Locale } from '@/lib/i18n'

interface BibleTTSProps {
  verses: { verse: number; textEn: string; textFr: string }[]
  locale: Locale
  autoPlay?: boolean
  onComplete?: () => void
  onStop?: () => void
  onChunkChange?: (startVerse: number, endVerse: number) => void
  chapterLabel?: string
}

type TTSState = 'idle' | 'loading-model' | 'generating' | 'playing' | 'error'

// Singleton — model loaded once, persists across navigations
let kokoroInstance: unknown = null
let kokoroLoading = false
let kokoroFailed = false

const TTS_SPEED = 0.85

export function BibleTTS({ verses, locale, autoPlay, onComplete, onStop, onChunkChange, chapterLabel }: BibleTTSProps) {
  const [state, setState] = useState<TTSState>('idle')
  const [progress, setProgress] = useState('')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const abortRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    return () => {
      abortRef.current = true
      sourceRef.current?.stop()
    }
  }, [])

  // Stop on verse change
  const prevVersesRef = useRef(verses)
  useEffect(() => {
    if (prevVersesRef.current !== verses) {
      abortRef.current = true
      sourceRef.current?.stop()
      setState('idle')
      onChunkChange?.(-1, -1)
      prevVersesRef.current = verses
    }
  }, [verses, onChunkChange])

  // Auto-play support
  useEffect(() => {
    if (autoPlay && state === 'idle' && verses.length > 0) {
      play()
    }
  }, [autoPlay, verses])

  const stop = useCallback(() => {
    abortRef.current = true
    sourceRef.current?.stop()
    setState('idle')
    onChunkChange?.(-1, -1)
    onStop?.()
  }, [onStop, onChunkChange])

  const play = useCallback(async () => {
    if (state === 'playing' || state === 'generating') {
      stop()
      return
    }

    abortRef.current = false

    // Mobile: use native SpeechSynthesis (Kokoro's 82MB model is too heavy)
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile || kokoroFailed) {
      playWithSpeechSynthesis()
      return
    }

    try {
      // Desktop: load Kokoro model (singleton — downloads once, browser caches)
      if (!kokoroInstance && !kokoroLoading) {
        kokoroLoading = true
        setState('loading-model')
        setProgress(locale === 'fr' ? 'Téléchargement du modèle vocal...' : 'Downloading voice model...')

        const { KokoroTTS } = await import('kokoro-js')
        kokoroInstance = await KokoroTTS.from_pretrained(
          'onnx-community/Kokoro-82M-ONNX',
          { dtype: 'q8' }
        )
        kokoroLoading = false
      } else if (kokoroLoading) {
        // Another instance is loading — wait
        setState('loading-model')
        setProgress(locale === 'fr' ? 'Modèle en cours de chargement...' : 'Model loading...')
        while (kokoroLoading) {
          await new Promise(r => setTimeout(r, 200))
        }
        if (!kokoroInstance) {
          throw new Error('Model failed to load')
        }
      }

      if (abortRef.current) return

      const tts = kokoroInstance as {
        generate: (text: string, options: { voice: string; speed?: number }) => Promise<{ toBlob: () => Blob }>
      }

      // Chunk verses into segments (~500 chars each), tracking verse ranges per chunk
      const chunks: string[] = []
      const chunkVerseRanges: Array<[number, number]> = [] // [startVerseIdx, endVerseIdx]
      let current = ''
      let chunkStartIdx = 0
      for (let vi = 0; vi < verses.length; vi++) {
        const text = locale === 'fr' ? verses[vi].textFr : verses[vi].textEn
        if (current.length + text.length > 500 && current.length > 0) {
          chunks.push(current.trim())
          chunkVerseRanges.push([chunkStartIdx, vi - 1])
          current = ''
          chunkStartIdx = vi
        }
        current += text + ' '
      }
      if (current.trim()) {
        chunks.push(current.trim())
        chunkVerseRanges.push([chunkStartIdx, verses.length - 1])
      }

      const voice = locale === 'fr' ? 'ff_siwis' : 'af_sky'

      // Generate + play each chunk sequentially
      for (let i = 0; i < chunks.length; i++) {
        if (abortRef.current) return

        setState('generating')
        setProgress(`${i + 1}/${chunks.length}`)

        const result = await tts.generate(chunks[i], { voice, speed: TTS_SPEED })
        if (abortRef.current) return

        const blob = result.toBlob()
        const arrayBuffer = await blob.arrayBuffer()

        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContext()
        }

        const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer)
        const source = audioCtxRef.current.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioCtxRef.current.destination)
        sourceRef.current = source

        setState('playing')
        const [startIdx, endIdx] = chunkVerseRanges[i]
        onChunkChange?.(startIdx, endIdx)

        await new Promise<void>((resolve) => {
          source.onended = () => resolve()
          source.start()
        })
      }

      onChunkChange?.(-1, -1)
      setState('idle')
      onCompleteRef.current?.()
    } catch {
      kokoroFailed = true
      kokoroLoading = false
      // Fall back to SpeechSynthesis
      playWithSpeechSynthesis()
    }
  }, [state, verses, locale, stop])

  const playWithSpeechSynthesis = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth) {
      setState('error')
      setProgress(locale === 'fr' ? 'TTS non disponible' : 'TTS not available')
      setTimeout(() => setState('idle'), 3000)
      return
    }

    // Read verse by verse for better pacing and to avoid the ~15s cutoff on some browsers
    const verseTexts = verses.map(v => locale === 'fr' ? v.textFr : v.textEn)
    let currentVerse = 0

    function speakNext() {
      if (currentVerse >= verseTexts.length || abortRef.current) {
        setState('idle')
        if (!abortRef.current) onCompleteRef.current?.()
        return
      }

      const utterance = new SpeechSynthesisUtterance(verseTexts[currentVerse])
      utterance.lang = locale === 'fr' ? 'fr-FR' : 'en-US'
      utterance.rate = 0.85
      utterance.pitch = 1.0

      // Highlight current verse range
      onChunkChange?.(currentVerse, currentVerse)

      utterance.addEventListener('end', () => {
        currentVerse++
        speakNext()
      })
      utterance.addEventListener('error', () => {
        currentVerse++
        speakNext()
      })

      synth.speak(utterance)
    }

    setState('playing')
    setProgress(locale === 'fr' ? 'Lecture...' : 'Reading...')
    speakNext()
  }, [verses, locale, onChunkChange])

  const isActive = state !== 'idle' && state !== 'error'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isActive ? stop : play}
        disabled={state === 'loading-model'}
        className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
        style={{ color: isActive ? 'var(--accent)' : 'var(--muted)' }}
        aria-label={isActive ? 'Stop' : 'Listen'}
      >
        {state === 'loading-model' ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
          </svg>
        ) : state === 'generating' ? (
          <svg className="animate-pulse" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="2" y="6" width="4" height="12" rx="1" />
            <rect x="10" y="4" width="4" height="16" rx="1" />
            <rect x="18" y="8" width="4" height="8" rx="1" />
          </svg>
        ) : isActive ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18l-7-6H2a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3l7-6z" />
            <path d="M16.5 7.5a5 5 0 0 1 0 9" />
          </svg>
        )}
        {state === 'loading-model'
          ? progress
          : state === 'generating'
            ? `${locale === 'fr' ? 'Génération' : 'Generating'} ${progress}`
            : state === 'playing'
              ? (locale === 'fr' ? 'Arrêter' : 'Stop')
              : state === 'error'
                ? progress
                : (locale === 'fr' ? 'Écouter' : 'Listen')}
      </button>
      {chapterLabel && isActive && (
        <span className="text-xs text-[var(--muted)]">{chapterLabel}</span>
      )}
    </div>
  )
}
