"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "success" | "error";

export type Toast = {
  id: number;
  title: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (opts: { title: string; variant?: ToastVariant }) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

/**
 * App-wide toast state. Pair with <Toaster /> (which renders the stack) and the
 * useToast() hook. Non-blocking, replaces alert() for transient feedback.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, variant = "success" }: { title: string; variant?: ToastVariant }) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, title, variant }]);
    },
    [],
  );

  const value = useMemo(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast يجب استخدامه داخل ToastProvider");
  }
  return { toast: ctx.toast };
}

/** Internal accessor used by <Toaster />. */
export function useToastStore() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastStore يجب استخدامه داخل ToastProvider");
  }
  return ctx;
}
