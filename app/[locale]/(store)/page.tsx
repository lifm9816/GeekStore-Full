import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeBannerCarousel } from "@/components/home/HomeBannerCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { getCatalogProducts, serializeProduct } from "@/lib/products";
import { getActivePromotions } from "@/lib/promotions";
import { pageTitle } from "@/lib/page-title";
import type { AppLocale } from "@/i18n/routing";
import { auth } from "@/auth";
import { getWishlistProductIds } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

type HomePageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("home")) };
}

export default async function CatalogPage() {
  const t = await getTranslations("catalog");
  const session = await auth();
  const wishlistedIds = session?.user?.id
    ? await getWishlistProductIds(session.user.id)
    : new Set<string>();
  const products = (await getCatalogProducts()).map(serializeProduct);
  const promotions = await getActivePromotions();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2.5 md:px-6 md:pb-10 lg:pb-12">
      <div className="mb-6 flex justify-center md:mb-8">
        <div className="w-full lg:w-1/2">
          <HomeBannerCarousel slides={promotions} />
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-extrabold tracking-tight md:mb-8 md:text-3xl">
        {t("title")}
      </h1>

      {products.length === 0 ? (
        <section className="rounded-[10px] border border-gs-border bg-gs-surface px-6 py-16 text-center">
          <h2 className="text-xl font-bold">{t("emptyTitle")}</h2>
          <p className="mt-2 text-gs-muted">{t("emptyDescription")}</p>
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
