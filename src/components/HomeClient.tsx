import { useState, useMemo } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { BASE, CATEGORIES } from '@/lib/constants'
import { PageTransition, StaggerList, StaggerItem, FadeIn } from '@/components/Motion'
import { getDailyVerse } from '@/lib/daily-verses'

interface Meditation {
  slug: string
  titleEn: string
  titleFr: string
  descEn: string
  descFr: string
  durationMin: number
  isSleep: boolean
  category: string
  audioPathEn: string | null
}

interface HomeClientProps {
  allMeditations: Meditation[]
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening'

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 20) return 'afternoon'
  return 'evening'
}

function getDayOfYear(): number {
  const today = new Date()
  return Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
}

function pickThree<T>(items: T[], seed: number): T[] {
  if (items.length <= 3) return items
  const start = seed % items.length
  const result: T[] = []
  for (let i = 0; i < 3; i++) {
    result.push(items[(start + i) % items.length])
  }
  return result
}

const GREETINGS: Record<string, Record<TimeOfDay, string>> = {
  en: { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening' },
  fr: { morning: 'Bonjour', afternoon: 'Bon après-midi', evening: 'Bonsoir' },
}

const SECTION_CONFIG: Record<TimeOfDay, { primary: 'morning' | 'meditate' | 'sleep'; label: Record<string, string>; href: string }> = {
  morning: { primary: 'morning', label: { en: 'Start your day', fr: 'Commencer la journée' }, href: `${BASE}/meditate` },
  afternoon: { primary: 'meditate', label: { en: 'Midday pause', fr: 'Pause de midi' }, href: `${BASE}/meditate` },
  evening: { primary: 'sleep', label: { en: 'Wind down', fr: 'Se détendre' }, href: `${BASE}/sleep` },
}

function CategoryIcon({ category }: { category: string }) {
  const p = { 'aria-hidden': true, className: 'shrink-0', width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (category) {
    case CATEGORIES.morning:
      // Sunrise
      return <svg {...p}><path d="M12 2v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m17.24 7.76 2.83-2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M12 12a4 4 0 0 0-4 4H16a4 4 0 0 0-4-4z" /><path d="M2 20h20" /></svg>
    case CATEGORIES.sleep:
      // Moon
      return <svg {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
    case CATEGORIES.anxiety:
      // Shield (protection)
      return <svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
    case CATEGORIES.selfCompassion:
      // Heart in hand
      return <svg {...p}><path d="M11 14h2" /><path d="M12 14v4" /><path d="M4 10h16" /><path d="M7 4h10l2 6H5z" /><path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /></svg>
    case CATEGORIES.contemplative:
      // Feather (contemplation/writing)
      return <svg {...p}><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></svg>
    case CATEGORIES.sos:
      // Zap (emergency)
      return <svg {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
    case CATEGORIES.prayer:
      // Candle flame
      return <svg {...p}><path d="M12 2c-2 3-4 5-4 8a4 4 0 0 0 8 0c0-3-2-5-4-8z" /><path d="M10 18h4" /><path d="M10 22h4" /><path d="M11 18v4" /><path d="M13 18v4" /></svg>
    case CATEGORIES.music:
      // Music note
      return <svg {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
    default:
      // Sparkle
      return <svg {...p}><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275z" /></svg>
  }
}

function MeditationRow({ m, locale, isSleep }: { m: Meditation; locale: string; isSleep?: boolean }) {
  const title = locale === 'fr' ? m.titleFr : m.titleEn
  const desc = locale === 'fr' ? m.descFr : m.descEn
  const href = isSleep ? `${BASE}/sleep/${m.slug}` : `${BASE}/meditate/${m.slug}`

  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-4 transition-colors hover:bg-[var(--surface)]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--accent)]">
        <CategoryIcon category={m.category} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--primary)]">{title}</p>
        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{desc}</p>
      </div>
      <span className="shrink-0 tabular-nums text-xs text-[var(--muted)]">
        {m.durationMin} min
      </span>
    </a>
  )
}

export function HomeClient({ allMeditations }: HomeClientProps) {
  const { locale, t } = useLocale()
  const [timeOfDay] = useState<TimeOfDay>(getTimeOfDay)

  const dayOfYear = getDayOfYear()
  const dailyVerse = useMemo(() => getDailyVerse(), [])

  const featured = useMemo(() => {
    const morning = allMeditations.filter((m) => m.category === CATEGORIES.morning)
    const meditate = allMeditations.filter((m) =>
      ([CATEGORIES.anxiety, CATEGORIES.selfCompassion, CATEGORIES.contemplative] as string[]).includes(m.category) && !m.isSleep
    )
    const sleep = allMeditations.filter((m) => m.isSleep)
    const prayers = allMeditations.filter((m) => m.category === CATEGORIES.prayer)

    return {
      morning: pickThree(morning, dayOfYear),
      meditate: pickThree(meditate, dayOfYear + 7),
      sleep: pickThree(sleep, dayOfYear + 13),
      prayers: pickThree(prayers, dayOfYear),
    }
  }, [allMeditations, dayOfYear])

  const config = SECTION_CONFIG[timeOfDay]
  const greetings = GREETINGS[locale] ?? GREETINGS.en
  const primaryItems = featured[config.primary]

  return (
    <PageTransition>
      <main className="px-6 pt-12 pb-8">
        <header className="mb-10">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]">
            {greetings[timeOfDay]}
          </h1>
        </header>

        {/* Daily verse */}
        <FadeIn>
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {t.bible.verseOfTheDay}
            </h2>
            <blockquote className="rounded-xl bg-[var(--surface)] p-5">
              <p className="font-[family-name:var(--font-serif)] text-xl leading-relaxed text-[var(--primary)]">
                &ldquo;{locale === 'fr' ? dailyVerse.textFr : dailyVerse.textEn}&rdquo;
              </p>
              <footer className="mt-3 text-sm text-[var(--muted)]">
                {locale === 'fr' ? dailyVerse.referenceFr : dailyVerse.reference}
              </footer>
            </blockquote>
          </section>
        </FadeIn>

        {/* Time-appropriate featured section */}
        {primaryItems.length > 0 && (
          <FadeIn delay={0.1}>
            <section className="mb-10">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  {config.label[locale] ?? config.label.en}
                </h2>
                <a
                  href={config.href}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  {locale === 'fr' ? 'Voir tout' : 'See all'}
                </a>
              </div>
              <StaggerList className="space-y-2" role="list">
                {primaryItems.map((m) => (
                  <StaggerItem key={m.slug} role="listitem">
                    <MeditationRow m={m} locale={locale} isSleep={m.isSleep} />
                  </StaggerItem>
                ))}
              </StaggerList>
            </section>
          </FadeIn>
        )}

        {/* Prayers */}
        {featured.prayers.length > 0 && (
          <FadeIn delay={0.2}>
            <section className="mb-10">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                {locale === 'fr' ? 'Prières' : 'Prayers'}
              </h2>
              <StaggerList className="space-y-2" role="list">
                {featured.prayers.map((m) => (
                  <StaggerItem key={m.slug} role="listitem">
                    <MeditationRow m={m} locale={locale} />
                  </StaggerItem>
                ))}
              </StaggerList>
            </section>
          </FadeIn>
        )}

      </main>
    </PageTransition>
  )
}
