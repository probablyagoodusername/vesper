import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

// ─── Page Transition ─────────────────────────────────────────────────────────
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// ─── Stagger List ────────────────────────────────────────────────────────────
// Plain div — SSR content is already visible, no animation needed
export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// ─── Stagger Item ────────────────────────────────────────────────────────────
// Plain div — content renders from SSR, no hide/show cycle
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// ─── Fade In ─────────────────────────────────────────────────────────────────
// Plain div — SSR content already visible
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={className}>{children}</div>
}

// ─── Tab Content ─────────────────────────────────────────────────────────────
// Crossfade on key change only (e.g. category filter switch)
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
