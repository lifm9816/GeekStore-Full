/**
 * Tabla de órdenes recientes / lista admin (mockup 07 + ver órdenes).
 */

import { Link } from "@/i18n/navigation";
import { formatOrderNumber } from "@/lib/order";

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-gs-warning/15 text-gs-warning",
  PAID: "bg-gs-accent/15 text-gs-accent-strong",
  SHIPPED: "bg-gs-accent/15 text-gs-accent-strong",
  CANCELLED: "bg-gs-critical/15 text-gs-critical",
};

export type AdminOrderRow = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  customerName: string | null;
};

type AdminOrdersTableProps = {
  title?: string;
  orders: AdminOrderRow[];
  emptyLabel: string;
  labels: {
    order: string;
    customer: string;
    total: string;
    status: string;
    date: string;
  };
  statusLabel: (status: string) => string;
  formatMoney: (value: number) => string;
  formatDate: (date: Date) => string;
  detailHref?: (id: string) => string;
};

export function AdminOrdersTable({
  title,
  orders,
  emptyLabel,
  labels,
  statusLabel,
  formatMoney,
  formatDate,
  detailHref,
}: AdminOrdersTableProps) {
  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
      {title ? <h2 className="mb-4 text-[15px] font-bold">{title}</h2> : null}

      {orders.length === 0 ? (
        <p className="text-sm text-gs-muted">{emptyLabel}</p>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gs-border text-[12px] text-gs-muted">
                <th className="px-2 py-2 font-semibold">{labels.order}</th>
                <th className="px-2 py-2 font-semibold">{labels.customer}</th>
                <th className="px-2 py-2 font-semibold">{labels.total}</th>
                <th className="px-2 py-2 font-semibold">{labels.status}</th>
                <th className="px-2 py-2 font-semibold">{labels.date}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusClass =
                  STATUS_CLASS[order.status] ?? STATUS_CLASS.PENDING;
                const number = formatOrderNumber(order.id);

                return (
                  <tr key={order.id} className="border-b border-gs-border/70">
                    <td className="px-2 py-3 font-bold">
                      {detailHref ? (
                        <Link
                          href={detailHref(order.id)}
                          className="text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                        >
                          {number}
                        </Link>
                      ) : (
                        number
                      )}
                    </td>
                    <td className="px-2 py-3 text-gs-muted">
                      {order.customerName ?? "—"}
                    </td>
                    <td className="px-2 py-3 font-semibold">
                      {formatMoney(order.total)}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusClass}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-current"
                          aria-hidden="true"
                        />
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-gs-muted">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
