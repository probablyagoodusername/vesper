import { useState, useCallback, useRef, useMemo } from 'react'
import type { BreathingPhase } from '@/lib/constants'
import { useLocale } from '@/hooks/useLocale'

interface BreathingCircleProps {
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  rounds: number
  onComplete?: () => void
}

export function BreathingCircle({
  inhale,
  holdIn,
  exhale,
  holdOut,
  rounds,
  onComplete,
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<BreathingPhase | 'idle'>('idle')
  const [currentRound, setCurrentRound] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { t } = useLocale()

  const phases = useMemo(() => [
    { type: 'inhale' as const, duration: inhale },
    ...(holdIn > 0 ? [{ type: 'holdIn' as const, duration: holdIn }] : []),
    { type: 'exhale' as const, duration: exhale },
    ...(holdOut > 0 ? [{ type: 'holdOut' as const, duration: holdOut }] : []),
  ], [inhale, holdIn, exhale, holdOut])

  const phaseLabels: Record<BreathingPhase, string> = {
    inhale: t.breathe.inhale,
    holdIn: t.breathe.holdIn,
    exhale: t.breathe.exhale,
    holdOut: t.breathe.holdOut,
  }

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startPhase = useCallback((phaseType: BreathingPhase) => {
    clearTimer()
    const phaseDef = phases.find((p) => p.type === phaseType)
    if (!phaseDef) return

    setPhase(phaseType)
    setTimeLeft(phaseDef.duration)

    let remaining = phaseDef.duration

    timerRef.current = setInterval(() => {
      remaining--
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearTimer()
        const currentIndex = phases.findIndex((p) => p.type === phaseType)
        const nextIndex = currentIndex + 1

        if (nextIndex >= phases.length) {
          setCurrentRound((r) => {
            const nextRound = r + 1
            if (nextRound >= rounds) {
              setIsRunning(false)
              setPhase('idle')
              onComplete?.()
              return 0
            }
            setTimeout(() => startPhase(phases[0].type), 0)
            return nextRound
          })
        } else {
          startPhase(phases[nextIndex].type)
        }
      }
    }, 1000)
  }, [phases, rounds, onComplete, clearTimer]) // eslint-disable-line react-hooks/exhaustive-deps

  function start() {
    setIsRunning(true)
    setCurrentRound(0)
    startPhase(phases[0].type)
  }

  function pause() {
    setIsRunning(false)
    clearTimer()
    setPhase('idle')
  }

  const scale = phase === 'inhale' || phase === 'holdIn' ? 1 : phase === 'exhale' || phase === 'holdOut' ? 0.6 : 0.8
  const transitionDuration = phase === 'inhale' ? inhale : phase === 'exhale' ? exhale : 0.3

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative flex h-64 w-64 items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
            opacity: phase === 'idle' ? 0.3 : 0.5,
          }}
        />
        {/* Main circle */}
        <div
          className="absolute inset-4 rounded-full bg-[var(--accent)]/10"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
        {/* Inner circle */}
        <div
          className="absolute inset-12 rounded-full bg-[var(--accent)]/20"
          style={{
            transform: `scale(${scale})`,
            transition: `transform ${transitionDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />

        {/* Center text */}
        <div className="relative z-10 text-center">
          {phase !== 'idle' ? (
            <>
              <p className="text-2xl font-[family-name:var(--font-serif)] font-semibold text-[var(--primary)]">
                {phaseLabels[phase]}
              </p>
              <p className="tabular-nums text-4xl font-light text-[var(--accent)]">
                {timeLeft}
              </p>
            </>
          ) : (
            <p className="text-lg text-[var(--muted)]">
              {rounds} {t.breathe.rounds}
            </p>
          )}
        </div>
      </div>

      {/* Round indicator */}
      {isRunning && (
        <div className="flex gap-1.5">
          {Array.from({ length: rounds }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= currentRound ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <button
        onClick={isRunning ? pause : start}
        className="rounded-full bg-[var(--primary)] px-8 py-3 font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
      >
        {isRunning ? t.breathe.pause : t.breathe.start}
      </button>
    </div>
  )
}
