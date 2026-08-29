"use client";

/**
 * Resumen del mockup 12: barra de envío gratis (umbral $4,000 / envío $99),
 * subtotal, total y puente a /checkout (Días 8-9).
 */

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CartTotals } from "@/lib/cart";

type CartSummaryProps = {
  totals: CartTotals;
};

export function CartSummary({ totals }: CartSummaryProps) {
  const t = useTranslations("cart");
  const format = useFormatter();
  const money = (value: number) =>
    format.number(value, { style: "currency", currency: "MXN" });

  return (
    <aside className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
      <h2 className="mb-4 text-lg font-extrabold">{t("summary")}</h2>

      <div className="mb-4">
        <p className="mb-1.5 text-xs text-gs-muted">
          {totals.qualifiesForFreeShipping
            ? t("freeShippingUnlocked")
            : t("freeShippingRemaining", {
                amount: money(totals.remainingForFreeShipping),
              })}
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-gs-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(totals.progressPercent)}
          aria-label={t("freeShippingBar")}
        >
          <div
            className="h-full rounded-full bg-gs-accent transition-[width]"
            style={{ width: `${totals.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mb-2 flex justify-between text-[13px] text-gs-muted">
        <span>{t("subtotalItems", { count: totals.itemCount })}</span>
        <span>{money(totals.subtotal)}</span>
      </div>
      <div className="mb-3.5 flex justify-between text-[13px] text-gs-muted">
        <span>{t("shipping")}</span>
        <span>
          {totals.qualifiesForFreeShipping
            ? t("shippingFree")
            : money(totals.shipping)}
        </span>
      </div>
      <hr className="my-3.5 border-gs-border" />
      <div className="mb-[18px] flex justify-between text-xl font-extrabold">
        <span>{t("total")}</span>
        <span>{money(totals.total)}</span>
      </div>

      <Link
        href="/checkout"
        className="mb-2.5 inline-flex w-full items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
      >
        {t("checkout")}
      </Link>
      <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-gs-muted">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-[13px] w-[13px]"
          aria-hidden="true"
        >
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 018 0v3" />
        </svg>
        {t("secureStripe")}
      </p>
    </aside>
  );
}
