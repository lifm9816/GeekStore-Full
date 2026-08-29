/**
 * Lecturas y reglas de checkout (mockup 02).
 * Totales de envío: reutiliza cartTotals / FREE_SHIPPING_THRESHOLD / PAID_SHIPPING
 * de lib/cart.ts — no se duplican umbrales aquí.
 */

import { cartTotals, type CartLine } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export type CheckoutValidationError =
  | "emptyCart"
  | "stockChanged"
  | "addressRequired"
  | "addressNotFound";

export function validateCheckoutLines(lines: CartLine[]) {
  if (lines.length === 0) {
    return { ok: false as const, error: "emptyCart" as const };
  }

  for (const line of lines) {
    if (line.stock <= 0 || line.quantity <= 0 || line.quantity > line.stock) {
      return { ok: false as const, error: "stockChanged" as const };
    }
  }

  return { ok: true as const, totals: cartTotals(lines) };
}

export async function getOrderForConfirmation(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              coverImageUrl: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
      payment: true,
      shippingAddress: true,
    },
  });
}
