"use server";

/**
 * Checkout (Días 9–10) — Payment Element embebido.
 *
 * Flujo en dos fases server-side:
 * 1. createCheckoutPaymentIntent — al cargar /checkout: PI sin Order (solo monto + customer).
 *    Permite montar el Payment Element antes de que el usuario confirme.
 * 2. finalizeCheckoutPayment — al pulsar "Confirmar y pagar": Order + Payment (PENDING),
 *    vincula orderId al PI, vacía carrito; luego el cliente llama confirmPayment.
 *
 * El webhook (Día 11) marca Payment COMPLETED y Order PAID.
 */

import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { getAddresses } from "@/lib/account";
import { getUserCartLines } from "@/lib/cart-query";
import { validateCheckoutLines } from "@/lib/checkout";
import { prisma } from "@/lib/prisma";
import { ensureStripeCustomer } from "@/lib/stripe-customer";
import { getStripe, toStripeAmount } from "@/lib/stripe";

export type CheckoutIntentState = {
  error?: string;
  clientSecret?: string;
  paymentIntentId?: string;
};

export type CheckoutFormState = {
  error?: string;
  clientSecret?: string;
  orderId?: string;
};

async function discardPendingOrder(orderId: string) {
  await prisma.order.delete({ where: { id: orderId } }).catch(() => undefined);
}

/** Fase 1 — PI al entrar a checkout (sin Order todavía). */
export async function createCheckoutPaymentIntent(): Promise<CheckoutIntentState> {
  const locale = await getLocale();
  const t = await getTranslations("checkout.errors");
  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    return { error: t("unauthenticated") };
  }

  const lines = await getUserCartLines(userId);
  const validation = validateCheckoutLines(lines);

  if (!validation.ok) {
    if (validation.error === "emptyCart") {
      return { error: t("emptyCart") };
    }

    return { error: t("stockChanged") };
  }

  const { totals } = validation;
  const stripe = getStripe();

  let stripeCustomerId: string;

  try {
    stripeCustomerId = await ensureStripeCustomer(
      userId,
      userEmail,
      session.user?.name,
    );
  } catch {
    return { error: t("stripeSession") };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(totals.total),
      currency: "mxn",
      customer: stripeCustomerId,
      setup_future_usage: "off_session",
      metadata: {
        userId,
        locale,
        checkoutDraft: "true",
      },
      automatic_payment_methods: { enabled: true },
    });

    if (!paymentIntent.client_secret) {
      return { error: t("stripeSession") };
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch {
    return { error: t("stripeSession") };
  }
}

/** Fase 2 — Order + Payment antes de confirmPayment en el cliente. */
export async function finalizeCheckoutPayment(
  formData: FormData,
  paymentIntentId: string,
): Promise<CheckoutFormState> {
  const locale = await getLocale();
  const t = await getTranslations("checkout.errors");
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { error: t("unauthenticated") };
  }

  const addressId = String(formData.get("addressId") ?? "");

  const addresses = await getAddresses(userId);

  if (addresses.length === 0) {
    return { error: t("addressRequired") };
  }

  const address = addresses.find((item) => item.id === addressId);

  if (!address) {
    return { error: t("addressInvalid") };
  }

  const lines = await getUserCartLines(userId);
  const validation = validateCheckoutLines(lines);

  if (!validation.ok) {
    if (validation.error === "emptyCart") {
      return { error: t("emptyCart") };
    }

    return { error: t("stockChanged") };
  }

  const { totals } = validation;
  const stripe = getStripe();

  let existingIntent;

  try {
    existingIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    return { error: t("stripeSession") };
  }

  if (
    existingIntent.metadata?.userId !== userId ||
    existingIntent.metadata?.checkoutDraft !== "true"
  ) {
    return { error: t("stripeSession") };
  }

  if (existingIntent.amount !== toStripeAmount(totals.total)) {
    return { error: t("stockChanged") };
  }

  let orderId = "";

  try {
    await prisma.$transaction(async (tx) => {
      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: { stock: true, price: true },
        });

        if (!product || product.stock < line.quantity) {
          throw new Error("stockChanged");
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          shippingAddressId: address.id,
          status: "PENDING",
          total: totals.total,
        },
      });

      orderId = order.id;

      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
          select: { price: true },
        });

        if (!product) {
          throw new Error("notFound");
        }

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: line.productId,
            quantity: line.quantity,
            priceAtPurchase: product.price,
          },
        });
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          provider: "STRIPE",
          externalId: paymentIntentId,
          status: "PENDING",
          amount: totals.total,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "stockChanged") {
      return { error: t("stockChanged") };
    }

    return { error: t("generic") };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        orderId,
        userId,
        locale,
      },
    });

    if (!paymentIntent.client_secret) {
      await discardPendingOrder(orderId);
      return { error: t("stripeSession") };
    }

    await prisma.cartItem.deleteMany({ where: { userId } });

    return {
      clientSecret: paymentIntent.client_secret,
      orderId,
    };
  } catch {
    await discardPendingOrder(orderId);
    return { error: t("stripeSession") };
  }
}
