import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'

// ─── Page Transition ─────────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Stagger List ────────────────────────────────────────────────────────────
export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// ─── Stagger Item ────────────────────────────────────────────────────────────
// Items visible on page load: no animation (already in place).
// Items below the fold: subtle fade+slide on scroll into view.
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [animate, setAnimate] = useState(false)
  const wasAboveFold = useRef(true)

  useEffect(function setupReveal() {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      // Already visible — no animation needed
      wasAboveFold.current = true
      return
    }

    // Below fold — set up scroll reveal
    wasAboveFold.current = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className ?? ''} ${!wasAboveFold.current && !animate ? 'scroll-reveal-pending' : ''} ${animate ? 'scroll-reveal-active' : ''}`}
      role={role}
    >
      {children}
    </div>
  )
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={className}>{children}</div>
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
