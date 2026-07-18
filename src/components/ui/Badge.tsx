import { type ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "ai" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-surface-2 text-text-secondary border border-border",
  accent:
    "bg-accent/15 text-accent border border-accent/30",
  ai: "text-white border-0",
  success:
    "bg-success/15 text-success border border-success/30",
  warning:
    "bg-warning/15 text-warning border border-warning/30",
  error:
    "bg-error/15 text-error border border-error/30",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  if (variant === "ai") {
    return (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full px-3 py-1
          text-xs font-semibold
          bg-gradient-to-r from-primary to-purple-600
          ${className}
        `}
      >
        ✨ {children}
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
