"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

const THEME_EVENT = "wn:themechange";

/** Read the live theme off <html> (client). */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** SSR/hydration snapshot — matches the default applied in layout. */
function getServerSnapshot(): Theme {
  return "dark";
}

/** Re-render when the theme flips (our toggle dispatches THEME_EVENT). */
function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

/** Dark/light theme toggle. Persists to localStorage; default dark. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore (private mode / disabled storage)
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="تبديل المظهر"
      className={`flex size-11 cursor-pointer items-center justify-center rounded-pill border border-line text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${className}`}
    >
      <span className="ms text-[1.375rem]" aria-hidden>
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
