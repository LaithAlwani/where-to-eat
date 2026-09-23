import type { ReactNode } from "react";

/**
 * Single page shell for consistent max width, horizontal padding, and
 * start-alignment across every route. Use it as the top-level wrapper of every
 * page's content so pages don't drift to different widths/margins.
 */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 ${className}`}
    >
      {children}
    </div>
  );
}
