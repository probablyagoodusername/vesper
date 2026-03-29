import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { BASE } from '@/lib/constants'
import { getLiturgicalContext } from '@/lib/liturgical-context'
import { getLore } from '@/lib/liturgical-lore'
import type { LoreSection, ScriptureRef } from '@/lib/liturgical-lore'
import { NavBar } from '@/components/NavBar'
import { PageTransition, StaggerItem } from '@/components/Motion'

/**
 * Parse markdown-style **bold** into React elements.
 * Only handles **bold** — no other markdown.
 */
function renderBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--accent)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderParagraph(text: string, key: number): ReactNode {
  const lines = text.split('\n')
  return (
    <p key={key} className="text-[15px] leading-relaxed text-[var(--primary)]">
      {lines.map((line, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {renderBold(line)}
        </span>
      ))}
    </p>
  )
}

function SectionBlock({ icon, label, content }: { icon: ReactNode; label: string; content: string }) {
  const paragraphs = content.split('\n\n')

  return (
    <StaggerItem>
      <section className="rounded-2xl glass-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            {icon}
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {label}
          </h2>
        </div>
        <div className="space-y-3">
          {paragraphs.map((p, i) => renderParagraph(p, i))}
        </div>
      </section>
    </StaggerItem>
  )
}

function ScriptureList({ refs, locale, label }: { refs: ScriptureRef[]; locale: string; label: string }) {
  return (
    <StaggerItem>
      <section className="rounded-2xl glass-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <BookIcon />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {label}
          </h2>
        </div>
        <ul className="space-y-2">
          {refs.map((ref, i) => (
            <li key={i}>
              <span className="font-[family-name:var(--font-serif)] text-[15px] text-[var(--primary)]">
                {locale === 'fr' ? ref.refFr : ref.ref}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </StaggerItem>
  )
}

// ─── Icons (Bootstrap Icons, 16x16, fill) ──────────────────

function OriginIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
    </svg>
  )
}

function TheologyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.399l-.451.003.082-.381 1.958-.332.36.003zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
    </svg>
  )
}

function FranceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5z" />
    </svg>
  )
}

function PracticeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783" />
    </svg>
  )
}

function NoLoreView({ locale, eventNameFr, eventName, description, descriptionFr }: {
  locale: string
  eventName: string
  eventNameFr: string
  description: string
  descriptionFr: string
}) {
  const name = locale === 'fr' ? eventNameFr : eventName
  const desc = locale === 'fr' ? descriptionFr : description

  return (
    <main className="px-6 pb-8">
      <NavBar title={name} titleAlign="left" />
      <section className="rounded-2xl glass-surface p-5">
        <p className="font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[var(--primary)]">
          {desc}
        </p>
      </section>
    </main>
  )
}

export function LiturgicalDetailClient() {
  const { locale, t } = useLocale()

  const liturgy = useMemo(() => getLiturgicalContext(), [])
  const lore = useMemo(() => getLore(liturgy.current.name), [liturgy.current.name])

  const eventName = locale === 'fr' ? liturgy.current.nameFr : liturgy.current.name
  const eventDesc = locale === 'fr' ? liturgy.current.descriptionFr : liturgy.current.description

  function localized(section: LoreSection): string {
    return locale === 'fr' ? section.fr : section.en
  }

  if (!lore) {
    return (
      <PageTransition>
        <NoLoreView
          locale={locale}
          eventName={liturgy.current.name}
          eventNameFr={liturgy.current.nameFr}
          description={liturgy.current.description}
          descriptionFr={liturgy.current.descriptionFr}
        />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="px-6 pb-8">
        <NavBar title={eventName} titleAlign="left" />

        {/* Season counter */}
        {liturgy.seasonDay != null && liturgy.seasonTotal != null && (
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${(liturgy.seasonDay / liturgy.seasonTotal) * 100}%` }}
              />
            </div>
            <span className="shrink-0 tabular-nums text-xs font-medium text-[var(--muted)]">
              {locale === 'fr'
                ? `Jour ${liturgy.seasonDay} / ${liturgy.seasonTotal}`
                : `Day ${liturgy.seasonDay} / ${liturgy.seasonTotal}`}
            </span>
          </div>
        )}

        {/* Brief description */}
        <StaggerItem>
          <blockquote className="mb-6 rounded-2xl glass-surface p-5">
            <p className="font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[var(--primary)]">
              {eventDesc}
            </p>
          </blockquote>
        </StaggerItem>

        {/* Lore sections */}
        <div className="space-y-4">
          <SectionBlock
            icon={<OriginIcon />}
            label={t.liturgy.origin}
            content={localized(lore.origin)}
          />
          <SectionBlock
            icon={<TheologyIcon />}
            label={t.liturgy.theology}
            content={localized(lore.theology)}
          />
          {locale === 'fr' && (
            <SectionBlock
              icon={<FranceIcon />}
              label={t.liturgy.france}
              content={localized(lore.france)}
            />
          )}
          <SectionBlock
            icon={<PracticeIcon />}
            label={t.liturgy.practice}
            content={localized(lore.practice)}
          />
          <ScriptureList
            refs={lore.scripture}
            locale={locale}
            label={t.liturgy.scripture}
          />
          <StaggerItem>
            <a
              href={`${BASE}/bible`}
              className="block rounded-2xl glass-surface px-5 py-4 transition-colors hover:bg-[var(--surface)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                    <BookIcon />
                  </span>
                  <span className="text-sm font-medium text-[var(--primary)]">
                    {t.bible.openBible}
                  </span>
                </div>
                <span className="text-sm text-[var(--accent)]" aria-hidden="true">&rarr;</span>
              </div>
            </a>
          </StaggerItem>
        </div>

        {/* Upcoming event teaser */}
        {liturgy.upcoming && (
          <div className="mt-8 rounded-2xl glass-surface p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {locale === 'fr' ? 'Prochainement' : 'Coming up'}
            </p>
            <p className="mt-1 font-[family-name:var(--font-serif)] text-lg text-[var(--primary)]">
              {locale === 'fr' ? liturgy.upcoming.nameFr : liturgy.upcoming.name}
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {locale === 'fr'
                ? `Dans ${liturgy.upcoming.daysUntil === 1 ? 'un jour' : `${liturgy.upcoming.daysUntil} jours`}`
                : `In ${liturgy.upcoming.daysUntil === 1 ? '1 day' : `${liturgy.upcoming.daysUntil} days`}`}
            </p>
          </div>
        )}
      </main>
    </PageTransition>
  )
}
