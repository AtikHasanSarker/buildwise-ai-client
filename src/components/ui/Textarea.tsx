"use client";

import { forwardRef, useState, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const { label, error, className = "", id, ...rest } = props;
    const [focused, setFocused] = useState(false);
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
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
            text-sm text-text-primary outline-none resize-y min-h-[80px]
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
  }
);

Textarea.displayName = "Textarea";
