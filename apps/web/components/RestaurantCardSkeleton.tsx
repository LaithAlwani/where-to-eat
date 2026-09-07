/** Loading placeholder matching RestaurantCard's shape. */
export function RestaurantCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-card bg-surface shadow-sm ring-1 ring-ink/5">
      <div className="aspect-[4/3] w-full bg-surface-muted" />
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded bg-surface-muted" />
        <div className="h-3 w-1/2 rounded bg-surface-muted" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-3 w-24 rounded bg-surface-muted" />
          <div className="h-3 w-10 rounded bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
