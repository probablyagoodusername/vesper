import { useRef, useCallback, useEffect } from 'react'

const CROSSFADE_DURATION = 8 // seconds before end to start crossfade
const FADE_STEPS = 40 // smoothness of volume ramp
const FADE_INTERVAL = (CROSSFADE_DURATION * 1000) / FADE_STEPS

/**
 * Manages seamless looping of an audio track using two <audio> elements
 * that crossfade near the end. Eliminates the audible gap from baked-in
 * fade-in/fade-out on the MP3.
 *
 * Usage:
 *   const { play, pause, stop, setVolume, isPlaying } = useCrossfadeLoop(src)
 */
export function useCrossfadeLoop(src: string | null) {
  const audioA = useRef<HTMLAudioElement | null>(null)
  const audioB = useRef<HTMLAudioElement | null>(null)
  const activeRef = useRef<'a' | 'b'>('a')
  const volumeRef = useRef(0.015)
  const playingRef = useRef(false)
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Create audio elements on mount
  useEffect(() => {
    audioA.current = new Audio()
    audioB.current = new Audio()
    audioA.current.preload = 'auto'
    audioB.current.preload = 'auto'

    return () => {
      audioA.current?.pause()
      audioB.current?.pause()
      audioA.current = null
      audioB.current = null
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)
    }
  }, [])

  // Update src on both elements
  useEffect(() => {
    if (!src) return
    if (audioA.current) audioA.current.src = src
    if (audioB.current) audioB.current.src = src
  }, [src])

  const getActive = useCallback(() => {
    return activeRef.current === 'a' ? audioA.current : audioB.current
  }, [])

  const getInactive = useCallback(() => {
    return activeRef.current === 'a' ? audioB.current : audioA.current
  }, [])

  const startCrossfadeCheck = useCallback(() => {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)

    const check = () => {
      const active = getActive()
      if (!active || !playingRef.current) return

      const timeLeft = active.duration - active.currentTime
      if (timeLeft <= CROSSFADE_DURATION && timeLeft > 0 && active.duration > CROSSFADE_DURATION * 2) {
        // Start crossfade
        const inactive = getInactive()
        if (!inactive) return

        inactive.currentTime = 0
        inactive.volume = 0
        inactive.play().catch((e) => console.warn('[ambient]', e.message))

        let step = 0
        const fadeInterval = setInterval(() => {
          step++
          const progress = step / FADE_STEPS
          const fadeOut = Math.cos(progress * Math.PI * 0.5) // cosine curve for natural fade
          const fadeIn = Math.sin(progress * Math.PI * 0.5)

          if (active) active.volume = fadeOut * volumeRef.current
          if (inactive) inactive.volume = fadeIn * volumeRef.current

          if (step >= FADE_STEPS) {
            clearInterval(fadeInterval)
            active.pause()
            active.currentTime = 0
            activeRef.current = activeRef.current === 'a' ? 'b' : 'a'
            startCrossfadeCheck() // set up next crossfade
          }
        }, FADE_INTERVAL)
      }
    }

    fadeTimerRef.current = setInterval(check, 500)
  }, [getActive, getInactive])

  const play = useCallback(() => {
    const active = getActive()
    if (!active || !src) {
      console.warn('[ambient] play() skipped: no active element or src', { active: !!active, src })
      return
    }
    console.info('[ambient] play()', { src: src.slice(-40), readyState: active.readyState, vol: volumeRef.current })
    active.volume = volumeRef.current
    active.currentTime = 0
    active.play().catch((e) => console.warn('[ambient] play failed:', e.message))
    playingRef.current = true
    startCrossfadeCheck()
  }, [src, getActive, startCrossfadeCheck])

  const pause = useCallback(() => {
    getActive()?.pause()
    getInactive()?.pause()
    playingRef.current = false
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)
  }, [getActive, getInactive])

  const stop = useCallback(() => {
    pause()
    if (audioA.current) audioA.current.currentTime = 0
    if (audioB.current) audioB.current.currentTime = 0
  }, [pause])

  const setVolume = useCallback((vol: number) => {
    volumeRef.current = vol
    const active = getActive()
    if (active && playingRef.current) active.volume = vol
  }, [getActive])

  const getTime = useCallback(() => {
    const active = getActive()
    return active ? { currentTime: active.currentTime, duration: active.duration || 0 } : { currentTime: 0, duration: 0 }
  }, [getActive])

  return { play, pause, stop, setVolume, getTime }
}
