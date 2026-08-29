import type { Metadata } from "next";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCrumb } from "@/components/product/ProductNavContext";
import { ProductGallery } from "@/components/product/ProductGallery";
import { GenreBadges } from "@/components/product/GenreBadges";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { FeaturedProductView } from "@/components/product/FeaturedProductView";
import {
  getProductById,
  getRelatedProducts,
  serializeProduct,
} from "@/lib/products";
import { pageTitle } from "@/lib/page-title";
import type { AppLocale } from "@/i18n/routing";
import { auth } from "@/auth";
import { WishlistButton } from "@/components/product/WishlistButton";
import { getWishlistProductIds } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const product = await getProductById(id);

  if (!product) {
    const t = await getTranslations({ locale, namespace: "meta" });
    return { title: pageTitle(t("brand"), t("productNotFound")) };
  }

  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: pageTitle(t("brand"), product.name),
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const t = await getTranslations("product");
  const format = await getFormatter();
  const session = await auth();
  const wishlistedIds = session?.user?.id
    ? await getWishlistProductIds(session.user.id)
    : new Set<string>();
  const related = (await getRelatedProducts(product)).map(serializeProduct);
  const soldOut = product.stock <= 0;
  const price = format.number(Number(product.price), {
    style: "currency",
    currency: "MXN",
  });
  const wishlisted = wishlistedIds.has(product.id);
  const isFeatured = product.isFeatured && Boolean(product.heroImageUrl);

  const gallery = [
    {
      url: product.coverImageUrl,
      alt: t("coverAlt", { name: product.name, brand: product.brand.name }),
    },
    ...product.images.map((image, index) => ({
      url: image.url,
      alt: t("galleryAlt", {
        name: product.name,
        brand: product.brand.name,
        index: index + 2,
      }),
    })),
  ];

  return (
    <div
      className={
        isFeatured
          ? "w-full pb-28"
          : "mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:py-12"
      }
    >
      <div className={isFeatured ? "mx-auto max-w-6xl px-4 md:px-6" : undefined}>
        <ProductCrumb label={product.name} />
      </div>

      {isFeatured && product.heroImageUrl ? (
        <FeaturedProductView
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            stock: product.stock,
            heroImageUrl: product.heroImageUrl,
            brand: {
              name: product.brand.name,
              bannerColor: product.brand.bannerColor,
            },
            genres: product.genres,
          }}
          priceLabel={price}
          soldOut={soldOut}
          inStockLabel={t("inStock", { count: product.stock })}
          soldOutLabel={t("soldOut")}
          genresLabel={t("genres")}
          wishlisted={wishlisted}
          noReviews={
            product._count.reviews === 0 ? t("noReviews") : null
          }
        />
      ) : (
        <article>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
            <ProductGallery name={product.name} images={gallery} />

            <section className="relative rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-7">
              <div
                className="-mx-5 -mt-5 mb-5 h-1.5 md:-mx-7 md:-mt-7"
                style={{ backgroundColor: product.brand.bannerColor }}
                aria-hidden="true"
              />

              <div className="absolute right-4 top-8 z-10 md:right-6">
                <WishlistButton
                  productId={product.id}
                  initialWishlisted={wishlisted}
                  variant="detail"
                />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.08em] text-gs-accent">
                {product.brand.name}
              </p>
              <h1 className="mt-3 pr-8 text-2xl font-extrabold tracking-tight md:text-[26px]">
                {product.name}
              </h1>

              <GenreBadges
                genres={product.genres}
                label={t("genres")}
                className="mt-3 justify-start"
              />

              <p className="mt-4 text-[30px] font-extrabold leading-none text-gs-accent-strong">
                {price}
              </p>

              <p
                className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                  soldOut
                    ? "bg-gs-critical/15 text-gs-critical"
                    : "bg-gs-accent/15 text-gs-accent-strong"
                }`}
              >
                {soldOut
                  ? t("soldOut")
                  : t("inStock", { count: product.stock })}
              </p>

              <p className="mt-5 text-sm leading-relaxed text-gs-muted md:text-[14px] md:leading-7">
                {product.description}
              </p>

              <hr className="my-6 border-gs-border" />

              <ProductPurchase productId={product.id} stock={product.stock} />

              {product._count.reviews === 0 ? (
                <>
                  <hr className="my-6 border-gs-border" />
                  <p className="text-sm text-gs-muted">{t("noReviews")}</p>
                </>
              ) : null}
            </section>
          </div>
        </article>
      )}

      {related.length > 0 ? (
        <section
          className={
            isFeatured
              ? "mx-auto mt-12 max-w-6xl px-4 md:px-6"
              : "mt-12"
          }
        >
          <h2 className="mb-5 text-lg font-bold">{t("related")}</h2>
          <ul className="grid grid-cols-1 justify-items-center gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id} className="h-full w-full max-w-[280px]">
                <ProductCard
                  product={item}
                  heading="h3"
                  variant="compact"
                  wishlisted={wishlistedIds.has(item.id)}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
