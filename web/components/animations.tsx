"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered list animation wrapper
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className,
  staggerDelay = 0.05 
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
          }
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in animation
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = "up",
  className 
}: FadeInProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scale animation for cards/buttons
interface ScaleOnHoverProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({ children, scale = 1.02, className }: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover effect
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ 
        y: -4,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for alerts/notifications
export function PulseAnimation({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Slide in from side
interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right";
  className?: string;
}

export function SlideIn({ children, direction = "right", className }: SlideInProps) {
  const xOffset = direction === "right" ? 100 : -100;
  
  return (
    <motion.div
      initial={{ x: xOffset, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: xOffset, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Number counter animation
interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
}

export function CountUp({ end, duration = 2, className }: CountUpProps) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {end}
      </motion.span>
    </motion.span>
  );
}
