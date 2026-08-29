/**
 * Mockup 07 — Dashboard admin.
 * Stats reales: ventas, pedidos, productos, usuarios + 7 días + top + recientes.
 */

import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { AdminSalesChart } from "@/components/admin/AdminSalesChart";
import { AdminStatTiles } from "@/components/admin/AdminStatTiles";
import { AdminTopProducts } from "@/components/admin/AdminTopProducts";
import {
  getAdminDashboardStats,
  getRecentOrders,
  getSalesLast7Days,
  getTopProducts,
} from "@/lib/admin-dashboard";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: AdminPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("admin")) };
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const t = await getTranslations("admin");
  const format = await getFormatter();

  const money = (value: number) =>
    format.number(value, { style: "currency", currency: "MXN" });

  const [stats, salesDays, topProducts, recentOrders] = await Promise.all([
    getAdminDashboardStats(),
    getSalesLast7Days(locale),
    getTopProducts(5),
    getRecentOrders(8),
  ]);

  return (
    <div>
      <AdminPageHeader title={t("title")} />

      <AdminStatTiles
        tiles={[
          {
            label: t("stats.totalSales"),
            value: money(stats.totalSales),
          },
          {
            label: t("stats.orders"),
            value: String(stats.orderCount),
            hint: t("stats.pendingHint", { count: stats.pendingOrders }),
            tone: stats.pendingOrders > 0 ? "warn" : "default",
          },
          {
            label: t("stats.products"),
            value: String(stats.productCount),
            hint: t("stats.lowStockHint", {
              count: stats.lowStockCount,
              threshold: LOW_STOCK_THRESHOLD,
            }),
            tone: stats.lowStockCount > 0 ? "warn" : "default",
          },
          {
            label: t("stats.users"),
            value: String(stats.userCount),
          },
        ]}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminSalesChart
          title={t("sales7d")}
          days={salesDays}
          emptyLabel={t("salesEmpty")}
          formatMoney={money}
        />
        <AdminTopProducts
          title={t("topProducts")}
          emptyLabel={t("topProductsEmpty")}
          soldLabel={(count) => t("unitsSold", { count })}
          products={topProducts}
        />
      </div>

      <div className="mt-6">
        <AdminOrdersTable
          title={t("recentOrders")}
          orders={recentOrders}
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
          formatMoney={money}
          formatDate={(date) =>
            format.dateTime(date, {
              day: "numeric",
              month: "short",
            })
          }
          detailHref={(id) => `/admin/orders/${id}`}
        />
      </div>
    </div>
  );
}
