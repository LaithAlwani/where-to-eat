import type { RestaurantProfile } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type Menu = NonNullable<RestaurantProfile["menu"]>;

/** Renders menu sections and their items with Arabic-formatted prices. */
export function RestaurantMenu({ menu }: { menu: Menu }) {
  return (
    <div className="flex flex-col gap-6">
      {menu.map((section, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-brand-600">{section.nameAr}</h3>
          <ul className="flex flex-col divide-y divide-ink/5">
            {section.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="flex items-start justify-between gap-4 py-2"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink">{item.nameAr}</span>
                  {item.nameEn && (
                    <span className="text-xs text-ink-muted" dir="ltr">
                      {item.nameEn}
                    </span>
                  )}
                  {item.descriptionAr && (
                    <span className="text-sm text-ink-muted">
                      {item.descriptionAr}
                    </span>
                  )}
                </div>
                {item.price !== undefined && (
                  <span className="shrink-0 font-medium text-accent-700">
                    {formatPrice(item.price, item.currency)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
