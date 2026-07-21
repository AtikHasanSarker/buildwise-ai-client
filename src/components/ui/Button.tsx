"use client";

import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "ss"| "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-soft hover:shadow-glow-primary hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
  secondary:
    "bg-transparent border border-border text-text-primary hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
  ghost:
    "bg-transparent text-text-primary hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs",
  ss: "px-4 py-3 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      children,
      className = "",
      disabled,
      ...rest
    } = props;
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2 rounded-full font-semibold
          transition-all duration-200 outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...rest}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
