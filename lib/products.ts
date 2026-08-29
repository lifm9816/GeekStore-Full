/**
 * Consultas de catálogo y búsqueda básica.
 * getRelatedProducts: detalle/404/carrito (categoría/marca).
 * searchProducts: /search — contains insensitive (no Hito 3).
 */

import { prisma } from "@/lib/prisma";

const catalogInclude = {
  brand: true,
  category: true,
  genres: { select: { id: true, name: true, slug: true } },
} as const;

const productDetailInclude = {
  brand: true,
  category: true,
  genres: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: { order: "asc" as const },
  },
  _count: {
    select: { reviews: true },
  },
};

export type CatalogProduct = Awaited<
  ReturnType<typeof getCatalogProducts>
>[number];

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductById>>
>;

export async function getCatalogProducts() {
  return prisma.product.findMany({
    include: catalogInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
}

export async function getRelatedProducts(
  product: {
    id: string;
    categoryId: string;
    brandId: string;
  },
  options?: {
    excludeIds?: string[];
    take?: number;
  },
) {
  const excludeIds = Array.from(
    new Set([product.id, ...(options?.excludeIds ?? [])]),
  );

  return prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
      OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
    },
    include: catalogInclude,
    take: options?.take ?? 3,
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Búsqueda básica (texto plano). Hito 1 — no filtros avanzados / semántica.
 * Coincidencia parcial en name y description (case-insensitive).
 */
export async function searchProducts(query: string) {
  const q = query.trim();

  if (!q) {
    return [];
  }

  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: catalogInclude,
    orderBy: { name: "asc" },
  });
}

export function serializeProduct(product: CatalogProduct) {
  return {
    id: product.id,
    name: product.name,
    price: product.price.toString(),
    stock: product.stock,
    coverImageUrl: product.coverImageUrl,
    isFeatured: product.isFeatured,
    heroImageUrl: product.heroImageUrl,
    brand: {
      name: product.brand.name,
      slug: product.brand.slug,
      bannerColor: product.brand.bannerColor,
      logoUrl: product.brand.logoUrl,
    },
    category: {
      name: product.category.name,
      slug: product.category.slug,
    },
    genres: product.genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    })),
  };
}

export type SerializedProduct = ReturnType<typeof serializeProduct>;
