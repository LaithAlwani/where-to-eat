import { toEasternArabicDigits } from "@repo/shared/arabic";
import type { RestaurantProfile } from "@/lib/types";

const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

type Hours = NonNullable<RestaurantProfile["hours"]>;

/** Weekly opening hours, mapping day numbers 0-6 to Arabic day names. */
export function OpeningHours({ hours }: { hours: Hours }) {
  return (
    <ul className="flex flex-col divide-y divide-ink/5">
      {hours.map((entry) => (
        <li
          key={entry.day}
          className="flex items-center justify-between gap-4 py-2"
        >
          <span className="font-medium text-ink">
            {DAY_NAMES[entry.day] ?? `يوم ${toEasternArabicDigits(entry.day)}`}
          </span>
          <span className="text-ink-muted">
            {entry.closed || !entry.open || !entry.close ? (
              <span className="text-brand-600">مغلق</span>
            ) : (
              <span dir="ltr">
                {toEasternArabicDigits(entry.open)} –{" "}
                {toEasternArabicDigits(entry.close)}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
