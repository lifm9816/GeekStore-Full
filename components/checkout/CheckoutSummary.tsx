"use client";

/**
 * Resumen de orden del mockup 02. Totales vía cartTotals (mismo umbral
 * de envío gratis que el carrito — lib/cart.ts).
 */

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import type { CartLine, CartTotals } from "@/lib/cart";

type CheckoutSummaryProps = {
  lines: CartLine[];
  totals: CartTotals;
  pending?: boolean;
  error?: string;
};

export function CheckoutSummary({
  lines,
  totals,
  pending = false,
  error,
}: CheckoutSummaryProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const format = useFormatter();
  const money = (value: number) =>
    format.number(value, { style: "currency", currency: "MXN" });

  return (
    <aside className="rounded-[10px] border border-gs-border bg-gs-surface p-5 lg:sticky lg:top-24">
      <h2 className="mb-4 text-[15px] font-bold">{t("summaryTitle")}</h2>

      <ul className="mb-4 flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.productId} className="flex gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={line.coverImageUrl}
                alt={tCart("coverAlt", {
                  name: line.name,
                  brand: line.brandName,
                })}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{line.name}</p>
              <p className="text-[12px] text-gs-muted">
                {t("lineMeta", {
                  quantity: line.quantity,
                  price: money(line.price),
                })}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold">
              {money(line.price * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mb-2 flex justify-between text-[13px] text-gs-muted">
        <span>{tCart("subtotalItems", { count: totals.itemCount })}</span>
        <span>{money(totals.subtotal)}</span>
      </div>
      <div className="mb-3.5 flex justify-between text-[13px] text-gs-muted">
        <span>{tCart("shipping")}</span>
        <span>
          {totals.qualifiesForFreeShipping
            ? tCart("shippingFree")
            : money(totals.shipping)}
        </span>
      </div>
      <hr className="my-3.5 border-gs-border" />
      <div className="mb-4 flex justify-between text-xl font-extrabold">
        <span>{tCart("total")}</span>
        <span>{money(totals.total)}</span>
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-sm text-gs-critical">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mb-2.5 inline-flex w-full items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:opacity-80"
      >
        {pending ? t("confirming") : t("confirmPay")}
      </button>
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
        {tCart("secureStripe")}
      </p>
    </aside>
  );
}
