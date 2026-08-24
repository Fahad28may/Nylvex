"use client";

import { motion } from "framer-motion";
import { revealTransition } from "@/lib/motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={revealTransition(delay)}
    >
      {children}
    </motion.div>
  );
}
