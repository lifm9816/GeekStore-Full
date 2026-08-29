/**
 * Promociones activas del carousel de home (Día 15).
 */

import { prisma } from "@/lib/prisma";

export async function getActivePromotions() {
  return prisma.promotion.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      imageUrl: true,
      productId: true,
    },
  });
}

export type ActivePromotion = Awaited<
  ReturnType<typeof getActivePromotions>
>[number];
