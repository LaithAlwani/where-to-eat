"use client";

import type { ReactNode } from "react";
import { PendingRestaurantsQueue } from "./PendingRestaurantsQueue";
import { PendingClaimsQueue } from "./PendingClaimsQueue";
import { OpenReportsQueue } from "./OpenReportsQueue";

/** Moderation tab: three stacked queues (restaurants, claims, reports). */
export function ModerationTab() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="مطاعم بانتظار المراجعة">
        <PendingRestaurantsQueue />
      </Section>
      <Section title="طلبات الملكية">
        <PendingClaimsQueue />
      </Section>
      <Section title="البلاغات">
        <OpenReportsQueue />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
