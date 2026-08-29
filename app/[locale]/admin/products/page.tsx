/**
 * Mockup 08 — listado de productos (CRUD).
 */

import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { ProductTable } from "@/components/admin/ProductTable";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminProducts")) };
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  const { q } = await searchParams;
  const t = await getTranslations("admin.products");
  const format = await getFormatter();
  const query = q?.trim();

  const products = await prisma.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title={t("title")}>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-header transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("newProduct")}
        </Link>
      </AdminPageHeader>

      <form method="get" className="mb-5 max-w-xs">
        <label htmlFor="product-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={query}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-[10px] border border-gs-border bg-gs-input-bg px-3 py-2.5 text-sm text-gs-text placeholder:text-gs-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        />
      </form>

      <ProductTable
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          coverImageUrl: product.coverImageUrl,
          price: Number(product.price),
          stock: product.stock,
          brandName: product.brand.name,
          categoryName: product.category.name,
        }))}
        emptyLabel={t("empty")}
        labels={{
          product: t("table.product"),
          brand: t("table.brand"),
          category: t("table.category"),
          price: t("table.price"),
          stock: t("table.stock"),
          actions: t("table.actions"),
          edit: t("edit"),
        }}
        formatMoney={(value) =>
          format.number(value, { style: "currency", currency: "MXN" })
        }
      />
    </div>
  );
}
