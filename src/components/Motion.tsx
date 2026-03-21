import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

// ─── All list animation handled by vanilla Motion JS in AppLayout.astro ──────
// React components are plain divs. The Astro <script> uses motion's
// animate() + stagger() + inView() on the DOM directly — no hydration conflict.

export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={`stagger-item ${className ?? ''}`} role={role}>{children}</div>
}

export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={`fade-item ${className ?? ''}`}>{children}</div>
}

// ─── Tab Content — Framer Motion for within-page animation ───────────────────
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
