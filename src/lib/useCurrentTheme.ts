"use client";

import { useState, useEffect } from "react";

/**
 * Reads the current theme from the `.dark` class on `<html>`.
 * Updates instantly when ThemeToggle flips the class — no page refresh.
 */
export function useCurrentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    function read() {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }

    // sync on mount
    setTheme(read());

    // watch for class mutations on <html> (triggered by ThemeToggle)
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
