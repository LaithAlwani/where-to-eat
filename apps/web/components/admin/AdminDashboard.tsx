"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@repo/backend";
import { ModerationTab } from "./ModerationTab";
import { UsersTab } from "./UsersTab";
import { TaxonomyTab } from "./TaxonomyTab";

type Tab = "moderation" | "users" | "taxonomy";

const TABS: { id: Tab; label: string }[] = [
  { id: "moderation", label: "المراجعة" },
  { id: "users", label: "المستخدمون" },
  { id: "taxonomy", label: "التصنيفات" },
];

/** Admin dashboard shell: admin-gated, with a tab bar over the three tools. */
export function AdminDashboard() {
  const isAdmin = useQuery(api.admin.isAdmin);
  const [tab, setTab] = useState<Tab>("moderation");

  if (isAdmin === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-9 w-48 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-10 w-full max-w-sm animate-pulse rounded-pill bg-surface-muted" />
        <div className="h-64 w-full animate-pulse rounded-card bg-surface-muted" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface-muted px-6 py-16 text-center">
        <span aria-hidden className="text-4xl">
          🔒
        </span>
        <p className="text-lg font-medium text-ink">
          هذه الصفحة للمشرفين فقط
        </p>
        <Link
          href="/"
          className="rounded-pill bg-brand-500 px-6 py-2 font-medium text-white transition hover:bg-brand-600"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">لوحة الإدارة</h1>

      <div
        role="tablist"
        aria-label="أقسام الإدارة"
        className="flex flex-wrap gap-2"
      >
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`rounded-pill px-5 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-500 text-white"
                  : "bg-surface text-ink-muted ring-1 ring-ink/10 hover:bg-surface-muted"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === "moderation" && <ModerationTab />}
        {tab === "users" && <UsersTab />}
        {tab === "taxonomy" && <TaxonomyTab />}
      </div>
    </div>
  );
}
