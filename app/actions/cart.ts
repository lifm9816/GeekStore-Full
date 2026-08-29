"use server";

/**
 * Mutaciones del carrito de un usuario autenticado.
 * Un invitado nunca llega aquí: su carrito es solo localStorage (lib/cart-draft.ts).
 *
 * add / set / merge respetan Product.stock (mismo techo que handleQuantityChange).
 * Si el producto ya está en CartItem, se suman cantidades y luego se recorta al stock.
 */

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { clampQuantity } from "@/lib/cart";
import type { DraftCartItem } from "@/lib/cart-draft";
import { resolveCartFromDraft, getCartCount } from "@/lib/cart-query";
import { prisma } from "@/lib/prisma";

export type CartMutationResult = {
  ok: boolean;
  quantity?: number;
  cartCount?: number;
  reachedStockLimit?: boolean;
  error?: "unauthenticated" | "notFound" | "soldOut";
};

async function revalidateCart() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/cart`);
  revalidatePath(`/${locale}`, "layout");
}

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

type CartWriter = {
  cartItem: {
    findFirst: typeof prisma.cartItem.findFirst;
    create: typeof prisma.cartItem.create;
    update: typeof prisma.cartItem.update;
  };
};

/**
 * findFirst + create/update en vez de upsert(userId_productId).
 * El unique compuesto sí está en DB y en los tipos, pero el PrismaClient
 * cacheado por `next dev` puede seguir con el DMMF anterior a la migración
 * y rechazar `userId_productId` en runtime.
 */
async function saveCartItem(
  db: CartWriter,
  userId: string,
  productId: string,
  quantity: number,
) {
  const existing = await db.cartItem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: { quantity },
    });
  }

  return db.cartItem.create({
    data: { userId, productId, quantity },
  });
}

export async function addCartItem(
  productId: string,
  quantity = 1,
): Promise<CartMutationResult> {
  const userId = await requireUserId();

  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) {
    return { ok: false, error: "notFound" };
  }

  if (product.stock <= 0) {
    return { ok: false, error: "soldOut" };
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId },
  });
  const nextQuantity = clampQuantity(
    (existing?.quantity ?? 0) + quantity,
    product.stock,
  );
  const reachedStockLimit = nextQuantity >= product.stock;

  await saveCartItem(prisma, userId, productId, nextQuantity);

  await revalidateCart();

  return {
    ok: true,
    quantity: nextQuantity,
    cartCount: await getCartCount(userId),
    reachedStockLimit,
  };
}

export async function setCartItemQuantity(
  productId: string,
  quantity: number,
): Promise<CartMutationResult> {
  const userId = await requireUserId();

  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stock: true },
  });

  if (!product) {
    return { ok: false, error: "notFound" };
  }

  const nextQuantity = clampQuantity(quantity, product.stock);

  if (nextQuantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
    await revalidateCart();
    return { ok: true, quantity: 0, cartCount: await getCartCount(userId) };
  }

  await saveCartItem(prisma, userId, productId, nextQuantity);

  await revalidateCart();

  return {
    ok: true,
    quantity: nextQuantity,
    cartCount: await getCartCount(userId),
    reachedStockLimit: nextQuantity >= product.stock,
  };
}

export async function removeCartItem(
  productId: string,
): Promise<CartMutationResult> {
  const userId = await requireUserId();

  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  await prisma.cartItem.deleteMany({
    where: { userId, productId },
  });
  await revalidateCart();

  return { ok: true, quantity: 0, cartCount: await getCartCount(userId) };
}

export async function mergeGuestCart(
  items: DraftCartItem[],
): Promise<CartMutationResult> {
  const userId = await requireUserId();

  if (!userId) {
    return { ok: false, error: "unauthenticated" };
  }

  const sanitized = items.filter(
    (item) =>
      typeof item.productId === "string" &&
      item.productId.length > 0 &&
      Number.isFinite(item.quantity),
  );

  if (sanitized.length === 0) {
    return { ok: true };
  }

  await prisma.$transaction(async (tx) => {
    for (const item of sanitized) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true },
      });

      if (!product || product.stock <= 0) {
        continue;
      }

      const existing = await tx.cartItem.findFirst({
        where: { userId, productId: item.productId },
      });
      const nextQuantity = clampQuantity(
        (existing?.quantity ?? 0) + item.quantity,
        product.stock,
      );

      if (nextQuantity <= 0) {
        continue;
      }

      await saveCartItem(tx, userId, item.productId, nextQuantity);
    }
  });

  await revalidateCart();

  return { ok: true, cartCount: await getCartCount(userId) };
}

export async function hydrateGuestCart(items: DraftCartItem[]) {
  return resolveCartFromDraft(items);
}
