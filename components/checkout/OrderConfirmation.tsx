"use client";

/**
 * Mockup 03 — dos fases según Prisma, no según Stripe:
 * - awaiting: Payment PENDING (normal hasta webhook Día 11)
 * - confirmed: Payment COMPLETED
 *
 * stripeSessionOk solo alimenta una nota secundaria; no cambia el titular
 * ni asume que la orden ya está pagada.
 */

import { Link } from "@/i18n/navigation";

export type ConfirmationPhase = "awaiting" | "confirmed";

type OrderConfirmationProps = {
  orderNumber: string;
  total: string;
  phase: ConfirmationPhase;
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="h-8 w-8 text-gs-accent-strong"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-8 w-8 text-gs-warning"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function OrderConfirmation({
  orderNumber,
  total,
  phase,
  stripeSessionOk,
  labels,
}: OrderConfirmationProps) {
  const confirmed = phase === "confirmed";
  const title = confirmed ? labels.titleConfirmed : labels.titleAwaiting;
  const subtitle = confirmed
    ? labels.subtitleConfirmed
    : labels.subtitleAwaiting;

  return (
    <section
      className="rounded-[10px] border border-gs-border bg-gs-surface px-6 py-10 text-center md:px-8 md:py-12"
      aria-live="polite"
    >
      <div
        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          confirmed ? "bg-gs-accent/15" : "bg-gs-warning/15"
        }`}
        aria-hidden="true"
      >
        {confirmed ? <CheckIcon /> : <PendingIcon />}
      </div>

      <h1 className="text-xl font-extrabold md:text-2xl">{title}</h1>

      <p className="mt-3 text-sm leading-relaxed text-gs-muted">
        {subtitle}
      </p>

      {confirmed ? (
        <p className="mt-2 text-sm text-gs-muted">{labels.emailNotice}</p>
      ) : null}

      {!confirmed && stripeSessionOk ? (
        <p
          role="status"
          className="mx-auto mt-4 max-w-sm rounded-[10px] border border-gs-warning/40 bg-gs-warning/10 px-4 py-3 text-[13px] text-gs-text"
        >
          {labels.stripeHint}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            confirmed
              ? "bg-gs-accent/15 text-gs-accent-strong"
              : "bg-gs-warning/15 text-gs-warning"
          }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
          {confirmed ? labels.confirmedBadge : labels.awaitingBadge}
        </span>
      </div>

      <p className="mt-4 text-lg font-extrabold">
        {confirmed ? labels.totalPaidLabel : labels.totalLabel}: {total}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="inline-flex flex-1 items-center justify-center rounded-[7px] bg-gs-accent px-5 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong sm:flex-none"
        >
          {labels.viewOrder}
        </Link>
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center rounded-[7px] border border-gs-border px-5 py-2.5 text-sm font-bold text-gs-text transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong sm:flex-none"
        >
          {labels.keepShopping}
        </Link>
      </div>

      <p className="sr-only">{orderNumber}</p>
    </section>
  );
}
