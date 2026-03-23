import { useState, useCallback, useRef, useEffect } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { VerseDisplay } from '@/components/VerseDisplay'
import { BibleTTS } from '@/components/BibleTTS'
import { NavBar, SearchIcon, BookIcon, ListenIcon } from '@/components/NavBar'
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
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; chapter: number; verse: number; textEn: string; textFr: string; bookSlug: string; bookNameEn: string; bookNameFr: string }[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchDone, setSearchDone] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  const doSearch = useCallback(async () => {
    if (searchQuery.length < 2) return
    setSearchLoading(true)
    setSearchDone(true)
    try {
      const res = await fetch(`${BASE}/search-index.json`)
      const all = await res.json()
      const q = searchQuery.toLowerCase()
      setSearchResults(
        all.filter((v: { textEn: string; textFr: string }) =>
          (locale === 'fr' ? v.textFr : v.textEn).toLowerCase().includes(q)
        ).slice(0, 30)
      )
    } catch {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }, [searchQuery, locale])

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 pb-8">
      <NavBar
        title={`${bookName} ${currentChapter}`}
        titleAlign="left"
        trailingActions={[
          {
            onClick: () => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100) },
            icon: <SearchIcon />,
            label: 'Search',
          },
          {
            onClick: () => { setNavOpen(!navOpen); setNavStep('testament') },
            icon: <BookIcon />,
            label: 'Browse',
          },
          {
            onClick: cycleListenMode,
            icon: <ListenIcon active={listenMode !== 'off'} />,
            label: listenLabel,
          },
        ]}
      />

      {/* TTS — hidden, controlled by nav listen button */}
      {!loading && verses.length > 0 && listenMode !== 'off' && (
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
      )}

      {/* Navigator modal — iOS 26 sheet */}
      <div ref={navRef}>
        {navOpen && (
          <>
          <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setNavOpen(false)} style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <div
            className="fixed left-4 right-4 bottom-4 z-[70] max-h-[70vh] overflow-y-auto rounded-2xl border border-[var(--border)] shadow-2xl"
            style={{ backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', background: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}
          >
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
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
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
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
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

      {/* Search modal */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/30" onClick={() => setSearchOpen(false)} style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <div
            className="fixed left-4 right-4 top-[calc(env(safe-area-inset-top,0px)+60px)] bottom-4 z-[70] flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] shadow-2xl"
            style={{ backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', background: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] p-3">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--muted)" className="shrink-0">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') doSearch() }}
                placeholder={t.bible.searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); setSearchDone(false) }}
                className="shrink-0 text-xs font-medium text-[var(--accent)]"
              >
                {t.ui.cancel}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {searchLoading && (
                <div className="space-y-3 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-lg bg-[var(--surface)] p-4">
                      <div className="h-3 w-24 rounded bg-[var(--border)]" />
                      <div className="mt-2 h-4 w-full rounded bg-[var(--border)]" />
                    </div>
                  ))}
                </div>
              )}
              {!searchLoading && searchDone && searchResults.length === 0 && (
                <p className="py-12 text-center text-sm text-[var(--muted)]">{t.bible.noResults}</p>
              )}
              {!searchLoading && searchResults.map((r) => {
                const rBookName = locale === 'fr' ? r.bookNameFr : r.bookNameEn
                const rText = locale === 'fr' ? r.textFr : r.textEn
                const book = books.find((b) => b.slug === r.bookSlug)
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      if (book) navigateTo(book, r.chapter)
                      setSearchOpen(false)
                      setSearchQuery('')
                      setSearchResults([])
                      setSearchDone(false)
                    }}
                    className="w-full rounded-lg p-3 text-left transition-colors active:bg-[var(--surface)]"
                  >
                    <p className="text-xs font-medium text-[var(--accent)]">{rBookName} {r.chapter}:{r.verse}</p>
                    <p className="mt-1 line-clamp-2 font-[family-name:var(--font-serif)] text-sm leading-relaxed text-[var(--primary)]">{rText}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </>
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
