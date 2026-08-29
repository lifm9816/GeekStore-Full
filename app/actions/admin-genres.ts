"use server";

/**
 * CRUD de géneros (Día 15). Relación m2m con Product — opcional en videojuegos.
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin, slugify } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createCategorySchema,
  type AdminFormState,
} from "@/lib/validations/admin-product";

async function genreMessages() {
  const t = await getTranslations("admin.genreErrors");
  return { nameRequired: t("nameRequired") };
}

async function revalidateGenrePaths() {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/genres`);
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}`);
}

async function uniqueGenreSlug(name: string, excludeId?: string) {
  let slug = slugify(name);

  if (!slug) {
    return null;
  }

  const existing = await prisma.genre.findUnique({ where: { slug } });

  if (existing && existing.id !== excludeId) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return slug;
}

export async function createGenre(
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.genreErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createCategorySchema(await genreMessages()).safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = await uniqueGenreSlug(parsed.data.name);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  try {
    await prisma.genre.create({
      data: { name: parsed.data.name, slug },
    });
    await revalidateGenrePaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function updateGenre(
  genreId: string,
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.genreErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createCategorySchema(await genreMessages()).safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const slug = await uniqueGenreSlug(parsed.data.name, genreId);

  if (!slug) {
    return { error: t("nameRequired") };
  }

  try {
    await prisma.genre.update({
      where: { id: genreId },
      data: { name: parsed.data.name, slug },
    });
    await revalidateGenrePaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function deleteGenre(genreId: string): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.genreErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const productCount = await prisma.product.count({
    where: { genres: { some: { id: genreId } } },
  });

  if (productCount > 0) {
    return { error: t("deleteBlocked", { count: productCount }) };
  }

  try {
    await prisma.genre.delete({ where: { id: genreId } });
    await revalidateGenrePaths();
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}
