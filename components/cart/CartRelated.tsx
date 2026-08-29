"use client";

/**
 * "También te puede interesar" del mockup 12. Fuente: getRelatedProducts
 * (categoría/marca). El Día 13 sustituye esto por Claude API.
 */

import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import type { SerializedProduct } from "@/lib/products";

type CartRelatedProps = {
  products: SerializedProduct[];
};

export function CartRelated({ products }: CartRelatedProps) {
  const t = useTranslations("cart");
  const format = useFormatter();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-extrabold">{t("related")}</h2>
      <ul className="flex flex-col gap-3.5 md:flex-row">
        {products.map((product) => {
          const price = format.number(Number(product.price), {
            style: "currency",
            currency: "MXN",
          });

          return (
            <li
              key={product.id}
              className="flex flex-1 items-center gap-3 rounded-[10px] border border-gs-border bg-gs-surface p-3"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.coverImageUrl}
                  alt={t("coverAlt", {
                    name: product.name,
                    brand: product.brand.name,
                  })}
                  fill
                  sizes="44px"
                  className="object-cover"
                  unoptimized={product.coverImageUrl.endsWith(".svg")}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-bold">{product.name}</p>
                <p className="text-xs font-bold text-gs-accent-strong">{price}</p>
              </div>
              <AddToCartButton
                productId={product.id}
                stock={product.stock}
                className="shrink-0 bg-gs-surface-2 px-3 py-1.5 text-xs text-gs-text hover:bg-gs-border"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
