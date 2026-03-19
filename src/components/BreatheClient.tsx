import { useLocale } from '@/hooks/useLocale'
import { PageTransition, StaggerList, StaggerItem, FadeIn } from '@/components/Motion'
import { MeditationCard } from '@/components/MeditationCard'
import type { MeditationData } from '@/types'

interface BreatheClientProps {
  protocols: MeditationData[]
}

export function BreatheClient({ protocols }: BreatheClientProps) {
  const { locale, t } = useLocale()

  const sos = protocols.filter((p) => p.slug.startsWith('sos-') && p.slug !== 'sos-nsdr')
  const nsdr = protocols.find((p) => p.slug === 'sos-nsdr')
  const breathing = protocols.filter((p) => p.slug.startsWith('breathe-'))

  return (
    <PageTransition>
      <main className="px-6 pt-12 pb-8">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]">
            {t.breathe.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {locale === 'fr' ? 'Outils de secours et respiration' : 'Quick relief & breathing tools'}
          </p>
        </header>

        {sos.length > 0 && (
          <FadeIn delay={0.05}>
            <Section title="SOS">
              <StaggerList className="space-y-3" role="list">
                {sos.map((p) => (
                  <StaggerItem key={p.slug} role="listitem">
                    <MeditationCard
                      slug={p.slug}
                      titleEn={p.titleEn}
                      titleFr={p.titleFr}
                      descEn={p.descEn}
                      descFr={p.descFr}
                      durationMin={p.durationMin}
                      audioPathEn={p.audioPathEn}
                      locale={locale}
                    />
                  </StaggerItem>
                ))}
              </StaggerList>
            </Section>
          </FadeIn>
        )}

        {nsdr && (
          <FadeIn delay={0.15}>
            <Section title={locale === 'fr' ? 'Repos profond' : 'Deep Rest'}>
              <MeditationCard
                slug={nsdr.slug}
                titleEn={nsdr.titleEn}
                titleFr={nsdr.titleFr}
                descEn={nsdr.descEn}
                descFr={nsdr.descFr}
                durationMin={nsdr.durationMin}
                audioPathEn={nsdr.audioPathEn}
                locale={locale}
              />
            </Section>
          </FadeIn>
        )}

        {breathing.length > 0 && (
          <FadeIn delay={0.25}>
            <Section title={locale === 'fr' ? 'Respiration guidée' : 'Guided Breathing'}>
              <StaggerList className="space-y-3" role="list">
                {breathing.map((p) => (
                  <StaggerItem key={p.slug} role="listitem">
                    <MeditationCard
                      slug={p.slug}
                      titleEn={p.titleEn}
                      titleFr={p.titleFr}
                      descEn={p.descEn}
                      descFr={p.descFr}
                      durationMin={p.durationMin}
                      audioPathEn={p.audioPathEn}
                      locale={locale}
                    />
                  </StaggerItem>
                ))}
              </StaggerList>
            </Section>
          </FadeIn>
        )}
      </main>
    </PageTransition>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        {title}
      </h2>
      {children}
    </section>
  )
}
