import { useLocale } from '@/hooks/useLocale'
import { BreathingCircle } from '@/components/BreathingCircle'
import type { BreathingPatternData } from '@/types'
import { BASE } from '@/lib/constants'

interface BreatheExerciseClientProps {
  pattern: BreathingPatternData
}

export function BreatheExerciseClient({ pattern }: BreatheExerciseClientProps) {
  const { locale } = useLocale()
  const name = locale === 'fr' ? pattern.nameFr : pattern.nameEn

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <a
        href={`${BASE}/breathe`}
        className="absolute left-6 top-12 text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </a>

      <h1 className="mb-10 font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
        {name}
      </h1>

      <BreathingCircle
        inhale={pattern.inhale}
        holdIn={pattern.holdIn}
        exhale={pattern.exhale}
        holdOut={pattern.holdOut}
        rounds={pattern.rounds}
      />
    </main>
  )
}
