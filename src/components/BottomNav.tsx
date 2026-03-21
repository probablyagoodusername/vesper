import { useLocale } from '@/hooks/useLocale'
import { BASE } from '@/lib/constants'

const navItems = [
  { href: `${BASE}/home`, icon: HomeIcon, key: 'home' as const },
  { href: `${BASE}/breathe`, icon: WindIcon, key: 'breathe' as const },
  { href: `${BASE}/meditate`, icon: SparkleIcon, key: 'meditate' as const },
  { href: `${BASE}/sleep`, icon: MoonIcon, key: 'sleep' as const },
  { href: `${BASE}/settings`, icon: GearIcon, key: 'settings' as const },
]

interface BottomNavProps {
  currentPath: string
}

/**
 * Navigate using Astro's View Transitions navigate() — keeps iOS PWA
 * in standalone mode instead of opening Safari.
 */
function softNavigate(href: string) {
  // Astro's ClientRouter exposes navigate() on the window
  // This does a View Transition without a full page load
  const nav = (window as Record<string, unknown>).navigation as { navigate?: (href: string) => void } | undefined

  // Preferred: programmatically click a hidden anchor that Astro's ClientRouter intercepts
  const a = document.createElement('a')
  a.href = href
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function BottomNav({ currentPath }: BottomNavProps) {
  const { t } = useLocale()

  const path = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ href, icon: Icon, key }) => {
          const isActive = path === href || path.startsWith(href + '/')
          return (
            <a
              key={href}
              href={href}
              data-astro-prefetch
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
              }`}
            >
              <Icon active={isActive} />
              <span>{t.nav[key]}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    </svg>
  )
}

function WindIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}

function SparkleIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275z" />
    </svg>
  )
}

function MoonIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
