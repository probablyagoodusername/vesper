import { useLocale } from '@/hooks/useLocale'
import { VerseDisplay } from '@/components/VerseDisplay'
import type { BookWithCount, VerseData } from '@/types'
import { BASE } from '@/lib/constants'

interface ChapterReaderClientProps {
  book: BookWithCount
  chapter: number
  verses: VerseData[]
}

export function ChapterReaderClient({ book, chapter, verses }: ChapterReaderClientProps) {
  const { locale, t } = useLocale()

  const bookName = locale === 'fr' ? book.nameFr : book.nameEn
  const hasPrev = chapter > 1
  const hasNext = chapter < book.chapterCount

  return (
    <main className="px-6 pt-12 pb-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href={`${BASE}/${book.slug}`}
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            aria-label="Back to chapters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
          <div>
            <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
              {bookName} {chapter}
            </h1>
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-lg">
        <VerseDisplay verses={verses} locale={locale} />
      </article>

      {/* Chapter navigation */}
      <nav className="mx-auto mt-10 flex max-w-lg items-center justify-between">
        {hasPrev ? (
          <a
            href={`${BASE}/${book.slug}/${chapter - 1}`}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            &larr; {t.bible.chapter} {chapter - 1}
          </a>
        ) : (
          <div />
        )}
        {hasNext ? (
          <a
            href={`${BASE}/${book.slug}/${chapter + 1}`}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {t.bible.chapter} {chapter + 1} &rarr;
          </a>
        ) : (
          <div />
        )}
      </nav>
    </main>
  )
}
