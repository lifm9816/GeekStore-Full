/**
 * Detalle de orden admin — OrderItem con priceAtPurchase.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb, AdminPageHeader } from "@/components/admin/AdminNavContext";
import { formatOrderNumber } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-gs-warning/15 text-gs-warning",
  PAID: "bg-gs-accent/15 text-gs-accent-strong",
  SHIPPED: "bg-gs-accent/15 text-gs-accent-strong",
  CANCELLED: "bg-gs-critical/15 text-gs-critical",
};

export async function generateMetadata({
  params,
}: OrderDetailPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminOrderDetail")) };
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const t = await getTranslations("admin");
  const format = await getFormatter();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      payment: true,
      shippingAddress: true,
      items: {
        include: {
          product: {
            select: {
              name: true,
              coverImageUrl: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const money = (value: number) =>
    format.number(value, { style: "currency", currency: "MXN" });
  const statusClass = STATUS_CLASS[order.status] ?? STATUS_CLASS.PENDING;

  return (
    <div>
      <AdminCrumb
        label={formatOrderNumber(order.id)}
        backHref="/admin/orders"
      />
      <AdminPageHeader>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${statusClass}`}
        >
          <span
            className="h-2 w-2 rounded-full bg-current"
            aria-hidden="true"
          />
          {t(
            `orderStatus.${order.status as "PENDING" | "PAID" | "SHIPPED" | "CANCELLED"}`,
          )}
        </span>
      </AdminPageHeader>

      <p className="mb-6 text-sm text-gs-muted">
        {order.user.name ?? order.user.email} ·{" "}
        {format.dateTime(order.createdAt, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
          <h2 className="mb-4 text-[15px] font-bold">{t("orderItems")}</h2>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.product.coverImageUrl}
                    alt={item.product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.product.name}</p>
                  <p className="text-[12px] text-gs-muted">
                    {item.product.brand.name} · ×{item.quantity} ·{" "}
                    {money(Number(item.priceAtPurchase))}
                  </p>
                </div>
                <p className="shrink-0 font-bold">
                  {money(Number(item.priceAtPurchase) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
          <h2 className="mb-3 text-[15px] font-bold">{t("orderSummary")}</h2>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-gs-muted">{t("table.total")}</dt>
              <dd className="font-extrabold">{money(Number(order.total))}</dd>
            </div>
            {order.payment ? (
              <div className="flex justify-between gap-2">
                <dt className="text-gs-muted">{t("paymentStatus")}</dt>
                <dd className="font-semibold">{order.payment.status}</dd>
              </div>
            ) : null}
            {order.shippingAddress ? (
              <div className="mt-2 border-t border-gs-border pt-3">
                <dt className="mb-1 text-gs-muted">{t("shippingAddress")}</dt>
                <dd className="text-[13px] leading-relaxed">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                  <br />
                  {order.shippingAddress.country}
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </div>
    </div>
  );
}
