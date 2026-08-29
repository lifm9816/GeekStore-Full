/**
 * Handlers del webhook Stripe (Día 11).
 * Busca Payment por externalId (= PaymentIntent id guardado en finalizeCheckoutPayment).
 * Idempotente: reintentos de Stripe no duplican updates ni descuentos de stock.
 */

import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  const payment = await prisma.payment.findFirst({
    where: {
      externalId: paymentIntent.id,
      provider: "STRIPE",
    },
    include: {
      order: { include: { items: true } },
    },
  });

  if (!payment) {
    console.warn(
      "[stripe-webhook] payment_intent.succeeded sin Payment local:",
      paymentIntent.id,
    );
    return;
  }

  // Idempotencia: Stripe puede reenviar el mismo evento.
  if (payment.status === "COMPLETED") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({ where: { id: payment.id } });
    if (current?.status === "COMPLETED") {
      return;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });

    for (const item of payment.order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });
}

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
) {
  const payment = await prisma.payment.findFirst({
    where: {
      externalId: paymentIntent.id,
      provider: "STRIPE",
    },
  });

  if (!payment) {
    console.warn(
      "[stripe-webhook] payment_intent.payment_failed sin Payment local:",
      paymentIntent.id,
    );
    return;
  }

  if (payment.status === "FAILED") {
    return;
  }

  // Order queda PENDING — el usuario puede reintentar desde checkout.
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" },
  });
}
