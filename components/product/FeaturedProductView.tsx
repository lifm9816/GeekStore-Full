/**
 * Layout hero de producto estelar (Día 15) — inspirado en páginas PlayStation.
 */

import Image from "next/image";
import { GenreBadges } from "@/components/product/GenreBadges";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { StickyPurchaseBar } from "@/components/product/StickyPurchaseBar";
import { WishlistButton } from "@/components/product/WishlistButton";

type FeaturedProductViewProps = {
  product: {
    id: string;
    name: string;
    description: string;
    stock: number;
    heroImageUrl: string;
    brand: { name: string; bannerColor: string };
    genres: { id: string; name: string }[];
  };
  priceLabel: string;
  soldOut: boolean;
  inStockLabel: string;
  soldOutLabel: string;
  genresLabel: string;
  wishlisted: boolean;
  noReviews?: string | null;
};

export function FeaturedProductView({
  product,
  priceLabel,
  soldOut,
  inStockLabel,
  soldOutLabel,
  genresLabel,
  wishlisted,
  noReviews,
}: FeaturedProductViewProps) {
  return (
    <>
      <section className="relative -mx-4 overflow-hidden md:-mx-6">
        <div className="relative min-h-[52vh] w-full md:min-h-[62vh]">
          <Image
            src={product.heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-gs-bg via-gs-bg/55 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-6 md:pb-12">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-gs-accent">
                {product.brand.name}
              </p>
              <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight text-white drop-shadow md:text-5xl">
                {product.name}
              </h1>
              <GenreBadges
                genres={product.genres}
                label={genresLabel}
                className="mt-4 justify-start"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-12">
        <div>
          <p className="text-sm leading-relaxed text-gs-muted md:text-[15px] md:leading-7">
            {product.description}
          </p>
          {noReviews ? (
            <p className="mt-6 text-sm text-gs-muted">{noReviews}</p>
          ) : null}
        </div>

        <section
          id="featured-purchase-panel"
          className="relative h-fit rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-7 lg:sticky lg:top-28"
        >
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
          <p className="text-[30px] font-extrabold leading-none text-gs-accent-strong">
            {priceLabel}
          </p>
          <p
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
              soldOut
                ? "bg-gs-critical/15 text-gs-critical"
                : "bg-gs-accent/15 text-gs-accent-strong"
            }`}
          >
            {soldOut ? soldOutLabel : inStockLabel}
          </p>
          <hr className="my-6 border-gs-border" />
          <ProductPurchase productId={product.id} stock={product.stock} />
        </section>
      </div>

      <StickyPurchaseBar
        targetId="featured-purchase-panel"
        productId={product.id}
        stock={product.stock}
        priceLabel={priceLabel}
        productName={product.name}
      />
    </>
  );
}
