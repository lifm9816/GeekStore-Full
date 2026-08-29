import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCrumb } from "@/components/product/ProductNavContext";
import { getCatalogProducts, serializeProduct } from "@/lib/products";
import { pageTitle } from "@/lib/page-title";
import { auth } from "@/auth";
import { getWishlistProductIds } from "@/lib/wishlist";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: pageTitle(t("brand"), t("productNotFound")) };
}

export default async function ProductNotFound() {
  const t = await getTranslations("notFound");
  const session = await auth();
  const wishlistedIds = session?.user?.id
    ? await getWishlistProductIds(session.user.id)
    : new Set<string>();
  const related = (await getCatalogProducts()).slice(0, 3).map(serializeProduct);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center md:px-6">
      <ProductCrumb label={t("title")} />
      <p className="text-6xl font-extrabold tracking-tight text-gs-muted">
        {t("code")}
      </p>
      <h1 className="mt-4 text-xl font-bold md:text-[20px]">{t("title")}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-gs-muted">
        {t("description")}
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-w-40 items-center justify-center rounded-[7px] bg-gs-accent px-5 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("backHome")}
        </Link>
        <Link
          href="/"
          className="inline-flex min-w-40 items-center justify-center rounded-[7px] border border-gs-border px-5 py-2.5 text-sm font-bold text-gs-text transition-colors hover:bg-gs-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("viewCatalog")}
        </Link>
      </div>

      {related.length > 0 ? (
        <section className="mt-14 text-left">
          <h2 className="mb-5 text-lg font-bold">{t("related")}</h2>
          <ul className="grid grid-cols-1 justify-items-center gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((product) => (
              <li key={product.id} className="w-full max-w-[280px]">
                <ProductCard
                  product={product}
                  heading="h3"
                  variant="compact"
                  wishlisted={wishlistedIds.has(product.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
