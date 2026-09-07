/** Loading placeholder for the restaurant profile page. */
export function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-56 w-full rounded-card bg-surface-muted sm:h-72" />
      <div className="h-8 w-2/3 rounded bg-surface-muted" />
      <div className="h-4 w-1/3 rounded bg-surface-muted" />
      <div className="flex gap-2">
        <div className="h-10 w-28 rounded-pill bg-surface-muted" />
        <div className="h-10 w-28 rounded-pill bg-surface-muted" />
        <div className="h-10 w-28 rounded-pill bg-surface-muted" />
      </div>
      <div className="h-24 w-full rounded-card bg-surface-muted" />
    </div>
  );
}
