import { useState, useCallback, useEffect } from 'react'

type ThemeSetting = 'light' | 'dark' | 'auto'

function getStoredSetting(): ThemeSetting {
  if (typeof window === 'undefined') return 'auto'
  return (localStorage.getItem('vesper-theme') as ThemeSetting) ?? 'auto'
}

function resolveTheme(setting: ThemeSetting): 'light' | 'dark' {
  if (setting !== 'auto') return setting
  // Auto: dark between 8 PM and 7 AM
  const hour = new Date().getHours()
  return hour >= 20 || hour < 7 ? 'dark' : 'light'
}

function applyTheme(resolved: 'light' | 'dark') {
  const html = document.documentElement
  if (resolved === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
}

export function useTheme() {
  const [setting, setSettingState] = useState<ThemeSetting>(getStoredSetting)
  const resolved = resolveTheme(setting)

  // Apply on mount + when setting changes
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Re-check auto mode every minute
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
