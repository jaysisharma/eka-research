"use client";

import { motion, type Variants, type Transition } from "framer-motion";
import { type ReactNode } from "react";

/* ── Shared easing ── */
const ease = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   All components use `whileInView` instead of `useInView`.
   This reliably fires even when the element is already in the
   viewport on mount — fixing the "disappears on back-nav" bug.
   ───────────────────────────────────────────────────────────── */

/* ── FadeUp ── */
interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, duration = 0.6, className }: FadeUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration, delay, ease } as Transition}
    >
      {children}
    </motion.div>
  );
}

/* ── FadeIn ── */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.7, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration, delay, ease: "easeOut" } as Transition}
    >
      {children}
    </motion.div>
  );
}

/* ── SlideIn ── */
interface SlideInProps {
  children: ReactNode;
  from?: "left" | "right";
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideIn({ children, from = "left", delay = 0, duration = 0.65, className }: SlideInProps) {
  const x = from === "left" ? -40 : 40;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration, delay, ease } as Transition}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger list + item ── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

interface StaggerListProps {
  children: ReactNode;
  className?: string;
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.05 }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/* ── ScaleIn ── */
interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className }: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.93, y: 16 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.55, delay, ease } as Transition}
    >
      {children}
    </motion.div>
  );
}
