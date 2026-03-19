import { useLocale } from '@/hooks/useLocale'
import { PageTransition, StaggerList, StaggerItem } from '@/components/Motion'
import { MeditationCard } from '@/components/MeditationCard'
import type { MeditationData } from '@/types'

interface SleepClientProps {
  meditations: MeditationData[]
}

export function SleepClient({ meditations }: SleepClientProps) {
  const { locale, t } = useLocale()

  return (
    <PageTransition>
      <main className="min-h-screen px-6 pt-12 pb-8">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]">
            {t.sleep.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t.sleep.subtitle}
          </p>
        </header>

        {meditations.length === 0 && (
          <p className="py-16 text-center text-[var(--muted)]">
            {locale === 'fr' ? 'Aucune méditation disponible' : 'No sleep meditations available yet'}
          </p>
        )}

        <StaggerList className="space-y-3" role="list">
          {meditations.map((m) => (
            <StaggerItem key={m.slug} role="listitem">
              <MeditationCard
                slug={m.slug}
                titleEn={m.titleEn}
                titleFr={m.titleFr}
                descEn={m.descEn}
                descFr={m.descFr}
                durationMin={m.durationMin}
                isSleep
                audioPathEn={m.audioPathEn}
                locale={locale}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      </main>
    </PageTransition>
  )
}
