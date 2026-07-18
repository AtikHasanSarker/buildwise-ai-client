"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  hover = true,
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -4, boxShadow: "var(--shadow-elevated)" }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        rounded-xl bg-surface shadow-soft
        ${paddingMap[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
