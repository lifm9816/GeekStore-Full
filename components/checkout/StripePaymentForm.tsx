"use client";

/**
 * Payment Element embebido (Stripe Elements).
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type Ref,
} from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getStripeAppearance } from "@/lib/stripe-appearance";
import type { StripeBillingAddress } from "@/lib/stripe-billing";

export type StripePaymentFormHandle = {
  confirm: (
    orderId: string,
    locale: string,
    billingAddress: StripeBillingAddress,
  ) => Promise<{ error?: string }>;
};

type StripePaymentFormProps = {
  publishableKey: string;
  clientSecret: string;
  onError?: (message: string) => void;
};

function StripePaymentPlaceholder() {
  return (
    <div className="rounded-[10px] border border-gs-border bg-gs-surface p-4">
      <p className="text-[13px] text-gs-muted" role="status">
        …
      </p>
    </div>
  );
}

function PaymentFormInner({
  onError,
  formRef,
}: {
  onError?: (message: string) => void;
  formRef: Ref<StripePaymentFormHandle>;
}) {
  const t = useTranslations("checkout.errors");
  const stripe = useStripe();
  const elements = useElements();
  const [elementReady, setElementReady] = useState(false);

  useImperativeHandle(formRef, () => ({
    async confirm(
      orderId: string,
      locale: string,
      billingAddress: StripeBillingAddress,
    ) {
      if (!stripe || !elements) {
        return { error: t("stripeConfirm") };
      }

      const absoluteReturn = `${window.location.origin}/${locale}/order/${orderId}/confirmation`;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: absoluteReturn,
          payment_method_data: {
            billing_details: {
              address: billingAddress,
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        const message = error.message ?? t("stripeConfirm");
        onError?.(message);
        return { error: message };
      }

      if (paymentIntent?.status === "succeeded") {
        window.location.assign(
          `${absoluteReturn}?payment_intent=${paymentIntent.id}`,
        );
      }

      return {};
    },
  }));

  return (
    <div className="rounded-[10px] border border-gs-border bg-gs-surface p-4">
      <PaymentElement
        onReady={() => setElementReady(true)}
        options={{
          layout: "tabs",
          fields: {
            billingDetails: {
              address: "never",
            },
          },
        }}
      />
      {!elementReady ? (
        <p className="mt-2 text-[13px] text-gs-muted" role="status">
          …
        </p>
      ) : null}
    </div>
  );
}

export const StripePaymentForm = forwardRef<
  StripePaymentFormHandle,
  StripePaymentFormProps
>(function StripePaymentForm(
  { publishableKey, clientSecret, onError },
  ref,
) {
  const { theme } = useTheme();
  const [clientReady, setClientReady] = useState(false);
  const [fontsOrigin, setFontsOrigin] = useState("");

  useEffect(() => {
    setFontsOrigin(window.location.origin);
    setClientReady(true);
  }, []);

  const stripePromise = useMemo(
    () => loadStripe(publishableKey),
    [publishableKey],
  );

  const options = useMemo<StripeElementsOptions | null>(() => {
    if (!clientReady || !fontsOrigin) {
      return null;
    }

    return {
      clientSecret,
      appearance: getStripeAppearance(theme),
      fonts: [{ cssSrc: `${fontsOrigin}/fonts/geist-stripe.css` }],
    };
  }, [clientReady, clientSecret, theme, fontsOrigin]);

  if (!options) {
    return <StripePaymentPlaceholder />;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner onError={onError} formRef={ref} />
    </Elements>
  );
});
