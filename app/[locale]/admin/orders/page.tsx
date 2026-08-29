/**
 * Lista de órdenes (admin) — status + link a detalle OrderItem.
 */

import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { prisma } from "@/lib/prisma";
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

  return { title: pageTitle(t("brand"), t("adminOrders")) };
}

export default async function AdminOrdersPage() {
  const t = await getTranslations("admin");
  const format = await getFormatter();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title={t("ordersTitle")} />
      <AdminOrdersTable
        orders={orders.map((order) => ({
          id: order.id,
          total: Number(order.total),
          status: order.status,
          createdAt: order.createdAt,
          customerName: order.user.name ?? order.user.email,
        }))}
        emptyLabel={t("ordersEmpty")}
        labels={{
          order: t("table.order"),
          customer: t("table.customer"),
          total: t("table.total"),
          status: t("table.status"),
          date: t("table.date"),
        }}
        statusLabel={(status) =>
          t(
            `orderStatus.${status as "PENDING" | "PAID" | "SHIPPED" | "CANCELLED"}`,
          )
        }
        formatMoney={(value) =>
          format.number(value, { style: "currency", currency: "MXN" })
        }
        formatDate={(date) =>
          format.dateTime(date, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        }
        detailHref={(id) => `/admin/orders/${id}`}
      />
    </div>
  );
}
