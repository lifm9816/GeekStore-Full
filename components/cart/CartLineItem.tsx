"use client";

/**
 * Card del mockup 12: X de esquina, thumb, marca, precio c/u, stepper con
 * input manual, subtotal en vivo. Si quantity === 1, "−" pasa a bote de basura
 * (la X sigue disponible). Si quantity >= stock, se muestra el aviso que el
 * CRA no tenía y se deshabilita "+".
 */

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import type { CartLine } from "@/lib/cart";

type CartLineItemProps = {
  line: CartLine;
  pending?: boolean;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6" />
    </svg>
  );
}

export function CartLineItem({
  line,
  pending = false,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  const t = useTranslations("cart");
  const format = useFormatter();
  const money = (value: number) =>
    format.number(value, { style: "currency", currency: "MXN" });
  const atLimit = line.stock > 0 && line.quantity >= line.stock;
  const soldOut = line.stock <= 0;
  const quantityInputId = `cart-qty-${line.productId}`;
  const atMinimum = line.quantity <= 1;

  function handleInputChange(raw: string) {
    const parsed = Number.parseInt(raw, 10);

    if (Number.isNaN(parsed)) {
      return;
    }

    onQuantityChange(line.productId, parsed);
  }

  return (
    <article className="relative mb-3 flex flex-col gap-4 rounded-[10px] border border-gs-border bg-gs-surface p-4 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => onRemove(line.productId)}
        disabled={pending}
        aria-label={t("remove", { name: line.name })}
        className="absolute top-2.5 right-2.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-gs-border bg-gs-surface-2 text-gs-muted transition-colors hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          className="h-3 w-3"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div className="relative h-[66px] w-[66px] shrink-0 overflow-hidden rounded-lg">
        <Image
          src={line.coverImageUrl}
          alt={t("coverAlt", { name: line.name, brand: line.brandName })}
          fill
          sizes="66px"
          className="object-cover"
          unoptimized={line.coverImageUrl.endsWith(".svg")}
        />
      </div>

      <div className="min-w-0 flex-1 pr-8 sm:pr-0">
        <p className="mb-1.5 inline-block rounded-full border border-gs-border px-2 py-0.5 text-[10px] font-bold tracking-wide text-gs-muted uppercase">
          {line.brandName}
        </p>
        <h2 className="text-sm font-bold">{line.name}</h2>
        <p className="text-[12.5px] text-gs-muted">
          {t("perUnit", { price: money(line.price) })}
        </p>
        {soldOut ? (
          <p role="status" className="mt-1 text-[11.5px] font-bold text-gs-critical">
            {t("soldOut")}
          </p>
        ) : atLimit ? (
          <p
            role="status"
            className="mt-1 text-[11.5px] font-bold text-gs-warning"
          >
            {t("stockLimit", { count: line.stock })}
          </p>
        ) : null}
      </div>

      {soldOut ? null : (
        <div className="inline-flex overflow-hidden rounded-[7px] border border-gs-border">
          <button
            type="button"
            onClick={() =>
              atMinimum
                ? onRemove(line.productId)
                : onQuantityChange(line.productId, line.quantity - 1)
            }
            disabled={pending}
            aria-label={
              atMinimum
                ? t("remove", { name: line.name })
                : t("decrease", { name: line.name })
            }
            className={`flex h-[34px] w-[34px] items-center justify-center bg-gs-surface-2 text-gs-text transition-colors hover:bg-gs-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:opacity-60 ${
              atMinimum ? "text-gs-critical" : ""
            }`}
          >
            {atMinimum ? <TrashIcon /> : "−"}
          </button>
          <label htmlFor={quantityInputId} className="sr-only">
            {t("quantity", { name: line.name })}
          </label>
          <input
            id={quantityInputId}
            type="number"
            inputMode="numeric"
            min={1}
            max={line.stock}
            value={line.quantity}
            disabled={pending}
            onChange={(event) => handleInputChange(event.target.value)}
            className="h-[34px] w-[42px] border-x border-gs-border bg-gs-surface text-center text-sm font-bold text-gs-text [appearance:textfield] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => onQuantityChange(line.productId, line.quantity + 1)}
            disabled={pending || atLimit}
            aria-label={t("increase", { name: line.name })}
            className="flex h-[34px] w-[34px] items-center justify-center bg-gs-surface-2 text-gs-text transition-colors hover:bg-gs-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:text-gs-muted"
          >
            +
          </button>
        </div>
      )}

      <p
        className="w-full text-right text-[14.5px] font-extrabold sm:w-[90px] sm:shrink-0"
        aria-label={t("lineSubtotal", { name: line.name })}
      >
        {money(line.price * line.quantity)}
      </p>
    </article>
  );
}
