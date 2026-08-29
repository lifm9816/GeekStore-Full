"use server";

/**
 * CRUD de categorías (Días 12–13). Sin color/IA — solo name + slug.
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin, slugify } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createCategorySchema,
  type AdminFormState,
} from "@/lib/validations/admin-product";

async function categoryMessages() {
  const t = await getTranslations("admin.categoryErrors");
  return { nameRequired: t("nameRequired") };
}

async function revalidateCategoryPaths() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/categories`);
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}`);
}

async function uniqueCategorySlug(name: string, excludeId?: string) {
  let slug = slugify(name);

  if (!slug) {
    return null;
  }

  const existing = await prisma.category.findUnique({ where: { slug } });

  if (existing && existing.id !== excludeId) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return slug;
}

export async function createCategory(
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.categoryErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createCategorySchema(await categoryMessages()).safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = await uniqueCategorySlug(parsed.data.name);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  try {
    await prisma.category.create({
      data: { name: parsed.data.name, slug },
    });
    await revalidateCategoryPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function updateCategory(
  categoryId: string,
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.categoryErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createCategorySchema(await categoryMessages()).safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = await uniqueCategorySlug(parsed.data.name, categoryId);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name: parsed.data.name, slug },
    });
    await revalidateCategoryPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function deleteCategory(
  categoryId: string,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.categoryErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const productCount = await prisma.product.count({
    where: { categoryId },
  });

  if (productCount > 0) {
    return { error: t("deleteBlocked", { count: productCount }) };
  }

  try {
    await prisma.category.delete({ where: { id: categoryId } });
    await revalidateCategoryPaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}
