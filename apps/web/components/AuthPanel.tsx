"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { authClient } from "@/lib/auth-client";
import { inputClass, labelClass } from "@/lib/ui";

type Mode = "signin" | "signup";

type AuthError = { code?: string; message?: string; status?: number };

/** Map a Better Auth error to a clear Arabic message. */
function authErrorMessage(err: AuthError | undefined): string {
  const code = err?.code ?? "";
  const byCode: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    INVALID_PASSWORD: "كلمة المرور غير صحيحة",
    USER_NOT_FOUND: "لا يوجد حساب بهذا البريد",
    USER_ALREADY_EXISTS: "هذا البريد مسجّل مسبقاً — جرّب تسجيل الدخول",
    EMAIL_ALREADY_EXISTS: "هذا البريد مسجّل مسبقاً — جرّب تسجيل الدخول",
    PASSWORD_TOO_SHORT: "كلمة المرور قصيرة (٨ أحرف على الأقل)",
    PASSWORD_TOO_LONG: "كلمة المرور طويلة جداً",
    INVALID_EMAIL: "البريد الإلكتروني غير صالح",
    EMAIL_NOT_VERIFIED: "يجب تأكيد بريدك الإلكتروني أولاً",
  };
  if (byCode[code]) return byCode[code];
  const msg = (err?.message ?? "").toLowerCase();
  if (err?.status === 403 || msg.includes("origin")) {
    return "تعذّر تسجيل الدخول لأسباب تقنية (أصل الطلب غير موثوق). حدّث الصفحة وحاول مجدداً.";
  }
  if (err?.status === 429) return "محاولات كثيرة، انتظر قليلاً ثم أعد المحاولة";
  return "تعذّر تسجيل الدخول، حاول مرة أخرى";
}

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
        setError(authErrorMessage(result.error));
      }
    } catch {
      // Network / server unreachable (not an auth rejection).
      setError("تعذّر الاتصال بالخادم، تحقّق من اتصالك وحاول مجدداً");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-ink-muted">جارٍ التحميل…</p>;

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-card bg-surface-muted p-4">
          <span
            aria-hidden
            className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-brand-500/15 text-accent-ink"
          >
            <span className="ms text-[1.5rem]">account_circle</span>
          </span>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-ink">
              أهلاً {currentUser?.name ?? ""}
            </span>
            <span className="text-sm text-ink-muted">
              صلاحية: {currentUser?.role ?? "—"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill border border-line px-5 py-2.5 font-medium text-ink transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <span className="ms text-[1.25rem]" aria-hidden>
            logout
          </span>
          تسجيل الخروج
        </button>
      </div>
    );
  }

  const iconInputClass = `${inputClass} ps-11`;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-bold text-ink">
          {mode === "signup" ? "أنشئ حسابك" : "مرحباً بعودتك"}
        </h2>
        <p className="text-sm text-ink-muted">
          {mode === "signup"
            ? "سجّل لتحفظ مطاعمك المفضلة وتضيف أماكن جديدة"
            : "سجّل دخولك لمتابعة نشاطك"}
        </p>
      </div>

      {/* Segmented control */}
      <div
        role="tablist"
        aria-label="نوع الحساب"
        className="grid grid-cols-2 gap-1 rounded-pill bg-surface-muted p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => setMode("signin")}
          className={`cursor-pointer rounded-pill px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            mode === "signin"
              ? "bg-brand-500 text-on-accent"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          دخول
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => setMode("signup")}
          className={`cursor-pointer rounded-pill px-4 py-2 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
            mode === "signup"
              ? "bg-brand-500 text-on-accent"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          حساب جديد
        </button>
      </div>

      {mode === "signup" && (
        <label className={labelClass}>
          الاسم
          <span className="relative block">
            <span
              aria-hidden
              className="ms pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-[1.25rem] text-ink-muted"
            >
              person
            </span>
            <input
              type="text"
              placeholder="اسمك الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={iconInputClass}
            />
          </span>
        </label>
      )}

      <label className={labelClass}>
        البريد الإلكتروني
        <span className="relative block">
          <span
            aria-hidden
            className="ms pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-[1.25rem] text-ink-muted"
          >
            mail
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={iconInputClass}
          />
        </span>
      </label>

      <label className={labelClass}>
        كلمة المرور
        <span className="relative block">
          <span
            aria-hidden
            className="ms pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-[1.25rem] text-ink-muted"
          >
            lock
          </span>
          <input
            type="password"
            placeholder="٨ أحرف على الأقل"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={iconInputClass}
          />
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-card bg-brand-500/10 p-3 text-sm font-medium text-accent-ink"
        >
          <span className="ms shrink-0 text-[1.25rem]" aria-hidden>
            error
          </span>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-pill bg-brand-500 px-5 py-2.5 font-bold text-on-accent transition hover:bg-brand-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {busy && (
          <span
            aria-hidden
            className="ms animate-spin text-[1.25rem] motion-reduce:animate-none"
          >
            progress_activity
          </span>
        )}
        {busy
          ? "جارٍ…"
          : mode === "signup"
            ? "إنشاء حساب"
            : "دخول"}
      </button>
    </form>
  );
}
