"use client";

/**
 * Vista de checkout (mockup 02).
 * Tarjeta / método de pago primero; "Confirmar y pagar" crea Order + cobra en un paso.
 */

import { useRef, useState, useTransition } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { finalizeCheckoutPayment } from "@/app/actions/checkout";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { CheckoutPaymentSection } from "@/components/checkout/CheckoutPaymentSection";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import type { StripePaymentFormHandle } from "@/components/checkout/StripePaymentForm";
import { cartTotals, type CartLine } from "@/lib/cart";
import type { AddressDTO } from "@/lib/account";
import type { SavedPaymentMethodDTO } from "@/lib/stripe-customer";
import { addressToStripeBillingAddress } from "@/lib/stripe-billing";
import type { AppLocale } from "@/i18n/routing";

type CheckoutViewProps = {
  lines: CartLine[];
  addresses: AddressDTO[];
  savedPaymentMethods: SavedPaymentMethodDTO[];
  publishableKey: string;
  clientSecret: string;
  paymentIntentId: string;
  locale: AppLocale;
  cancelled?: boolean;
};

export function CheckoutView({
  lines,
  addresses,
  savedPaymentMethods,
  publishableKey,
  clientSecret,
  paymentIntentId,
  locale,
  cancelled = false,
}: CheckoutViewProps) {
  const t = useTranslations("checkout");
  const tErrors = useTranslations("checkout.errors");
  const totals = cartTotals(lines);
  const defaultAddressId =
    addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id;

  const [paymentChoice, setPaymentChoice] = useState<"new" | string>(
    savedPaymentMethods[0]?.id ?? "new",
  );
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const paymentFormRef = useRef<StripePaymentFormHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function confirmSavedPayment(
    secret: string,
    paymentMethodId: string,
    preparedOrderId: string,
  ) {
    const stripe = await loadStripe(publishableKey);

    if (!stripe) {
      setError(tErrors("stripeConfirm"));
      return;
    }

    const confirmationReturn = `${window.location.origin}/${locale}/order/${preparedOrderId}/confirmation`;

    // Método guardado: solo `payment_method` (Stripe no admite ambos con payment_method_data).
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      clientSecret: secret,
      confirmParams: {
        payment_method: paymentMethodId,
        return_url: confirmationReturn,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? tErrors("stripeConfirm"));
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      window.location.assign(
        `${confirmationReturn}?payment_intent=${paymentIntent.id}`,
      );
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const addressId = String(formData.get("addressId") ?? "");
    const selectedAddress = addresses.find((item) => item.id === addressId);

    if (!selectedAddress) {
      setError(tErrors("addressInvalid"));
      return;
    }

    const billingAddress = addressToStripeBillingAddress(selectedAddress);

    startTransition(async () => {
      const prep = await finalizeCheckoutPayment(formData, paymentIntentId);

      if (prep.error) {
        setError(prep.error);
        return;
      }

      if (!prep.clientSecret || !prep.orderId) {
        setError(tErrors("stripeSession"));
        return;
      }

      if (paymentChoice !== "new") {
        await confirmSavedPayment(
          prep.clientSecret,
          paymentChoice,
          prep.orderId,
        );
        return;
      }

      const result = await paymentFormRef.current?.confirm(
        prep.orderId,
        locale,
        billingAddress,
      );

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <CheckoutSteps current="confirm" />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">
        {t("title")}
      </h1>

      {cancelled ? (
        <p
          role="status"
          className="mb-4 rounded-[10px] border border-gs-warning/40 bg-gs-warning/10 px-4 py-3 text-sm text-gs-text"
        >
          {t("cancelledNotice")}
        </p>
      ) : null}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start"
      >
        <div className="flex flex-col gap-5">
          <AddressSelector
            addresses={addresses}
            defaultAddressId={defaultAddressId}
          />
          <CheckoutPaymentSection
            savedPaymentMethods={savedPaymentMethods}
            paymentChoice={paymentChoice}
            onPaymentChoiceChange={setPaymentChoice}
            publishableKey={publishableKey}
            clientSecret={clientSecret}
            paymentFormRef={paymentFormRef}
            onPaymentError={setError}
            disabled={pending}
          />
        </div>

        <CheckoutSummary
          lines={lines}
          totals={totals}
          pending={pending}
          error={error}
        />
      </form>
    </div>
  );
}
