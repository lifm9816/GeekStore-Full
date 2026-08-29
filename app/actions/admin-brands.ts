"use server";

/**
 * Gestión de marcas + sugerencia IA de bannerColor (Días 12–13).
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin, slugify } from "@/lib/admin";
import { suggestBrandBannerColor } from "@/lib/ai/suggest-brand-color";
import { prisma } from "@/lib/prisma";
import {
  createBrandSchema,
  type AdminFormState,
} from "@/lib/validations/admin-product";

async function brandMessages() {
  const t = await getTranslations("admin.brandErrors");

  return {
    nameRequired: t("nameRequired"),
    logoRequired: t("logoRequired"),
    colorInvalid: t("colorInvalid"),
  };
}

async function revalidateBrandPaths() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/brands`);
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}`);
}

export async function suggestBannerColorAction(
  brandName: string,
): Promise<{ bannerColor?: string; error?: string }> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.brandErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  if (!brandName.trim()) {
    return { error: t("nameRequired") };
  }

  const result = await suggestBrandBannerColor(brandName);
  return { bannerColor: result.bannerColor };
}

export async function createBrand(
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.brandErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createBrandSchema(await brandMessages()).safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl"),
    bannerColor: formData.get("bannerColor"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  let slug = slugify(data.name);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  const existing = await prisma.brand.findUnique({ where: { slug } });

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  try {
    await prisma.brand.create({
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
        bannerColor: data.bannerColor.toUpperCase(),
      },
    });

    await revalidateBrandPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function updateBrand(
  brandId: string,
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.brandErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createBrandSchema(await brandMessages()).safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl"),
    bannerColor: formData.get("bannerColor"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  let slug = slugify(data.name);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  const existing = await prisma.brand.findUnique({ where: { slug } });

  if (existing && existing.id !== brandId) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  try {
    await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
        bannerColor: data.bannerColor.toUpperCase(),
      },
    });

    await revalidateBrandPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function deleteBrand(brandId: string): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.brandErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const productCount = await prisma.product.count({
    where: { brandId },
  });

  if (productCount > 0) {
    return { error: t("deleteBlocked", { count: productCount }) };
  }

  try {
    await prisma.brand.delete({ where: { id: brandId } });
    await revalidateBrandPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}
