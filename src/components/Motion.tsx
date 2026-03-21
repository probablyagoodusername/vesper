import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import type { ReactNode, CSSProperties } from 'react'

// Without ClientRouter, every page load is a "first load" (full HTML)
// Stagger animations always play since SSR content is visible immediately
const isFirstLoad = false

// ─── Page Transition ─────────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Stagger List ────────────────────────────────────────────────────────────
// First page load: no animation (SSR content already visible)
// Client navigation: stagger animation plays

export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const [active, setActive] = useState(false)
  const wasFirstLoad = useRef(isFirstLoad)

  useEffect(function maybeStagger() {
    if (wasFirstLoad.current) return // SSR content is already showing — don't re-animate
    requestAnimationFrame(() => setActive(true))
  }, [])

  return (
    <div className={`${className ?? ''} ${active ? 'stagger-active' : ''}`} role={role}>
      {children}
    </div>
  )
}

// ─── Stagger Item ────────────────────────────────────────────────────────────
let itemCounter = 0
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const [index] = useState(() => itemCounter++)

  useEffect(() => {
    return () => { itemCounter = 0 }
  }, [])

  return (
    <div
      className={`stagger-item ${className ?? ''}`}
      role={role}
      style={{ '--i': index } as CSSProperties}
    >
      {children}
    </div>
  )
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const wasFirstLoad = useRef(isFirstLoad)
  const [active, setActive] = useState(false)

  useEffect(function maybeFade() {
    if (wasFirstLoad.current) return
    requestAnimationFrame(() => setActive(true))
  }, [])

  return (
    <div
      className={`${className ?? ''} ${active ? 'fade-active' : ''}`}
      style={{ '--fade-delay': `${delay}s` } as CSSProperties}
    >
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
