"use server";

/**
 * Corazón de wishlist (roadmap §8): un solo control.
 * outline = agregar, relleno = ya está y el clic lo quita.
 *
 * findFirst + create/delete en vez de upsert(userId_productId): el unique
 * compuesto existe, pero next dev puede cachear un PrismaClient viejo
 * (misma lección que CartItem en app/actions/cart.ts).
 */

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type WishlistMutationResult = {
  ok: boolean;
  wishlisted: boolean;
  error?: "unauthenticated" | "notFound";
};

async function revalidateWishlist() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/account/wishlist`);
  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}`);
  revalidatePath(`/${locale}`, "layout");
}

export async function toggleWishlist(
  productId: string,
): Promise<WishlistMutationResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return { ok: false, wishlisted: false, error: "unauthenticated" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return { ok: false, wishlisted: false, error: "notFound" };
  }

  const existing = await prisma.wishlist.findFirst({
    where: { userId, productId },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    await revalidateWishlist();
    return { ok: true, wishlisted: false };
  }

  await prisma.wishlist.create({
    data: { userId, productId },
  });
  await revalidateWishlist();
  return { ok: true, wishlisted: true };
}
