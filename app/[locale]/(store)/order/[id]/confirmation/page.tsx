/**
 * Mockup 03 — Confirmación tras pago con Payment Element embebido.
 *
 * La fase la define Prisma (Payment.status). Si el webhook aún no llegó,
 * reconciliamos contra el PaymentIntent en Stripe (mismo efecto, idempotente).
 * payment_intent en query sirve para una nota secundaria de progreso.
 */

import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { OrderConfirmationPoller } from "@/components/checkout/OrderConfirmationPoller";
import { redirect } from "@/i18n/navigation";
import { getOrderForConfirmation } from "@/lib/checkout";
import { formatOrderNumber } from "@/lib/order";
import { getStripe } from "@/lib/stripe";
import { reconcileStripePaymentForOrder } from "@/lib/stripe-webhook";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type ConfirmationPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
  searchParams: Promise<{ payment_intent?: string }>;
};

export async function generateMetadata({
  params,
}: ConfirmationPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("orderConfirmation")) };
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { locale, id } = await params;
  const { payment_intent: paymentIntentId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const order = await getOrderForConfirmation(id, userId);

  if (!order) {
    notFound();
  }

  await reconcileStripePaymentForOrder(order.id, userId);
  const confirmedOrder =
    (await getOrderForConfirmation(id, userId)) ?? order;

  let stripePaymentOk = false;

  if (paymentIntentId) {
    try {
      const stripe = getStripe();
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (
        paymentIntent.metadata?.orderId === confirmedOrder.id &&
        paymentIntent.metadata?.userId === userId &&
        paymentIntent.status === "succeeded"
      ) {
        stripePaymentOk = true;
      }
    } catch {
      stripePaymentOk = false;
    }
  }

  const phase =
    confirmedOrder.payment?.status === "COMPLETED" ? "confirmed" : "awaiting";

  const t = await getTranslations("checkout.confirmation");
  const format = await getFormatter();
  const orderNumber = formatOrderNumber(confirmedOrder.id);
  const total = format.number(Number(confirmedOrder.total), {
    style: "currency",
    currency: "MXN",
  });

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12 md:px-6 md:py-16">
      <OrderConfirmationPoller
        orderId={confirmedOrder.id}
        orderNumber={orderNumber}
        total={total}
        initialPhase={phase}
        stripeSessionOk={stripePaymentOk}
        labels={{
          titleAwaiting: t("titleAwaiting"),
          subtitleAwaiting: t("subtitleAwaiting", { order: orderNumber }),
          titleConfirmed: t("titleConfirmed"),
          subtitleConfirmed: t("subtitleConfirmed", { order: orderNumber }),
          emailNotice: t("emailNotice"),
          stripeHint: t("stripeHint"),
          totalLabel: t("totalLabel"),
          totalPaidLabel: t("totalPaidLabel"),
          viewOrder: t("viewOrder"),
          keepShopping: t("keepShopping"),
          awaitingBadge: t("awaitingBadge"),
          confirmedBadge: t("confirmedBadge"),
        }}
      />
    </div>
  );
}
