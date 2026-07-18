"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { label, error, className = "", id, ...rest } = props;
  const [focused, setFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        className={`
          w-full rounded-lg border bg-surface-2 px-3 py-2.5
          text-sm text-text-primary outline-none
          transition-all duration-200
          placeholder:text-text-secondary/60
          ${
            error
              ? "border-error focus:border-error focus:ring-1 focus:ring-error/30"
              : focused
              ? "border-primary ring-1 ring-primary/20"
              : "border-border hover:border-text-secondary/40"
          }
          ${className}
        `}
        {...rest}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";
