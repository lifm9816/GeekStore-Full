/**
 * Mockup 04 — Mis pedidos. Sin checkout no hay filas; no se simulan.
 * Si más adelante existen Order reales, OrdersList las muestra.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AccountShell } from "@/components/account/AccountShell";
import { OrdersEmpty } from "@/components/account/OrdersEmpty";
import { OrdersList } from "@/components/account/OrdersList";
import { redirect } from "@/i18n/navigation";
import { getOrdersForAccount } from "@/lib/account";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type OrdersPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: OrdersPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("accountOrders")) };
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const orders = await getOrdersForAccount(userId);

  return (
    <AccountShell>
      {orders.length === 0 ? <OrdersEmpty /> : <OrdersList orders={orders} />}
    </AccountShell>
  );
}
