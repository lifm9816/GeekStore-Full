/**
 * Vincula Customer (Prisma) con Stripe Customer (Días 9–10 extendidos).
 *
 * Solo persistimos stripeCustomerId — nunca PAN, CVC ni fecha de expiración.
 * Los métodos de pago guardados viven en Stripe; la UI solo muestra last4/brand.
 */

import { getOrCreateCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export type SavedPaymentMethodDTO = {
  id: string;
  brand: string;
  last4: string;
};

export async function ensureStripeCustomer(
  userId: string,
  email: string,
  name?: string | null,
) {
  const customer = await getOrCreateCustomer(userId);

  if (customer.stripeCustomerId) {
    return customer.stripeCustomerId;
  }

  const stripe = getStripe();
  const stripeCustomer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  });

  await prisma.customer.update({
    where: { id: customer.id },
    data: { stripeCustomerId: stripeCustomer.id },
  });

  return stripeCustomer.id;
}

export async function listSavedPaymentMethods(
  stripeCustomerId: string | null | undefined,
): Promise<SavedPaymentMethodDTO[]> {
  if (!stripeCustomerId) {
    return [];
  }

  const stripe = getStripe();
  const { data } = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });

  return data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? "card",
    last4: pm.card?.last4 ?? "????",
  }));
}
