"use client";

/**
 * Mockup 03 — polling mientras Payment.status === PENDING.
 * Tras el webhook (Día 11), router.refresh() re-renderiza con fase "confirmed".
 */

import { useEffect } from "react";
import { getOrderConfirmationPhase } from "@/app/actions/order-status";
import {
  OrderConfirmation,
  type ConfirmationPhase,
} from "@/components/checkout/OrderConfirmation";
import { useRouter } from "@/i18n/navigation";

const POLL_MS = 2500;

type OrderConfirmationPollerProps = {
  orderId: string;
  orderNumber: string;
  total: string;
  initialPhase: ConfirmationPhase;
  stripeSessionOk: boolean;
  labels: {
    titleAwaiting: string;
    subtitleAwaiting: string;
    titleConfirmed: string;
    subtitleConfirmed: string;
    emailNotice: string;
    stripeHint: string;
    totalLabel: string;
    totalPaidLabel: string;
    viewOrder: string;
    keepShopping: string;
    awaitingBadge: string;
    confirmedBadge: string;
  };
};

export function OrderConfirmationPoller({
  orderId,
  initialPhase,
  orderNumber,
  total,
  stripeSessionOk,
  labels,
}: OrderConfirmationPollerProps) {
  const router = useRouter();

  useEffect(() => {
    if (initialPhase === "confirmed") {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const phase = await getOrderConfirmationPhase(orderId);

      if (phase === "confirmed" || phase === "failed") {
        router.refresh();
      }
    }, POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [orderId, initialPhase, router]);

  return (
    <OrderConfirmation
      orderNumber={orderNumber}
      total={total}
      phase={initialPhase}
      stripeSessionOk={stripeSessionOk}
      labels={labels}
    />
  );
}
