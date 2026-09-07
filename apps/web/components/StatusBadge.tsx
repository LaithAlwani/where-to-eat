type RestaurantStatus = "pending" | "published" | "rejected" | "closed";
type ClaimStatus = "pending" | "approved" | "rejected";

type StatusBadgeProps = {
  status: RestaurantStatus | ClaimStatus;
};

const LABELS: Record<RestaurantStatus | ClaimStatus, string> = {
  pending: "قيد المراجعة",
  published: "منشور",
  approved: "مقبول",
  rejected: "مرفوض",
  closed: "مغلق",
};

const TONE: Record<RestaurantStatus | ClaimStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  published: "bg-accent-50 text-accent-700",
  approved: "bg-accent-50 text-accent-700",
  rejected: "bg-red-100 text-red-700",
  closed: "bg-surface-muted text-ink-muted",
};

/** Arabic status pill for restaurants and business claims. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-pill px-2.5 py-0.5 text-xs font-medium ${TONE[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
