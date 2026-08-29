"use client";

/**
 * Selector de cantidad en el detalle de producto. El techo es Product.stock,
 * la misma regla que handleQuantityChange del CRA y que el stepper del carrito.
 */

import { useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useId, useState } from "react";

type ProductPurchaseProps = {
  productId: string;
  stock: number;
  compact?: boolean;
};

export function ProductPurchase({
  productId,
  stock,
  compact = false,
}: ProductPurchaseProps) {
  const t = useTranslations("product");
  const qtyId = useId();
  const [quantity, setQuantity] = useState(stock > 0 ? 1 : 0);
  const soldOut = stock <= 0;

  function clamp(value: number) {
    if (stock <= 0) {
      return 0;
    }

    return Math.min(Math.max(1, value), stock);
  }

  function handleInputChange(raw: string) {
    const parsed = Number.parseInt(raw, 10);

    if (Number.isNaN(parsed)) {
      return;
    }

    setQuantity(clamp(parsed));
  }

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-end gap-3"
          : "flex flex-col gap-4"
      }
    >
      <div className="flex items-center gap-4">
        <label htmlFor={qtyId} className="text-sm font-bold text-gs-muted">
          {t("quantity")}
        </label>
        <div className="inline-flex overflow-hidden rounded-[7px] border border-gs-border">
          <button
            type="button"
            onClick={() => setQuantity((current) => clamp(current - 1))}
            disabled={soldOut || quantity <= 1}
            aria-label={t("decrease")}
            className="h-9 w-9 text-gs-text transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:text-gs-muted"
          >
            −
          </button>
          <input
            id={qtyId}
            type="number"
            inputMode="numeric"
            min={soldOut ? 0 : 1}
            max={stock}
            value={quantity}
            disabled={soldOut}
            onChange={(event) => handleInputChange(event.target.value)}
            className="h-9 w-[42px] border-x border-gs-border bg-gs-surface text-center text-sm font-bold text-gs-text [appearance:textfield] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:text-gs-muted [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((current) => clamp(current + 1))}
            disabled={soldOut || quantity >= stock}
            aria-label={t("increase")}
            className="h-9 w-9 text-gs-text transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:text-gs-muted"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton
        productId={productId}
        stock={stock}
        quantity={quantity}
        fullLabel
        className={compact ? "min-w-[10rem] flex-1" : "w-full"}
      />
    </div>
  );
}
