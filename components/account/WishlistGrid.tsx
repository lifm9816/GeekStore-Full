"use client";

/**
 * Mockup 13: grid de wishlist. Agotado deshabilita compra (roadmap §8)
 * pero el corazón sigue quitando. "Comprar ahora" mete 1 unidad al carrito
 * y va a /checkout (aún 404 hasta los Días 9–10).
 */

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { addCartItem } from "@/app/actions/cart";
import { notifyCartCount } from "@/lib/cart-draft";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { WishlistButton } from "@/components/product/WishlistButton";
import { Link } from "@/i18n/navigation";
import type { SerializedProduct } from "@/lib/products";

type WishlistGridProps = {
  items: { wishlistId: string; product: SerializedProduct }[];
};

export function WishlistGrid({ items }: WishlistGridProps) {
  const t = useTranslations("account");
  const tProduct = useTranslations("product");
  const format = useFormatter();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-md rounded-[10px] border border-gs-border bg-gs-surface px-8 py-16 text-center">
        <h2 className="text-base font-bold">{t("wishlistEmptyTitle")}</h2>
        <p className="mt-1.5 mb-[22px] text-[13px] text-gs-muted">
          {t("wishlistEmptyDescription")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-[7px] bg-gs-accent px-4 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          {t("exploreCatalog")}
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-[15px] font-bold">
        {t("wishlistCount", { count: items.length })}
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ product }) => {
          const soldOut = product.stock <= 0;
          const lowStock = product.stock > 0 && product.stock <= 2;
          const price = format.number(Number(product.price), {
            style: "currency",
            currency: "MXN",
          });
          const alt = tProduct("coverAlt", {
            name: product.name,
            brand: product.brand.name,
          });

          return (
            <li
              key={product.id}
              className={`overflow-hidden rounded-[10px] border border-gs-border bg-gs-surface ${
                soldOut ? "opacity-80" : ""
              }`}
            >
              <div className="relative aspect-[4/3] bg-gs-surface-2">
                <Image
                  src={product.coverImageUrl}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className={`object-cover ${soldOut ? "grayscale" : ""}`}
                />
                <div className="absolute right-2 top-2 z-10">
                  <WishlistButton
                    productId={product.id}
                    initialWishlisted
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <span className="w-fit rounded-full bg-gs-surface-2 px-2 py-0.5 text-[10px] font-bold text-gs-muted">
                  {product.brand.name}
                </span>
                <Link
                  href={`/product/${product.id}`}
                  className="text-sm font-bold hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                >
                  {product.name}
                </Link>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-extrabold text-gs-accent-strong">
                    {price}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      soldOut
                        ? "bg-gs-critical/15 text-gs-critical"
                        : lowStock
                          ? "bg-gs-warning/15 text-gs-warning"
                          : "bg-gs-accent/15 text-gs-accent-strong"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-current"
                      aria-hidden="true"
                    />
                    {soldOut
                      ? tProduct("soldOut")
                      : lowStock
                        ? t("lastLeft", { count: product.stock })
                        : t("inStockBadge")}
                  </span>
                </div>
                <div className="mt-1 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                      void addCartItem(product.id, 1).then((result) => {
                        if (result.ok) {
                          if (typeof result.cartCount === "number") {
                            notifyCartCount(result.cartCount);
                          }
                          router.push("/checkout");
                        }
                      });
                    }}
                    className="inline-flex w-full items-center justify-center rounded-[7px] bg-gs-accent px-3 py-2 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong disabled:cursor-not-allowed disabled:bg-gs-surface-2 disabled:text-gs-muted"
                  >
                    {t("buyNow")}
                  </button>
                  <AddToCartButton
                    productId={product.id}
                    stock={product.stock}
                    fullLabel
                    tone="ghost"
                    className="w-full"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
