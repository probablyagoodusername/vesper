import { useLocale } from '@/hooks/useLocale'
import { BreathingCircle } from '@/components/BreathingCircle'
import type { BreathingPatternData } from '@/types'

interface BreatheExerciseClientProps {
  pattern: BreathingPatternData
}

export function BreatheExerciseClient({ pattern }: BreatheExerciseClientProps) {
  const { locale } = useLocale()
  const name = locale === 'fr' ? pattern.nameFr : pattern.nameEn

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
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
