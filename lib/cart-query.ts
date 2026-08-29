/**
 * Lecturas de carrito contra Prisma. Las mutaciones viven en app/actions/cart.ts.
 *
 * Un invitado no pasa por aquí para persistir: resolveCartFromDraft solo hidrata
 * precios/stock actuales a partir de los ids guardados en localStorage.
 */

import type { CartLine } from "@/lib/cart";
import { clampQuantity } from "@/lib/cart";
import type { DraftCartItem } from "@/lib/cart-draft";
import { prisma } from "@/lib/prisma";
import {
  getRelatedProducts,
  serializeProduct,
  type SerializedProduct,
} from "@/lib/products";

const lineInclude = {
  brand: true,
  category: true,
} as const;

type ProductWithBrand = {
  id: string;
  name: string;
  price: { toString(): string } | number;
  stock: number;
  coverImageUrl: string;
  brand: { name: string };
};

function toCartLine(product: ProductWithBrand, quantity: number): CartLine {
  return {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    stock: product.stock,
    coverImageUrl: product.coverImageUrl,
    brandName: product.brand.name,
    quantity,
  };
}

export async function getCartCount(userId: string) {
  const aggregate = await prisma.cartItem.aggregate({
    where: { userId },
    _sum: { quantity: true },
  });

  return aggregate._sum.quantity ?? 0;
}

export async function getUserCartLines(userId: string): Promise<CartLine[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: { include: { brand: true } },
    },
    orderBy: { id: "asc" },
  });

  return items.map((item) => {
    const quantity =
      item.product.stock <= 0
        ? item.quantity
        : clampQuantity(item.quantity, item.product.stock);

    return toCartLine(item.product, quantity);
  });
}

export async function getRelatedForCart(
  cartProductIds: string[],
): Promise<SerializedProduct[]> {
  if (cartProductIds.length === 0) {
    return [];
  }

  const first = await prisma.product.findUnique({
    where: { id: cartProductIds[0] },
    include: lineInclude,
  });

  if (!first) {
    return [];
  }

  // Opción A (Días 6-7): misma heurística de categoría/marca que el detalle.
  // Claude API sustituye esta fuente en el Día 13.
  const related = await getRelatedProducts(first, {
    excludeIds: cartProductIds,
    take: 2,
  });

  return related.map(serializeProduct);
}

export async function resolveCartFromDraft(items: DraftCartItem[]): Promise<{
  lines: CartLine[];
  related: SerializedProduct[];
}> {
  if (items.length === 0) {
    return { lines: [], related: [] };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    include: lineInclude,
  });
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: CartLine[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);

    if (!product) {
      continue;
    }

    const quantity =
      product.stock <= 0 ? 0 : clampQuantity(item.quantity, product.stock);

    lines.push(toCartLine(product, quantity));
  }

  const related = await getRelatedForCart(lines.map((line) => line.productId));

  return { lines, related };
}
