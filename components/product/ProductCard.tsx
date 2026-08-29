import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { CardCover } from "@/components/product/CardCover";
import { GenreBadges } from "@/components/product/GenreBadges";
import { WishlistButton } from "@/components/product/WishlistButton";
import type { SerializedProduct } from "@/lib/products";

type ProductCardProps = {
  product: SerializedProduct;
  heading?: "h2" | "h3";
  variant?: "full" | "compact";
  wishlisted?: boolean;
};

export async function ProductCard({
  product,
  heading = "h2",
  variant = "full",
  wishlisted = false,
}: ProductCardProps) {
  const t = await getTranslations("product");
  const format = await getFormatter();
  const soldOut = product.stock <= 0;
  const Heading = heading;
  const alt = t("coverAlt", { name: product.name, brand: product.brand.name });
  const price = format.number(Number(product.price), {
    style: "currency",
    currency: "MXN",
  });

  return (
    <article className="relative mx-auto flex h-full w-full max-w-[280px] flex-col text-center">
      <div className="absolute right-2 top-2 z-20">
        <WishlistButton productId={product.id} initialWishlisted={wishlisted} />
      </div>
      <div className="relative h-[88px] shrink-0">
        <div
          className="absolute inset-0 overflow-hidden rounded-t-[10px] bg-[#F0F0F0] bg-cover bg-left-top"
          style={{
            backgroundColor: product.brand.bannerColor,
            backgroundImage: `url(${product.brand.logoUrl})`,
          }}
          aria-hidden="true"
        />
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
          <CardCover src={product.coverImageUrl} alt={alt} />
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-b-[10px] bg-gs-surface px-4 pb-8 pt-[108px] shadow-[5px_5px_15px_rgba(0,0,0,0.08)]">
        <Heading className="mb-2 line-clamp-2 min-h-[44px] text-lg font-bold leading-[22px] text-gs-text">
          {product.name}
        </Heading>
        <GenreBadges
          genres={product.genres}
          label={t("genres")}
          className="mb-2"
        />
        <p className="text-[22px] font-extrabold leading-none tracking-tight text-gs-accent-strong">
          {price}
        </p>

        {soldOut ? (
          <p className="mt-3 text-sm font-semibold text-gs-critical">
            {t("soldOut")}
          </p>
        ) : (
          <div className="mt-3 min-h-[20px]" />
        )}

        {variant === "full" ? (
          <div className="mt-auto flex items-center justify-evenly pt-4">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              className="w-[90px] shrink-0 px-2.5 py-2.5"
            />
            <Link
              href={`/product/${product.id}`}
              className="text-sm font-bold text-gs-accent transition-colors hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
            >
              {t("view")}
            </Link>
          </div>
        ) : (
          <Link
            href={`/product/${product.id}`}
            className="mt-auto inline-block pt-4 text-sm font-bold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            {t("view")}
          </Link>
        )}
      </div>
    </article>
  );
}
