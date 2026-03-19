import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { VerseDisplay } from '@/components/VerseDisplay'
import { BibleTTS } from '@/components/BibleTTS'
import type { BookWithCount } from '@/types'
import { BASE } from '@/lib/constants'

interface VerseData {
  verse: number
  textEn: string
  textFr: string
}

interface BibleReaderClientProps {
  books: BookWithCount[]
  initialBook: BookWithCount | null
  initialChapter: number
  initialVerses: VerseData[]
  readingLabel: string
  readingLabelFr: string
  readingReason: string
  readingReasonFr: string
}

export function BibleReaderClient({
  books,
  initialBook,
  initialChapter,
  initialVerses,
  readingLabel,
  readingLabelFr,
  readingReason,
  readingReasonFr,
}: BibleReaderClientProps) {
  const { locale, t } = useLocale()

  const [currentBook, setCurrentBook] = useState(initialBook)
  const [currentChapter, setCurrentChapter] = useState(initialChapter)
  const [verses, setVerses] = useState<VerseData[]>(initialVerses)
  const [loading, setLoading] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [navStep, setNavStep] = useState<'testament' | 'book' | 'chapter'>('testament')
  const [navTestament, setNavTestament] = useState<'OT' | 'NT'>('OT')
  const [continuous, setContinuous] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('vesper-bible-continuous') === 'true'
  })
  const [autoPlay, setAutoPlay] = useState(false)
  const [activeVerseRange, setActiveVerseRange] = useState<[number, number] | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Persist continuous preference
  useEffect(() => {
    localStorage.setItem('vesper-bible-continuous', String(continuous))
    if (!continuous) setAutoPlay(false)
  }, [continuous])

  const bookName = currentBook
    ? locale === 'fr' ? currentBook.nameFr : currentBook.nameEn
    : ''

  // Close nav on outside click
  useEffect(() => {
    if (!navOpen) return
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setNavOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [navOpen])

  const fetchChapter = useCallback(async (bookSlug: string, chapter: number) => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/data/${bookSlug}.json`)
      if (res.ok) {
        const data = await res.json()
        const chapterVerses = data.chapters[String(chapter)]
        if (chapterVerses) {
          setVerses(chapterVerses)
        }
      }
    } finally {
      setLoading(false)
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const navigateTo = useCallback((book: BookWithCount, chapter: number) => {
    setCurrentBook(book)
    setCurrentChapter(chapter)
    setNavOpen(false)
    setNavStep('testament')
    fetchChapter(book.slug, chapter)
  }, [fetchChapter])

  const goToPrev = useCallback(() => {
    if (!currentBook) return
    if (currentChapter > 1) {
      navigateTo(currentBook, currentChapter - 1)
    } else {
      const idx = books.findIndex((b) => b.slug === currentBook.slug)
      if (idx > 0) {
        const prevBook = books[idx - 1]
        navigateTo(prevBook, prevBook.chapterCount)
      }
    }
  }, [currentBook, currentChapter, books, navigateTo])

  const goToNext = useCallback(() => {
    if (!currentBook) return
    if (currentChapter < currentBook.chapterCount) {
      navigateTo(currentBook, currentChapter + 1)
    } else {
      const idx = books.findIndex((b) => b.slug === currentBook.slug)
      if (idx < books.length - 1) {
        navigateTo(books[idx + 1], 1)
      }
    }
  }, [currentBook, currentChapter, books, navigateTo])

  // Can we go to a next chapter?
  const hasNext = (() => {
    if (!currentBook) return false
    if (currentChapter < currentBook.chapterCount) return true
    const idx = books.findIndex((b) => b.slug === currentBook.slug)
    return idx < books.length - 1
  })()

  const filteredBooks = books.filter((b) => b.testament === navTestament)

  return (
    <main className="flex min-h-screen flex-col px-6 pt-12 pb-8">
      {/* Header: label + navigator */}
      <header className="mb-6 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            {locale === 'fr' ? readingLabelFr : readingLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {locale === 'fr' ? readingReasonFr : readingReason}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`${BASE}/search`}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            aria-label={t.bible.search}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </a>
        </div>
      </header>

      {/* Book + Chapter selector */}
      <div className="relative mb-6" ref={navRef}>
        <button
          onClick={() => { setNavOpen(!navOpen); setNavStep('testament') }}
          className="flex items-center gap-2 text-left"
          aria-expanded={navOpen}
          aria-label={`${bookName} ${currentChapter} — navigate`}
        >
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
            {bookName} {currentChapter}
          </h1>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 transition-transform"
            style={{ transform: navOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Navigator dropdown */}
        {navOpen && (
          <div className="absolute left-0 top-full z-40 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-lg">
            {navStep === 'testament' && (
              <div className="p-2">
                <button
                  onClick={() => { setNavTestament('OT'); setNavStep('book') }}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface)]"
                >
                  {t.bible.oldTestament}
                </button>
                <button
                  onClick={() => { setNavTestament('NT'); setNavStep('book') }}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-[var(--text)] transition-colors hover:bg-[var(--surface)]"
                >
                  {t.bible.newTestament}
                </button>
              </div>
            )}

            {navStep === 'book' && (
              <div className="p-2">
                <button
                  onClick={() => setNavStep('testament')}
                  className="mb-1 flex w-full items-center gap-1 rounded-lg px-3 py-1.5 text-left text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                  {navTestament === 'OT' ? t.bible.oldTestament : t.bible.newTestament}
                </button>
                {filteredBooks.map((b) => (
                  <button
                    key={b.slug}
                    onClick={() => {
                      setAutoPlay(false)
                      if (b.chapterCount === 1) {
                        navigateTo(b, 1)
                      } else {
                        setCurrentBook(b)
                        setNavStep('chapter')
                      }
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface)] ${
                      currentBook?.slug === b.slug ? 'text-[var(--accent)]' : 'text-[var(--text)]'
                    }`}
                  >
                    {locale === 'fr' ? b.nameFr : b.nameEn}
                  </button>
                ))}
              </div>
            )}

            {navStep === 'chapter' && currentBook && (
              <div className="p-2">
                <button
                  onClick={() => setNavStep('book')}
                  className="mb-1 flex w-full items-center gap-1 rounded-lg px-3 py-1.5 text-left text-xs text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
                  </svg>
                  {locale === 'fr' ? currentBook.nameFr : currentBook.nameEn}
                </button>
                <div className="grid grid-cols-6 gap-1">
                  {Array.from({ length: currentBook.chapterCount }, (_, i) => i + 1).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => { setAutoPlay(false); navigateTo(currentBook, ch) }}
                      className={`rounded-md py-1.5 text-center text-sm tabular-nums transition-colors hover:bg-[var(--surface)] ${
                        ch === currentChapter ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text)]'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Read aloud */}
      {!loading && verses.length > 0 && (
        <div className="mb-4 flex items-center gap-4">
          <BibleTTS
            verses={verses}
            locale={locale}
            autoPlay={autoPlay}
            onComplete={() => {
              if (continuous && hasNext) {
                setAutoPlay(true)
                goToNext()
              } else {
                setAutoPlay(false)
              }
            }}
            onStop={() => setAutoPlay(false)}
            onChunkChange={(start, end) => {
              setActiveVerseRange(start >= 0 ? [start, end] : null)
            }}
            chapterLabel={continuous && autoPlay ? `${bookName} ${currentChapter}` : undefined}
          />
          <button
            onClick={() => setContinuous((c) => !c)}
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: continuous ? 'var(--accent)' : 'var(--muted)' }}
            aria-label={locale === 'fr' ? 'Lecture continue' : 'Continuous reading'}
          >
            <span
              className="relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors"
              style={{
                backgroundColor: continuous ? 'var(--accent)' : 'var(--surface)',
                borderColor: continuous ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform"
                style={{ transform: continuous ? 'translateX(12px)' : 'translateX(2px)' }}
              />
            </span>
            {locale === 'fr' ? 'Continu' : 'Continuous'}
          </button>
        </div>
      )}

      {/* Verse content */}
      <div ref={contentRef} className="flex-1">
        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 animate-pulse rounded bg-[var(--surface)]" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        ) : (
          <article className="mx-auto max-w-lg">
            <VerseDisplay verses={verses} locale={locale} activeRange={activeVerseRange} />
          </article>
        )}
      </div>

      {/* Prev / Next chapter */}
      <nav className="mt-8 flex items-center justify-between">
        <button
          onClick={() => { setAutoPlay(false); goToPrev() }}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
          disabled={!currentBook || (currentChapter <= 1 && books[0]?.slug === currentBook?.slug)}
          aria-label={locale === 'fr' ? 'Chapitre précédent' : 'Previous chapter'}
        >
          &larr; {locale === 'fr' ? 'Précédent' : 'Previous'}
        </button>
        <button
          onClick={() => { setAutoPlay(false); goToNext() }}
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
          disabled={!currentBook || (currentChapter >= (currentBook?.chapterCount ?? 0) && books[books.length - 1]?.slug === currentBook?.slug)}
          aria-label={locale === 'fr' ? 'Chapitre suivant' : 'Next chapter'}
        >
          {locale === 'fr' ? 'Suivant' : 'Next'} &rarr;
        </button>
      </nav>
    </main>
  )
}
