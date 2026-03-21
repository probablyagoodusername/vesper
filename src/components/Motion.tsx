import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

// Page-level fade in — fast, no delay
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.div>
  )
}

// Staggered list container — tight stagger
export function StaggerList({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <motion.div
      className={className}
      role={role}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.02 } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Individual list item — minimal motion
export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <motion.div
      className={className}
      role={role}
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.15 } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Tab content crossfade
export function TabContent({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
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
      transition={{ duration: 0.08 }}
    >
      {children}
    </motion.button>
  )
}

// Fade in section
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay }}
    >
      {children}
    </motion.div>
  )
}
