import type { Locale } from '@/lib/i18n'

interface VerseDisplayProps {
  verses: Array<{
    verse: number
    textEn: string
    textFr: string
  }>
  locale: Locale
  activeRange?: [number, number] | null
}

export function VerseDisplay({ verses, locale, activeRange }: VerseDisplayProps) {
  return (
    <div className="space-y-1 font-[family-name:var(--font-serif)] text-xl leading-relaxed">
      {verses.map((v, idx) => {
        const isActive = activeRange != null && idx >= activeRange[0] && idx <= activeRange[1]
        const isDimmed = activeRange != null && !isActive

        return (
          <span
            key={v.verse}
            className="inline transition-opacity duration-200"
            style={{ opacity: isDimmed ? 0.3 : 1 }}
          >
            <sup className="mr-1 text-xs tabular-nums text-[var(--muted)] align-super">
              {v.verse}
            </sup>
            <span style={isActive ? { color: 'var(--accent)' } : undefined}>
              {locale === 'fr' ? v.textFr : v.textEn}
            </span>{' '}
          </span>
        )
      })}
    </div>
  )
}
