/**
 * Lista real de Order (mockup 04). Hoy el seed no crea órdenes; si checkout
 * las genera, los 4 badges mapean 1:1 a Order.status. El id visible es un
 * recorte del cuid — no se inventan números #GK- falsos.
 */

import { getFormatter, getTranslations } from "next-intl/server";
import Image from "next/image";
import type { getOrdersForAccount } from "@/lib/account";
import { formatOrderNumber } from "@/lib/order";

type OrdersListProps = {
  orders: Awaited<ReturnType<typeof getOrdersForAccount>>;
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-gs-warning/15 text-gs-warning",
  PAID: "bg-gs-accent/15 text-gs-accent-strong",
  SHIPPED: "bg-gs-accent/15 text-gs-accent-strong",
  CANCELLED: "bg-gs-critical/15 text-gs-critical",
};

const MAX_ORDER_THUMBS = 3;

export async function OrdersList({ orders }: OrdersListProps) {
  const t = await getTranslations("account");
  const format = await getFormatter();

  return (
    <section className="md:max-w-none">
      <h2 className="mb-4 text-[15px] font-bold md:mb-5 md:text-lg">
        {t("orderHistory")}
      </h2>
      <ul className="flex flex-col gap-3 md:gap-4">
        {orders.map((order) => {
          const thumbs = order.items.slice(0, MAX_ORDER_THUMBS);
          const overflow = order._count.items - thumbs.length;
          const statusClass = STATUS_CLASS[order.status] ?? STATUS_CLASS.PENDING;
          const thumbGrayscale =
            order.status === "CANCELLED" ? "grayscale" : "";

          return (
            <li
              key={order.id}
              className={`flex items-center gap-3 rounded-[10px] border border-gs-border bg-gs-surface p-4 md:gap-5 md:p-5 ${
                order.status === "CANCELLED" ? "opacity-60" : ""
              }`}
            >
              {thumbs.length > 0 ? (
                <div
                  className="flex shrink-0 items-center"
                  aria-label={t("orderThumbsLabel", {
                    count: order._count.items,
                  })}
                >
                  {thumbs.map((item, index) => (
                    <Image
                      key={item.id}
                      src={item.product.coverImageUrl}
                      alt={t("orderThumbAlt", {
                        name: item.product.name,
                        brand: item.product.brand.name,
                      })}
                      width={56}
                      height={56}
                      className={`h-11 w-11 rounded-[8px] border-2 border-gs-surface object-cover md:h-14 md:w-14 ${thumbGrayscale} ${
                        index > 0 ? "-ml-3 md:-ml-4" : ""
                      }`}
                    />
                  ))}
                  {overflow > 0 ? (
                    <span
                      className={`-ml-3 flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-gs-surface bg-gs-surface-2 text-[11px] font-bold text-gs-muted md:-ml-4 md:h-14 md:w-14 md:text-xs ${thumbGrayscale}`}
                      aria-hidden="true"
                    >
                      {t("orderMoreItems", { count: overflow })}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="h-11 w-11 shrink-0 rounded-[8px] bg-gs-surface-2 md:h-14 md:w-14" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold md:text-base">
                  {formatOrderNumber(order.id)}
                </p>
                <p className="text-xs text-gs-muted md:text-sm">
                  {t("orderMeta", {
                    date: format.dateTime(order.createdAt, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                    count: order._count.items,
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm font-bold md:text-base">
                  {format.number(Number(order.total), {
                    style: "currency",
                    currency: "MXN",
                  })}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold md:px-3 md:py-1.5 md:text-[13px] ${statusClass}`}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-current md:h-2 md:w-2"
                    aria-hidden="true"
                  />
                  {t(`orderStatus.${order.status}`)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
