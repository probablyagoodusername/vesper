import { useCallback, useSyncExternalStore } from 'react'
import type { Locale } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

function getLocaleFromStorage(): Locale {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem('vesper-locale') as Locale) ?? 'en'
}

function getLocaleFromDOM(): Locale {
  if (typeof document === 'undefined') return 'en'
  return (document.documentElement.dataset.locale as Locale) ?? 'en'
}

function subscribe(callback: () => void) {
  // 'storage' fires from other tabs; 'vesper-locale-changed' fires from same tab
  window.addEventListener('storage', callback)
  window.addEventListener('vesper-locale-changed', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('vesper-locale-changed', callback)
  }
}

export function useLocale() {
  const locale = useSyncExternalStore(subscribe, getLocaleFromStorage, getLocaleFromDOM)

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem('vesper-locale', l)
    window.dispatchEvent(new Event('vesper-locale-changed'))
  }, [])

  const toggleLocale = useCallback(() => {
    const current = getLocaleFromStorage()
    const next = current === 'en' ? 'fr' : 'en'
    localStorage.setItem('vesper-locale', next)
    window.dispatchEvent(new Event('vesper-locale-changed'))
  }, [])

  const translations = getTranslations(locale)

  return { locale, setLocale, toggleLocale, t: translations }
}
