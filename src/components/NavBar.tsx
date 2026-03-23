import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'

interface NavBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  largeTitle?: boolean
  titleSize?: 'small' | 'large'
  trailingAction?: {
    href?: string
    onClick?: () => void
    icon: ReactNode
    label: string
  }
}

export function NavBar({ title, subtitle, showBack = true, largeTitle = false, titleSize = 'small', trailingAction }: NavBarProps) {
  const [collapsed, setCollapsed] = useState(!largeTitle)
  const largeTitleRef = useRef<HTMLHeadingElement>(null)

  useEffect(function observeLargeTitle() {
    if (!largeTitle) return
    const el = largeTitleRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [largeTitle])

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/home'
    }
  }, [])

  return (
    <>
      {/* Progressive blur — 6 CSS layers, strongest at top */}
      <div className="progressive-blur">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>

      {/* Inline title — always visible for sub-pages, fades in on scroll for large-title pages */}
      <div
        className={`fixed left-0 right-0 z-40 flex items-center transition-opacity duration-200 ${
          titleSize === 'large' ? 'justify-start px-6' : 'justify-center'
        }`}
        style={{
          top: titleSize === 'large'
            ? 'calc(env(safe-area-inset-top, 0px) + 6px)'
            : 'calc(env(safe-area-inset-top, 0px) + 12px)',
          height: titleSize === 'large' ? '48px' : '40px',
          pointerEvents: 'none',
          opacity: collapsed ? 1 : 0,
        }}
      >
        <span className={`truncate font-semibold text-[var(--primary)] ${
          titleSize === 'large'
            ? 'max-w-[70vw] font-[family-name:var(--font-serif)] text-2xl'
            : 'max-w-[50vw] text-sm'
        }`}>
          {title}
        </span>
      </div>

      {/* Back button — glass circle */}
      {showBack && (
        <button
          onClick={goBack}
          className="fixed z-50 flex h-10 w-10 items-center justify-center rounded-full liquid-glass text-[var(--accent)] transition-all active:scale-95"
          style={{
            top: 'calc(12px + env(safe-area-inset-top, 0px))',
            left: '16px',
          }}
          aria-label="Back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Trailing action — glass circle */}
      {trailingAction && (
        trailingAction.href ? (
          <a
            href={trailingAction.href}
            className="fixed z-50 flex h-10 w-10 items-center justify-center rounded-full liquid-glass text-[var(--accent)] transition-all active:scale-95"
            style={{
              top: 'calc(12px + env(safe-area-inset-top, 0px))',
              right: '16px',
            }}
            aria-label={trailingAction.label}
          >
            {trailingAction.icon}
          </a>
        ) : (
          <button
            onClick={trailingAction.onClick}
            className="fixed z-50 flex h-10 w-10 items-center justify-center rounded-full liquid-glass text-[var(--accent)] transition-all active:scale-95"
            style={{
              top: 'calc(12px + env(safe-area-inset-top, 0px))',
              right: '16px',
            }}
            aria-label={trailingAction.label}
          >
            {trailingAction.icon}
          </button>
        )
      )}

      {/* Spacer — clears the blur zone so content loads below it */}
      <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 80px)' }} aria-hidden="true" />

      {/* Large title — in document flow, collapses into inline on scroll */}
      {largeTitle && (
        <div className="mb-6">
          <h1
            ref={largeTitleRef}
            className="font-[family-name:var(--font-serif)] text-3xl font-semibold text-[var(--primary)]"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
      )}
    </>
  )
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
