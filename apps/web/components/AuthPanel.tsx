"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend";
import { authClient } from "@/lib/auth-client";

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
        className="rounded-pill bg-brand-500 px-5 py-2 text-on-accent disabled:opacity-50"
      >
        {mode === "signup" ? "إنشاء حساب" : "دخول"}
      </button>
    </form>
  );
}
