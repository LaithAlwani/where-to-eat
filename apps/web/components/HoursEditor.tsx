"use client";

export type HourRow = {
  day: number;
  open?: string;
  close?: string;
  closed?: boolean;
};

type HoursEditorProps = {
  value: HourRow[];
  onChange: (value: HourRow[]) => void;
};

const DAY_NAMES = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

/** Build a 7-row week (days 0-6), merging any existing rows. */
export function buildWeek(existing: HourRow[] | null | undefined): HourRow[] {
  return DAY_NAMES.map((_, day) => {
    const found = existing?.find((h) => h.day === day);
    return found ?? { day, closed: true };
  });
}

/**
 * Weekly opening-hours editor: 7 rows (الأحد..السبت), each with a "مغلق" toggle
 * and open/close time inputs. Fully controlled by the parent.
 */
export function HoursEditor({ value, onChange }: HoursEditorProps) {
  function update(day: number, patch: Partial<HourRow>) {
    onChange(value.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  }

  return (
    <div className="flex flex-col divide-y divide-ink/5">
      {value.map((row) => {
        const closed = row.closed ?? false;
        return (
          <div
            key={row.day}
            className="flex flex-wrap items-center gap-3 py-2.5"
          >
            <span className="w-16 font-medium text-ink">
              {DAY_NAMES[row.day]}
            </span>

            <label className="inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) =>
                  update(row.day, { closed: e.target.checked })
                }
                className="h-4 w-4 accent-brand-500"
              />
              مغلق
            </label>

            {!closed && (
              <div className="flex items-center gap-2" dir="ltr">
                <input
                  type="time"
                  value={row.open ?? ""}
                  onChange={(e) => update(row.day, { open: e.target.value })}
                  className="rounded-card border border-ink/10 bg-surface px-2 py-1 text-ink focus:border-brand-400 focus:outline-none"
                />
                <span className="text-ink-muted">–</span>
                <input
                  type="time"
                  value={row.close ?? ""}
                  onChange={(e) => update(row.day, { close: e.target.value })}
                  className="rounded-card border border-ink/10 bg-surface px-2 py-1 text-ink focus:border-brand-400 focus:outline-none"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
