/**
 * Cliente Stripe server-side (Días 9–10).
 * STRIPE_SECRET_KEY solo en servidor; el checkout hospedado no expone
 * STRIPE_PUBLISHABLE_KEY en esta fase (la sesión se crea vía API).
 */

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY no está definida.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

/** Stripe Checkout usa centavos para MXN (2 decimales × 100). */
export function toStripeAmount(mxn: number) {
  return Math.round(mxn * 100);
}
