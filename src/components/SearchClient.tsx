import { useState, useCallback } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { BASE } from '@/lib/constants'

interface SearchResult {
  id: string
  chapter: number
  verse: number
  textEn: string
  textFr: string
  bookSlug: string
  bookNameEn: string
  bookNameFr: string
  abbreviationEn: string
  abbreviationFr: string
}

export function SearchClient() {
  const { locale, t } = useLocale()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async () => {
    if (query.length < 2) return
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`${BASE}/search-index.json`)
      const allVerses: SearchResult[] = await res.json()

      const q = query.toLowerCase()
      const matches = allVerses
        .filter((v) => {
          const text = locale === 'fr' ? v.textFr : v.textEn
          return text.toLowerCase().includes(q)
        })
        .slice(0, 50)

      setResults(matches)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, locale])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') search()
  }

  return (
    <main className="px-6 pt-12 pb-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href={`${BASE}/bible`}
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            aria-label={locale === 'fr' ? 'Retour' : 'Back'}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl font-semibold text-[var(--primary)]">
            {t.bible.search}
          </h1>
        </div>
      </header>

      {/* Search input */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.bible.searchPlaceholder}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--muted)]"
          autoFocus
        />
        <button
          onClick={search}
          disabled={query.length < 2 || loading}
          className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t.bible.search}
        </button>
      </div>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-[var(--surface)] p-4">
              <div className="h-3 w-24 rounded bg-[var(--border)]" />
              <div className="mt-2 h-4 w-full rounded bg-[var(--border)]" />
              <div className="mt-1 h-4 w-3/4 rounded bg-[var(--border)]" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center text-[var(--muted)] py-12">
          {t.bible.noResults}
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => {
            const bookName = locale === 'fr' ? r.bookNameFr : r.bookNameEn
            const text = locale === 'fr' ? r.textFr : r.textEn

            return (
              <a
                key={r.id}
                href={`${BASE}/${r.bookSlug}/${r.chapter}`}
                className="block rounded-lg border border-[var(--border)] p-4 transition-colors hover:bg-[var(--surface)]"
              >
                <p className="text-xs font-medium text-[var(--accent)]">
                  {bookName} {r.chapter}:{r.verse}
                </p>
                <p className="mt-1 font-[family-name:var(--font-serif)] text-lg leading-relaxed text-[var(--primary)]">
                  {text}
                </p>
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}
