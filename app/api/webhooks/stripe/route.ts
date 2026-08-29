/**
 * Webhook Stripe — Día 11 (roadmap §5).
 * Integración externa → app/api/ (no Server Action).
 *
 * 1. Verifica firma con STRIPE_WEBHOOK_SECRET (constructEvent).
 * 2. payment_intent.succeeded → Payment COMPLETED + Order PAID + descuento de Product.stock (misma tx, idempotente).
 * 3. payment_intent.payment_failed → Payment FAILED; Order sigue PENDING.
 * 4. Responde 200 tras procesar; 400 si firma inválida; 500 si falla BD (Stripe reintenta).
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
} from "@/lib/stripe-webhook";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET no definida.");
    return NextResponse.json(
      { error: "Webhook no configurado." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Falta Stripe-Signature." },
      { status: 400 },
    );
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Firma inválida.";
    console.warn("[stripe-webhook] Verificación rechazada:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("[stripe-webhook] Error procesando", event.type, error);
    return NextResponse.json(
      { error: "Error al procesar evento." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
