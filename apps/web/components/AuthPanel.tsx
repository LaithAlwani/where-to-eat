"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { t } from "@repo/shared/i18n";
import { authClient } from "@/lib/auth-client";

type Mode = "signin" | "signup";

/**
 * Minimal email/password auth panel proving the Better Auth wiring. Errors are
 * shown inline (never via native alert), matching the project error-handling
 * standard. On success we lazily create the domain profile row.
 */
export function AuthPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip",
  );
  const ensureUser = useMutation(api.users.ensureCurrentUser);

  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Create the domain profile row only AFTER the Convex client is actually
  // authenticated (the token propagates a beat after sign-in) — calling it
  // eagerly races ahead of auth and throws `unauthenticated`.
  const ensuredRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated) {
      ensuredRef.current = false;
      return;
    }
    if (ensuredRef.current) return;
    ensuredRef.current = true;
    ensureUser({}).catch(() => {
      ensuredRef.current = false;
    });
  }, [isAuthenticated, ensureUser]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "signup"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? t("error.unknown"));
      }
    } catch {
      setError(t("error.unknown"));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-ink-muted">جارٍ التحميل…</p>;

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span>
          أهلاً {currentUser?.name ?? ""} · صلاحية: {currentUser?.role ?? "—"}
        </span>
        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="rounded-pill border border-ink-muted px-4 py-1"
        >
          تسجيل الخروج
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-3">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "font-bold text-brand-600" : ""}
        >
          حساب جديد
        </button>
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={mode === "signin" ? "font-bold text-brand-600" : ""}
        >
          تسجيل الدخول
        </button>
      </div>

      {mode === "signup" && (
        <input
          type="text"
          placeholder="الاسم"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-ink-muted px-3 py-2"
        />
      )}
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded-lg border border-ink-muted px-3 py-2"
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
        className="rounded-lg border border-ink-muted px-3 py-2"
      />

      {error && <p className="text-sm text-brand-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-pill bg-brand-500 px-5 py-2 text-white disabled:opacity-50"
      >
        {mode === "signup" ? "إنشاء حساب" : "دخول"}
      </button>
    </form>
  );
}
