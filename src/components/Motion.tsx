import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Children, cloneElement, isValidElement } from 'react'
import type { ReactNode, ReactElement } from 'react'

// ─── Stagger List ────────────────────────────────────────────────────────────
// SSR: renders all children visible. After hydration: replays a stagger animation.
// Uses CSS custom property --i for per-item delay — no opacity:0 in SSR HTML.

export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(function triggerStagger() {
    // Small delay so the browser paints the SSR content first
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className={`${className ?? ''} ${mounted ? 'stagger-active' : ''}`} role={role}>
      {Children.map(children, (child, i) => {
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<Record<string, unknown>>, {
            style: { ...((child.props as Record<string, unknown>).style as object ?? {}), '--i': i } as React.CSSProperties,
          })
        }
        return child
      })}
    </div>
  )
}

// Stagger item — the actual animated element
export function StaggerItem({ children, className, role, style }: {
  children: ReactNode
  className?: string
  role?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`stagger-item ${className ?? ''}`} role={role} style={style}>
      {children}
    </div>
  )
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
// SSR: visible. After mount: plays a fade animation.

export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(function triggerFade() {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={`${className ?? ''} ${mounted ? 'fade-active' : ''}`}
      style={{ '--fade-delay': `${delay}s` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// ─── Page Transition ─────────────────────────────────────────────────────────
// Passthrough — View Transition API handles page swap
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Tab Content ─────────────────────────────────────────────────────────────
// Crossfade on key change only (initial={false} skips first render animation)
export function TabContent({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
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
  style?: React.CSSProperties
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
