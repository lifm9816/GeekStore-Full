"use server";

/**
 * CRUD de productos admin (mockup 08).
 * categoryId y brandId van por separado (roadmap §8).
 */

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  createProductSchema,
  type AdminFormState,
} from "@/lib/validations/admin-product";

async function productMessages() {
  const t = await getTranslations("admin.productErrors");

  return {
    nameRequired: t("nameRequired"),
    descriptionRequired: t("descriptionRequired"),
    priceInvalid: t("priceInvalid"),
    stockInvalid: t("stockInvalid"),
    coverRequired: t("coverRequired"),
    categoryRequired: t("categoryRequired"),
    brandRequired: t("brandRequired"),
    heroRequired: t("heroRequired"),
  };
}

function parseGenreIds(formData: FormData) {
  return formData
    .getAll("genreIds")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function revalidateProductPaths(productId?: string) {
  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}`);

  if (productId) {
    revalidatePath(`/${locale}/product/${productId}`);
    revalidatePath(`/${locale}/admin/products/${productId}/edit`);
  }
}

/** Galería secundaria desde JSON en FormData (no incluye portada). */
function parseGalleryUrls(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string" || !raw.trim()) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && !item.startsWith("blob:"));
  } catch {
    return [];
  }
}

export async function createProduct(
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.productErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createProductSchema(await productMessages()).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    coverImageUrl: formData.get("coverImageUrl"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
    isFeatured: formData.get("isFeatured") === "true",
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const galleryUrls = parseGalleryUrls(formData.get("galleryUrls"));
  const genreIds = parseGenreIds(formData);

  const [category, brand] = await Promise.all([
    prisma.category.findUnique({ where: { id: data.categoryId } }),
    prisma.brand.findUnique({ where: { id: data.brandId } }),
  ]);

  if (!category || !brand) {
    return { error: t("relationInvalid") };
  }

  const connectGenres =
    category.slug === "videojuegos" && genreIds.length > 0
      ? { connect: genreIds.map((id) => ({ id })) }
      : undefined;

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        coverImageUrl: data.coverImageUrl,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: data.isFeatured,
        heroImageUrl: data.isFeatured ? (data.heroImageUrl ?? null) : null,
        genres: connectGenres,
        images: {
          create: galleryUrls.map((url, index) => ({
            url,
            order: index + 1,
          })),
        },
      },
    });

    await revalidateProductPaths(product.id);
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function updateProduct(
  productId: string,
  _prev: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.productErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  const parsed = createProductSchema(await productMessages()).safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    coverImageUrl: formData.get("coverImageUrl"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"),
    isFeatured: formData.get("isFeatured") === "true",
    heroImageUrl: String(formData.get("heroImageUrl") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const galleryUrls = parseGalleryUrls(formData.get("galleryUrls"));
  const genreIds = parseGenreIds(formData);

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    return { error: t("relationInvalid") };
  }

  const nextGenreIds =
    category.slug === "videojuegos" ? genreIds : ([] as string[]);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          coverImageUrl: data.coverImageUrl,
          categoryId: data.categoryId,
          brandId: data.brandId,
          isFeatured: data.isFeatured,
          heroImageUrl: data.isFeatured ? (data.heroImageUrl ?? null) : null,
          genres: {
            set: nextGenreIds.map((id) => ({ id })),
          },
        },
      });

      await tx.productImage.deleteMany({ where: { productId } });

      if (galleryUrls.length > 0) {
        await tx.productImage.createMany({
          data: galleryUrls.map((url, index) => ({
            productId,
            url,
            order: index + 1,
          })),
        });
      }
    });

    await revalidateProductPaths(productId);
    return { ok: true };
  } catch {
    return { error: t("generic") };
  }
}

export async function deleteProduct(
  productId: string,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const t = await getTranslations("admin.productErrors");

  if (!admin) {
    return { error: t("unauthorized") };
  }

  try {
    await prisma.product.delete({ where: { id: productId } });
    await revalidateProductPaths(productId);
    return { ok: true };
  } catch {
    return { error: t("deleteBlocked") };
  }
}
