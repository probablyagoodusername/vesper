import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

// Page-level wrapper — no animation (Astro View Transition handles page crossfade)
export function PageTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}

// List container — no stagger animation
export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// List item — no animation
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return <div className={className} role={role}>{children}</div>
}

// Tab content crossfade (within a page, not a page transition)
export function TabContent({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Pressable scale (for buttons)
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

// Fade in section (for specific elements that need delayed reveal)
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  )
}
