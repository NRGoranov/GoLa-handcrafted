"use client";

import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** 40ms stagger, capped so a long group stays under 400ms. */
export default function RevealItem({
  index,
  className,
  asListItem = false,
  children
}: {
  index: number;
  className?: string;
  asListItem?: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const delay = Math.min(index, 7) * 0.04;
  const Tag = asListItem ? motion.li : motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduce ? 0 : 0.28,
        delay: reduce ? 0 : delay,
        ease: EASE
      }}
    >
      {children}
    </Tag>
  );
}
