import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

// ─── Page Transition ─────────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Stagger List ────────────────────────────────────────────────────────────
// Plain wrapper — individual items handle their own reveal via IntersectionObserver
export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// ─── Stagger Item ────────────────────────────────────────────────────────────
// Reveals with a slide-up when scrolled into view.
// Items already in viewport on load get a staggered delay based on DOM order.
// SSR: fully visible (no opacity:0). Animation is additive — enhances, never hides.

export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(function observeEntry() {
    const el = ref.current
    if (!el) return

    // Items already above the fold: stagger by DOM index
    const rect = el.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight

    if (inViewport) {
      // Count preceding siblings to compute stagger delay
      let index = 0
      let sibling = el.previousElementSibling
      while (sibling) {
        index++
        sibling = sibling.previousElementSibling
      }
      const delay = index * 50 // 50ms stagger
      setTimeout(() => setRevealed(true), delay)
      return
    }

    // Items below fold: reveal on scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className ?? ''} stagger-reveal ${revealed ? 'revealed' : ''}`}
      role={role}
    >
      {children}
    </div>
  )
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
// Same pattern — visible in SSR, animates after mount with optional delay
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [active, setActive] = useState(false)

  useEffect(function triggerFade() {
    const timeout = setTimeout(() => setActive(true), delay * 1000)
    return () => clearTimeout(timeout)
  }, [delay])

  return (
    <div className={`${className ?? ''} fade-reveal ${active ? 'revealed' : ''}`}>
      {children}
    </div>
  )
}

// ─── Tab Content ─────────────────────────────────────────────────────────────
export function TabContent({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Pressable ───────────────────────────────────────────────────────────────
export function Pressable({ children, className, onClick, style, disabled, title }: {
  children: ReactNode
  className?: string
  onClick?: () => void
  style?: CSSProperties
  disabled?: boolean
  title?: string
}) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      style={style}
      disabled={disabled}
      title={title}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  )
}
