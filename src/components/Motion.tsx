import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] // Apple-style ease-out

// ─── Page Transition ─────────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Stagger List ────────────────────────────────────────────────────────────
// SSR: renders children visible. After mount: replays stagger via Framer Motion.
// initial={false} on mount → no opacity:0 in SSR HTML.
// After hydration, we flip a key to trigger the enter animation.

export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const [animationKey, setAnimationKey] = useState(0)

  useEffect(function triggerStagger() {
    requestAnimationFrame(() => setAnimationKey(1))
  }, [])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animationKey}
        className={className}
        role={role}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.06, delayChildren: 0.05 },
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Stagger Item ────────────────────────────────────────────────────────────
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <motion.div
      className={className}
      role={role}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const [mounted, setMounted] = useState(false)

  useEffect(function triggerFade() {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  return (
    <motion.div
      className={className}
      initial={false}
      animate={mounted ? { opacity: 1 } : undefined}
      transition={{ duration: 0.5, delay, ease }}
    >
      {children}
    </motion.div>
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
        transition={{ duration: 0.2, ease }}
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
