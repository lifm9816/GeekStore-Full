/**
 * Crear producto — categoryId + brandId + géneros + estelar (Día 15).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type NewProductPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: NewProductPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminProductNew")) };
}

export default async function AdminNewProductPage() {
  const tNav = await getTranslations("admin.nav");
  const [categories, brands, genres] = await Promise.all([
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

  return (
    <div>
      <AdminCrumb label={tNav("newProduct")} backHref="/admin/products" />
      <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-8 xl:p-10">
        <ProductForm
          mode="create"
          categories={categories}
          brands={brands}
          genres={genres}
        />
      </section>
    </div>
  );
}
