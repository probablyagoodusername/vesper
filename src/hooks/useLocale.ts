import { useState, useCallback, useSyncExternalStore } from 'react'
import type { Locale } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

function getLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem('vesper-locale') as Locale) ?? 'en'
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

export function useLocale() {
  const storedLocale = useSyncExternalStore(subscribe, getLocaleFromStorage, () => 'en' as Locale)
  const [locale, setLocaleState] = useState<Locale>(storedLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('vesper-locale', l)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'fr' : 'en')
  }, [locale, setLocale])

  const translations = getTranslations(locale)

  return { locale, setLocale, toggleLocale, t: translations }
}
