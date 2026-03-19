import { useLocale } from '@/hooks/useLocale'
import { parseScript } from '@/lib/parseScript'
import type { MeditationData } from '@/types'
import { BASE } from '@/lib/constants'

interface SleepReaderProps {
  meditation: MeditationData
}

export function SleepReader({ meditation }: SleepReaderProps) {
  const { locale } = useLocale()

  const title = locale === 'fr' ? meditation.titleFr : meditation.titleEn
  const desc = locale === 'fr' ? meditation.descFr : meditation.descEn
  const script = locale === 'fr' ? meditation.scriptFr : meditation.scriptEn
  const lines = parseScript(script)

  return (
    <main
      className="min-h-screen px-6 pt-12 pb-16"
      style={{ backgroundColor: 'var(--sleep-bg)', color: 'var(--sleep-text)' }}
    >
      <header className="mb-8 flex items-center justify-between">
        <a
          href={`${BASE}/sleep`}
          className="flex items-center gap-1 text-sm transition-colors"
          style={{ color: 'var(--sleep-muted)' }}
          aria-label={locale === 'fr' ? 'Retour' : 'Back'}
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          {locale === 'fr' ? 'Retour' : 'Back'}
        </a>
      </header>

      <div className="mb-8">
        <h1
          className="font-[family-name:var(--font-serif)] text-3xl font-semibold leading-tight"
          style={{ color: 'var(--sleep-primary)' }}
        >
          {title}
        </h1>
        <p className="mt-3 leading-relaxed" style={{ color: 'var(--sleep-muted)' }}>
          {desc}
        </p>
        <div className="mt-4">
          <span className="tabular-nums text-xs" style={{ color: 'var(--sleep-muted)' }}>
            {meditation.durationMin} min
          </span>
        </div>
      </div>

      {meditation.breathing && (
        <a
          href={`${BASE}/breathe/${meditation.breathing.slug}`}
          className="mb-10 flex items-center gap-3 rounded-xl border p-4 transition-colors"
          style={{
            backgroundColor: 'var(--sleep-surface)',
            borderColor: 'var(--sleep-border)',
          }}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--sleep-scripture)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <span className="text-sm" style={{ color: 'var(--sleep-scripture)' }}>
            {locale === 'fr' ? 'Commencer par la respiration' : 'Begin with breathing'}
          </span>
        </a>
      )}

      <article className="mx-auto max-w-prose space-y-6">
        {lines.map((line, i) => {
          if (line.type === 'pause') return null
          if (line.type === 'stage-direction') {
            return (
              <p
                key={i}
                className="text-xs italic leading-relaxed"
                style={{ color: 'var(--sleep-stage)' }}
              >
                {line.text}
              </p>
            )
          }
          if (line.type === 'scripture') {
            return (
              <p
                key={i}
                className="font-[family-name:var(--font-serif)] text-xl leading-[1.8]"
                style={{ color: 'var(--sleep-scripture)' }}
              >
                {line.text}
              </p>
            )
          }
          return (
            <p key={i} className="leading-[1.8]" style={{ color: 'var(--sleep-text)' }}>
              {line.text}
            </p>
          )
        })}
      </article>
    </main>
  )
}
