# Plan: Smooth Page Transitions for Vesper

## Problem
Tab switching (Home → Breathe → Meditate → Sleep) blinks because:
1. Each tab is a separate Astro page with a `client:load` React island
2. React components check `typeof window === 'undefined'` and render empty during SSR
3. The static HTML contains blank `<astro-island>` wrappers
4. On navigation, browser shows blank HTML → React hydrates → content appears (100-200ms flash)

## Solution: SSR-Compatible React Components + ClientRouter

### Step 1: Audit each component for SSR compatibility
Components to fix (each needs full UI render at build time):
- `HomeClient.tsx`
- `BreatheClient.tsx`
- `MeditateClient.tsx`
- `SleepClient.tsx`
- `SettingsClient.tsx`
- `MusicBrowser.tsx`

**Pattern to find and fix:**
```tsx
// BAD — renders nothing at build time
const [locale, setLocale] = useState(() => {
  if (typeof window === 'undefined') return 'en'  // this causes SSR to differ
  return localStorage.getItem('vesper-locale') ?? 'en'
})

// GOOD — renders with default, updates in useEffect
const [locale, setLocale] = useState('en')
useEffect(() => {
  const stored = localStorage.getItem('vesper-locale')
  if (stored) setLocale(stored)
}, [])
```

### Step 2: Re-enable ClientRouter
```astro
// AppLayout.astro
import { ClientRouter } from 'astro:transitions'
<ClientRouter />
```

No crossfade animation — instant swap:
```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}
```

### Step 3: The result
- Astro builds static HTML with full React content pre-rendered
- ClientRouter swaps HTML instantly (no network fetch on cached pages)
- Pre-rendered content is immediately visible
- React hydrates on top of existing DOM (invisible — no visual change)
- Tab switching feels native — zero flash

### Step 4 (bonus): Service Worker pre-caching
- Precache all tab pages at install time
- Navigation serves from cache — zero network latency
- Enables offline PWA

## Components audit checklist
- [ ] HomeClient — check useLocale, localStorage reads
- [ ] BreatheClient — check useLocale
- [ ] MeditateClient — check useLocale, category filter state
- [ ] SleepClient — check useLocale
- [ ] SettingsClient — check theme/locale reads
- [ ] MusicBrowser — check useLocale
- [ ] useLocale hook — this is probably the root cause (reads localStorage in useState initializer)

### Additional CSS hardening
```css
/* Prevent white flash — background on html, not just body */
html { background-color: var(--bg); }

/* Zero-JS baseline for modern browsers */
@view-transition { navigation: auto; }
```

### Key insight from research
The `useLocale` hook is almost certainly the root cause. It reads `localStorage` in the `useState` initializer, which means:
- Server: returns 'en' (no window)
- Client: returns whatever's in localStorage
- If they differ → React hydration mismatch → content flashes

Fix the hook, fix the flash. Everything else is polish.

## Research sources
- Astro View Transitions: https://docs.astro.build/en/guides/view-transitions/
- Astro Islands SSR: https://docs.astro.build/en/concepts/islands/
- React hydration: components must render identical HTML on server and client
