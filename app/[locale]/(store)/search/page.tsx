/**
 * Búsqueda básica de productos (/search?q=…).
 * Barra al estilo Demo + resultados en vivo (debounce) con ProductCard.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchForm } from "@/components/search/SearchForm";
import { Link } from "@/i18n/navigation";
import { searchProducts, serializeProduct } from "@/lib/products";
import { pageTitle } from "@/lib/page-title";
import { getWishlistProductIds } from "@/lib/wishlist";
import type { AppLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ q?: string | string[] }>;
};

function normalizeQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("search")) };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const t = await getTranslations("search");
  const query = normalizeQuery((await searchParams).q);
  const hasQuery = query.length > 0;

  const session = await auth();
  const wishlistedIds = session?.user?.id
    ? await getWishlistProductIds(session.user.id)
    : new Set<string>();

  const products = hasQuery
    ? (await searchProducts(query)).map(serializeProduct)
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-3 md:px-6 md:pb-10 md:pt-5 lg:pb-12">
      <h1 className="sr-only">{t("title")}</h1>

      <div className="mb-6 md:mb-8">
        <SearchForm defaultQuery={query} />
      </div>

      {!hasQuery ? null : products.length === 0 ? (
        <section className="mx-auto mt-6 max-w-md rounded-[10px] border border-gs-border bg-gs-surface px-6 py-12 text-center md:mt-8">
          <h2 className="text-xl font-bold">{t("emptyTitle", { query })}</h2>
          <p className="mt-2 text-sm text-gs-muted">{t("emptyDescription")}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {t("browseCatalog")}
          </Link>
        </section>
      ) : (
        <ul className="grid grid-cols-1 justify-items-center gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-16">
          {products.map((product) => (
            <li key={product.id} className="h-full w-full max-w-[280px]">
              <ProductCard
                product={product}
                wishlisted={wishlistedIds.has(product.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
