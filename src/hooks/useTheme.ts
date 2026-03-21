import { useState, useCallback, useEffect } from 'react'

type ThemeSetting = 'light' | 'dark' | 'auto'

function resolveTheme(setting: ThemeSetting): 'light' | 'dark' {
  if (setting !== 'auto') return setting
  if (typeof window === 'undefined') return 'light'
  const hour = new Date().getHours()
  return hour >= 20 || hour < 7 ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  if (resolved === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export function useTheme() {
  const [setting, setSettingState] = useState<ThemeSetting>('auto')

  // Sync from localStorage after mount
  useEffect(function syncTheme() {
    const stored = localStorage.getItem('vesper-theme') as ThemeSetting | null
    if (stored) setSettingState(stored)
  }, [])

  const resolved = resolveTheme(setting)

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  useEffect(() => {
    if (setting !== 'auto') return
    const interval = setInterval(() => {
      applyTheme(resolveTheme('auto'))
    }, 60_000)
    return () => clearInterval(interval)
  }, [setting])

  const setSetting = useCallback((s: ThemeSetting) => {
    setSettingState(s)
    localStorage.setItem('vesper-theme', s)
    applyTheme(resolveTheme(s))
  }, [])

  return { setting, resolved, setSetting }
}
