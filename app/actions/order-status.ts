"use server";

/**
 * Estado de pago para polling en confirmación (mockup 03).
 * Solo el dueño de la orden puede consultar.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type OrderConfirmationPhase = "awaiting" | "confirmed" | "failed";

export async function getOrderConfirmationPhase(
  orderId: string,
): Promise<OrderConfirmationPhase | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const payment = await prisma.payment.findFirst({
    where: {
      order: { id: orderId, userId },
    },
    select: { status: true },
  });

  if (!payment) {
    return null;
  }

  if (payment.status === "COMPLETED") {
    return "confirmed";
  }

  if (payment.status === "FAILED") {
    return "failed";
  }

  return "awaiting";
}
