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
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
          </svg>
        ) : state === 'generating' ? (
          <svg className="animate-pulse" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8.5 2a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-1 0v-11a.5.5 0 0 1 .5-.5m-2 2a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5m-6 1.5A.5.5 0 0 1 5 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m8 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m-10 1A.5.5 0 0 1 3 7v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5m12 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5"/>
          </svg>
        ) : isActive ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/>
            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/>
            <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475z"/>
            <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06"/>
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
