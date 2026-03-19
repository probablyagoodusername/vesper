import { readFileSync, writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BIBLE_DIR = resolve(__dirname, '..', 'src', 'content', 'bible')
const booksIndex = JSON.parse(readFileSync(join(BIBLE_DIR, '_books.json'), 'utf-8'))

interface SearchEntry {
  id: string
  bookSlug: string
  bookNameEn: string
  bookNameFr: string
  abbreviationEn: string
  abbreviationFr: string
  chapter: number
  verse: number
  textEn: string
  textFr: string
}

const entries: SearchEntry[] = []

for (const book of booksIndex) {
  const bookData = JSON.parse(readFileSync(join(BIBLE_DIR, `${book.slug}.json`), 'utf-8'))
  for (const [chapterStr, verses] of Object.entries(bookData.chapters)) {
    for (const v of verses as { verse: number; textEn: string; textFr: string }[]) {
      entries.push({
        id: `${book.slug}:${chapterStr}:${v.verse}`,
        bookSlug: book.slug,
        bookNameEn: book.nameEn,
        bookNameFr: book.nameFr,
        abbreviationEn: book.abbreviationEn,
        abbreviationFr: book.abbreviationFr,
        chapter: parseInt(chapterStr),
        verse: v.verse,
        textEn: v.textEn,
        textFr: v.textFr,
      })
    }
  }
}

writeFileSync(
  resolve(__dirname, '..', 'public', 'search-index.json'),
  JSON.stringify(entries)
)

console.log(`Built search index: ${entries.length} verses`)
