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

type ListenMode = 'off' | 'once' | 'continuous'

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
  const [listenMode, setListenMode] = useState<ListenMode>('off')
  const [autoPlay, setAutoPlay] = useState(false)
  const [activeVerseRange, setActiveVerseRange] = useState<[number, number] | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Track scroll to hide/show header
  useEffect(function trackScroll() {
    function onScroll() {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const bookName = currentBook
    ? locale === 'fr' ? currentBook.nameFr : currentBook.nameEn
    : ''

  // No outside-click handler — dropdown closes via:
  // 1. Tapping the title button again (toggles navOpen)
  // 2. Selecting a chapter (navigateTo closes it)
  // 3. Tapping the backdrop overlay

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
      window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const hasNext = (() => {
    if (!currentBook) return false
    if (currentChapter < currentBook.chapterCount) return true
    const idx = books.findIndex((b) => b.slug === currentBook.slug)
    return idx < books.length - 1
  })()

  const cycleListenMode = useCallback(() => {
    setListenMode(prev => {
      if (prev === 'off') return 'once'
      if (prev === 'once') return 'continuous'
      setAutoPlay(false)
      return 'off'
    })
  }, [])

  const listenLabel = listenMode === 'off'
    ? (locale === 'fr' ? 'Écouter' : 'Listen')
    : listenMode === 'once'
    ? (locale === 'fr' ? 'Écouter ▶' : 'Listen ▶')
    : (locale === 'fr' ? 'Continu ∞' : 'Continuous ∞')

  const filteredBooks = books.filter((b) => b.testament === navTestament)

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 pt-12 pb-8">
      {/* Collapsible header — hides on scroll */}
      <div
        className="transition-all duration-300"
        style={{
          maxHeight: scrolled ? 0 : '300px',
          opacity: scrolled ? 0 : 1,
          overflow: 'hidden',
        }}
      >
        {/* Liturgical event card */}
        <div className="mb-5 rounded-xl bg-[var(--surface)] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]">
            {locale === 'fr' ? readingLabelFr : readingLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {locale === 'fr' ? readingReasonFr : readingReason}
          </p>
        </div>

        {/* Search bar */}
        <a
          href={`${BASE}/bible/search`}
          className="mb-5 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--accent)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {t.bible.searchPlaceholder}
        </a>
      </div>

      {/* Sticky book/chapter selector — always visible */}
      <div className="sticky top-12 z-30 bg-[var(--bg)] pb-3 pt-1" ref={navRef}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setNavOpen(!navOpen); setNavStep('testament') }}
            className="flex items-center gap-2 rounded-lg px-3 py-2 -ml-3 text-left transition-colors active:bg-[var(--surface)]"
            aria-expanded={navOpen}
            aria-label={`${bookName} ${currentChapter} — navigate`}
          >
            <h1 className="font-[family-name:var(--font-serif)] text-xl font-semibold text-[var(--primary)]">
              {bookName} {currentChapter}
            </h1>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="shrink-0 transition-transform"
              style={{ transform: navOpen ? 'rotate(180deg)' : 'rotate(0)' }}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* TTS controls */}
          {!loading && verses.length > 0 && (
            <div className="flex items-center gap-2">
              <BibleTTS
                verses={verses}
                locale={locale}
                autoPlay={autoPlay}
                onComplete={() => {
                  if (listenMode === 'continuous' && hasNext) {
                    setAutoPlay(true)
                    goToNext()
                  } else {
                    setAutoPlay(false)
                    if (listenMode === 'once') setListenMode('off')
                  }
                }}
                onStop={() => { setAutoPlay(false); setListenMode('off') }}
                onChunkChange={(start, end) => {
                  setActiveVerseRange(start >= 0 ? [start, end] : null)
                }}
                chapterLabel={listenMode === 'continuous' && autoPlay ? `${bookName} ${currentChapter}` : undefined}
              />
            </div>
          )}
        </div>

        {/* Navigator dropdown + backdrop */}
        {navOpen && (
          <>
          <div className="fixed inset-0 z-40" onClick={() => setNavOpen(false)} />
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-lg">
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
          </>
        )}
      </div>

      {/* TTS is rendered in the sticky header above */}
      {false && (
        <div></div>
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
