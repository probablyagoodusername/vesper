import type { Locale } from '@/lib/i18n'
import { BASE } from '@/lib/constants'

interface MeditationCardProps {
  slug: string
  titleEn: string
  titleFr: string
  descEn: string
  descFr: string
  durationMin: number
  isSleep?: boolean
  audioPathEn: string | null
  locale: Locale
  href?: string
  durationLabel?: string
}

export function MeditationCard({
  slug,
  titleEn,
  titleFr,
  descEn,
  descFr,
  durationMin,
  isSleep,
  audioPathEn,
  locale,
  href,
  durationLabel = 'min',
}: MeditationCardProps) {
  const title = locale === 'fr' ? titleFr : titleEn
  const desc = locale === 'fr' ? descFr : descEn
  const resolvedHref = href ?? (isSleep ? `${BASE}/sleep/${slug}` : `${BASE}/meditate/${slug}`)

  return (
    <a
      href={resolvedHref}
      className="block rounded-xl border border-[var(--border)] p-5 transition-colors hover:bg-[var(--surface)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--primary)]">{title}</p>
            {!!audioPathEn && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center" title="Audio available">
                <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                  <path d="M12 3v18l-7-6H2a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3l7-6z" />
                  <path d="M16.5 7.5a5 5 0 0 1 0 9" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
        </div>
        <span className="shrink-0 tabular-nums text-xs text-[var(--muted)]">
          {durationMin} {durationLabel}
        </span>
      </div>
    </a>
  )
}
