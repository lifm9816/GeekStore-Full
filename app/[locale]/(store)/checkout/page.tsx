/**
 * Mockup 02 — Checkout. Requiere sesión, carrito con líneas y al menos
 * una Address (Día 8). Sin direcciones → /account/addresses.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { createCheckoutPaymentIntent } from "@/app/actions/checkout";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { redirect } from "@/i18n/navigation";
import { getAddresses, getOrCreateCustomer } from "@/lib/account";
import { getUserCartLines } from "@/lib/cart-query";
import { validateCheckoutLines } from "@/lib/checkout";
import { listSavedPaymentMethods } from "@/lib/stripe-customer";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ cancelled?: string }>;
};

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("checkout")) };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { locale } = await params;
  const { cancelled } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login?callbackUrl=/checkout", locale });
    return null;
  }

  const lines = await getUserCartLines(userId);
  const validation = validateCheckoutLines(lines);

  if (!validation.ok) {
    redirect({ href: "/cart", locale });
    return null;
  }

  const addresses = await getAddresses(userId);

  if (addresses.length === 0) {
    redirect({ href: "/account/addresses?returnTo=/checkout", locale });
    return null;
  }

  const customer = await getOrCreateCustomer(userId);
  const savedPaymentMethods = await listSavedPaymentMethods(
    customer.stripeCustomerId,
  );
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("STRIPE_PUBLISHABLE_KEY no está definida.");
  }

  const paymentIntent = await createCheckoutPaymentIntent();

  if (
    paymentIntent.error ||
    !paymentIntent.clientSecret ||
    !paymentIntent.paymentIntentId
  ) {
    redirect({ href: "/cart", locale });
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:py-12">
      <CheckoutView
        lines={lines}
        addresses={addresses}
        savedPaymentMethods={savedPaymentMethods}
        publishableKey={publishableKey}
        clientSecret={paymentIntent.clientSecret}
        paymentIntentId={paymentIntent.paymentIntentId}
        locale={locale}
        cancelled={cancelled === "1"}
      />
    </div>
  );
}
