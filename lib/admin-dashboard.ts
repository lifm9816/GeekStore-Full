/**
 * Lecturas del dashboard admin (mockup 07).
 * Ventas = órdenes PAID | SHIPPED (no PENDING/CANCELLED).
 */

import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin";

const PAID_STATUSES = ["PAID", "SHIPPED"] as const;

export type AdminDashboardStats = {
  totalSales: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  pendingOrders: number;
  lowStockCount: number;
};

export type SalesDay = {
  dateKey: string;
  label: string;
  total: number;
};

export type TopProductRow = {
  productId: string;
  name: string;
  coverImageUrl: string;
  unitsSold: number;
};

export type RecentOrderRow = {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  customerName: string | null;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [salesAgg, orderCount, productCount, userCount, pendingOrders, lowStockCount] =
    await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: [...PAID_STATUSES] } },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { stock: { lt: LOW_STOCK_THRESHOLD } } }),
    ]);

  return {
    totalSales: Number(salesAgg._sum.total ?? 0),
    orderCount,
    productCount,
    userCount,
    pendingOrders,
    lowStockCount,
  };
}

/** Últimos 7 días calendario (hoy inclusive), totales PAID/SHIPPED. */
export async function getSalesLast7Days(
  locale: string,
): Promise<SalesDay[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: [...PAID_STATUSES] },
      createdAt: { gte: start },
    },
    select: { createdAt: true, total: true },
  });

  const byDay = new Map<string, number>();

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const key = day.toISOString().slice(0, 10);
    byDay.set(key, 0);
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) ?? 0) + Number(order.total));
    }
  }

  const dayFormatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });

  return [...byDay.entries()].map(([dateKey, total]) => {
    const date = new Date(`${dateKey}T12:00:00`);
    return {
      dateKey,
      label: dayFormatter.format(date),
      total,
    };
  });
}

export async function getTopProducts(limit = 5): Promise<TopProductRow[]> {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      order: { status: { in: [...PAID_STATUSES] } },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { id: { in: grouped.map((row) => row.productId) } },
    select: { id: true, name: true, coverImageUrl: true },
  });

  const byId = new Map(products.map((p) => [p.id, p]));

  return grouped
    .map((row) => {
      const product = byId.get(row.productId);
      if (!product) {
        return null;
      }

      return {
        productId: product.id,
        name: product.name,
        coverImageUrl: product.coverImageUrl,
        unitsSold: row._sum.quantity ?? 0,
      };
    })
    .filter((row): row is TopProductRow => row !== null);
}

export async function getRecentOrders(limit = 8): Promise<RecentOrderRow[]> {
  const orders = await prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.user.name ?? order.user.email,
  }));
}
