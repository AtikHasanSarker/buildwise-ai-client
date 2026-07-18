"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const typeConfig: Record<
  ToastType,
  { border: string; icon: typeof CheckCircle; iconColor: string }
> = {
  success: { border: "border-success", icon: CheckCircle, iconColor: "text-success" },
  error: { border: "border-error", icon: AlertCircle, iconColor: "text-error" },
  warning: { border: "border-warning", icon: AlertTriangle, iconColor: "text-warning" },
  info: { border: "border-primary", icon: Info, iconColor: "text-primary" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const cfg = typeConfig[t.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 80, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  pointer-events-auto flex items-start gap-3
                  rounded-xl px-4 py-3 shadow-elevated border-l-4
                  bg-surface ${cfg.border}
                `}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
                <p className="text-sm text-text-primary flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-text-secondary hover:text-text-primary shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
