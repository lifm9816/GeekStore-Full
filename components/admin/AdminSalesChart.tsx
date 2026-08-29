/**
 * Barras de ventas últimos 7 días (mockup 07) — CSS puro, color accent.
 */

import type { SalesDay } from "@/lib/admin-dashboard";

type AdminSalesChartProps = {
  title: string;
  days: SalesDay[];
  emptyLabel: string;
  formatMoney: (value: number) => string;
};

export function AdminSalesChart({
  title,
  days,
  emptyLabel,
  formatMoney,
}: AdminSalesChartProps) {
  const max = Math.max(...days.map((day) => day.total), 0);

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
      <h2 className="mb-4 text-[15px] font-bold">{title}</h2>
      {max <= 0 ? (
        <p className="text-sm text-gs-muted">{emptyLabel}</p>
      ) : (
        <div
          className="flex h-40 items-end justify-between gap-2"
          role="img"
          aria-label={title}
        >
          {days.map((day) => {
            const heightPct = max > 0 ? Math.max(8, (day.total / max) * 100) : 8;

            return (
              <div
                key={day.dateKey}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full max-w-8 rounded-t-md bg-gs-accent"
                  style={{ height: `${heightPct}%` }}
                  title={formatMoney(day.total)}
                />
                <span className="text-[11px] font-bold text-gs-muted">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
