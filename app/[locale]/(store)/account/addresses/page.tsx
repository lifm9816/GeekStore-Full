/**
 * Mockup 05 — Libreta de direcciones. Address.isDefault alimenta el checkout.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressBook } from "@/components/account/AddressBook";
import { Link, redirect } from "@/i18n/navigation";
import { getAddresses } from "@/lib/account";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type AddressesPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ from?: string; returnTo?: string }>;
};

function resolveReturnTo(returnTo?: string, from?: string) {
  if (returnTo === "/checkout" || from === "checkout") {
    return "/checkout";
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: AddressesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("accountAddresses")) };
}

export default async function AddressesPage({
  params,
  searchParams,
}: AddressesPageProps) {
  const { locale } = await params;
  const { from, returnTo } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("account");
  const checkoutReturn = resolveReturnTo(returnTo, from);

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const addresses = await getAddresses(userId);

  return (
    <AccountShell>
      {checkoutReturn ? (
        <div className="mb-5 rounded-[10px] border border-gs-accent/30 bg-gs-accent/10 px-4 py-3 text-sm">
          <p>{t("addressesCheckoutBanner")}</p>
          {addresses.length > 0 ? (
            <Link
              href={checkoutReturn}
              className="mt-2 inline-block font-bold text-gs-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
            >
              {t("backToCheckout")}
            </Link>
          ) : null}
        </div>
      ) : null}
      <AddressBook addresses={addresses} returnTo={checkoutReturn} />
    </AccountShell>
  );
}
