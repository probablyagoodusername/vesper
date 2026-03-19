import { useLocale } from '@/hooks/useLocale'

export function LanguageToggle() {
  const { locale, toggleLocale } = useLocale()

  return (
    <button
      onClick={toggleLocale}
      className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      aria-label={`Switch to ${locale === 'en' ? 'French' : 'English'}`}
    >
      {locale === 'en' ? 'FR' : 'EN'}
    </button>
  )
}
