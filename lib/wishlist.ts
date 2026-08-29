/**
 * Wishlist real (Hito 1 schema, UI Día 8).
 * @@unique([userId, productId]) vive en DB; el corazón solo inserta o borra.
 */

import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

export async function getWishlistProductIds(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });

  return new Set(rows.map((row) => row.productId));
}

export async function getWishlistItems(userId: string) {
  const rows = await prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
          genres: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    wishlistId: row.id,
    product: serializeProduct(row.product),
  }));
}
