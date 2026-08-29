"use client";

/**
 * Tarjetas guardadas en Stripe (Customer payment methods).
 * Solo mostramos brand + last4 — nunca PAN/CVC/expiry en GeekStore.
 */

import { useTranslations } from "next-intl";
import type { SavedPaymentMethodDTO } from "@/lib/stripe-customer";

type SavedPaymentMethodsProps = {
  methods: SavedPaymentMethodDTO[];
  value: "new" | string;
  onChange: (value: "new" | string) => void;
  disabled?: boolean;
};

export function SavedPaymentMethods({
  methods,
  value,
  onChange,
  disabled = false,
}: SavedPaymentMethodsProps) {
  const t = useTranslations("checkout.payment");

  if (methods.length === 0) {
    return null;
  }

  return (
    <fieldset
      className="flex flex-col gap-3"
      disabled={disabled}
    >
      <legend className="sr-only">{t("savedCardsLegend")}</legend>

      {methods.map((method) => (
        <label
          key={method.id}
          className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-gs-border p-4 transition-colors has-checked:border-gs-accent has-checked:bg-gs-accent/5"
        >
          <input
            type="radio"
            name="paymentChoice"
            value={method.id}
            checked={value === method.id}
            onChange={() => onChange(method.id)}
            className="h-4 w-4 accent-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          />
          <span className="text-sm font-bold">
            {t("savedCard", { last4: method.last4 })}
          </span>
        </label>
      ))}

      <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-gs-border p-4 transition-colors has-checked:border-gs-accent has-checked:bg-gs-accent/5">
        <input
          type="radio"
          name="paymentChoice"
          value="new"
          checked={value === "new"}
          onChange={() => onChange("new")}
          className="h-4 w-4 accent-gs-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        />
        <span className="text-sm font-bold">{t("newCard")}</span>
      </label>
    </fieldset>
  );
}
