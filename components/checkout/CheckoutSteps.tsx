"use client";

/** Pasos del mockup 02: Carrito → Envío → Confirmar */

import { useTranslations } from "next-intl";

type CheckoutStepsProps = {
  current: "cart" | "shipping" | "confirm";
};

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const t = useTranslations("checkout.steps");

  const steps = [
    { id: "cart", label: t("cart") },
    { id: "shipping", label: t("shipping") },
    { id: "confirm", label: t("confirm") },
  ] as const;

  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <ol
      aria-label={t("label")}
      className="mb-6 flex flex-wrap items-center gap-2 text-[13px] font-semibold text-gs-muted"
    >
      {steps.map((step, index) => {
        const active = index <= currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="text-gs-border">
                →
              </span>
            ) : null}
            <span
              className={
                active ? "text-gs-accent-strong" : "text-gs-muted"
              }
            >
              {index + 1}. {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
