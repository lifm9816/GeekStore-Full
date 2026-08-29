"use client";

/**
 * Sección de pago del mockup 02 — Stripe embebido + Mercado Pago deshabilitado (Hito 2).
 */

import { useTranslations } from "next-intl";
import { SavedPaymentMethods } from "@/components/checkout/SavedPaymentMethods";
import {
  StripePaymentForm,
  type StripePaymentFormHandle,
} from "@/components/checkout/StripePaymentForm";
import type { SavedPaymentMethodDTO } from "@/lib/stripe-customer";

type CheckoutPaymentSectionProps = {
  savedPaymentMethods: SavedPaymentMethodDTO[];
  paymentChoice: "new" | string;
  onPaymentChoiceChange: (value: "new" | string) => void;
  publishableKey: string;
  clientSecret: string;
  paymentFormRef: React.RefObject<StripePaymentFormHandle | null>;
  onPaymentError: (message: string) => void;
  disabled?: boolean;
};

export function CheckoutPaymentSection({
  savedPaymentMethods,
  paymentChoice,
  onPaymentChoiceChange,
  publishableKey,
  clientSecret,
  paymentFormRef,
  onPaymentError,
  disabled = false,
}: CheckoutPaymentSectionProps) {
  const t = useTranslations("checkout");

  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
      <h2 className="mb-4 text-[15px] font-bold">{t("payment.title")}</h2>

      <div className="mb-4 flex flex-col gap-3">
        <SavedPaymentMethods
          methods={savedPaymentMethods}
          value={paymentChoice}
          onChange={onPaymentChoiceChange}
          disabled={disabled}
        />

        {savedPaymentMethods.length === 0 ? (
          <p className="text-sm font-bold text-gs-text">{t("payment.stripe")}</p>
        ) : null}

        {paymentChoice === "new" ? (
          <div>
            <h3 className="mb-3 text-sm font-bold">{t("payment.elementTitle")}</h3>
            <StripePaymentForm
              ref={paymentFormRef}
              publishableKey={publishableKey}
              clientSecret={clientSecret}
              onError={onPaymentError}
            />
          </div>
        ) : null}
      </div>

      <div
        aria-disabled="true"
        className="flex items-center gap-3 rounded-[10px] border border-dashed border-gs-border p-4 opacity-60"
      >
        <span
          className="inline-flex h-4 w-4 shrink-0 rounded-full border border-gs-border"
          aria-hidden="true"
        />
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold">{t("payment.mercadopago")}</span>
          <span className="text-[12px] text-gs-muted">{t("payment.comingSoon")}</span>
        </span>
      </div>
    </section>
  );
}
