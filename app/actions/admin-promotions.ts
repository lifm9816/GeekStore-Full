"use server";

/**
 * CRUD de promociones / banners del carousel (Día 15).
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createPromotionSchema,
  type AdminFormState,
} from "@/lib/validations/admin-product";

async function promotionMessages() {
  const t = await getTranslations("admin.promotionErrors");
  return {
    titleRequired: t("titleRequired"),
    imageRequired: t("imageRequired"),
    productRequired: t("productRequired"),
    orderInvalid: t("orderInvalid"),
  };
}

async function revalidatePromotionPaths() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/promotions`);
  revalidatePath(`/${locale}`);
}

export async function createPromotion(
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.promotionErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createPromotionSchema(await promotionMessages()).safeParse({
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    productId: formData.get("productId"),
    order: formData.get("order"),
    active: formData.get("active") === "true",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });

  if (!product) {
    return { error: t("productInvalid") };
  }

  try {
    await prisma.promotion.create({ data: parsed.data });
    await revalidatePromotionPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function updatePromotion(
  promotionId: string,
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.promotionErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createPromotionSchema(await promotionMessages()).safeParse({
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    productId: formData.get("productId"),
    order: formData.get("order"),
    active: formData.get("active") === "true",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true },
  });

  if (!product) {
    return { error: t("productInvalid") };
  }

  try {
    await prisma.promotion.update({
      where: { id: promotionId },
      data: parsed.data,
    });
    await revalidatePromotionPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function deletePromotion(
  promotionId: string,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.promotionErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  try {
    await prisma.promotion.delete({ where: { id: promotionId } });
    await revalidatePromotionPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}
