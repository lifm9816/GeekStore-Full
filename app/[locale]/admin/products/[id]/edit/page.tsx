/**
 * Editar producto (stock, géneros, estelar).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: EditProductPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminProductEdit")) };
}

export default async function AdminEditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, categories, brands, genres] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" }, select: { url: true } },
        genres: { select: { id: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <AdminCrumb label={product.name} backHref="/admin/products" />
      <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-8 xl:p-10">
        <ProductForm
          mode="edit"
          productId={product.id}
          categories={categories}
          brands={brands}
          genres={genres}
          defaults={{
            name: product.name,
            description: product.description,
            price: String(Number(product.price)),
            stock: String(product.stock),
            coverImageUrl: product.coverImageUrl,
            categoryId: product.categoryId,
            brandId: product.brandId,
            genreIds: product.genres.map((genre) => genre.id),
            isFeatured: product.isFeatured,
            heroImageUrl: product.heroImageUrl,
            galleryUrls: product.images.map((image) => image.url),
          }}
        />
      </section>
    </div>
  );
}
