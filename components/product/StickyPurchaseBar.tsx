"use client";

/**
 * Panel de compra sticky para productos estelares (Día 15).
 * Intersection Observer: aparece cuando el panel original sale de vista.
 * Navegable por teclado; no depende de hover.
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductPurchase } from "@/components/product/ProductPurchase";

type StickyPurchaseBarProps = {
  targetId: string;
  productId: string;
  stock: number;
  priceLabel: string;
  productName: string;
};

export function StickyPurchaseBar({
  targetId,
  productId,
  stock,
  priceLabel,
  productName,
}: StickyPurchaseBarProps) {
  const t = useTranslations("product");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0, rootMargin: "0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={t("stickyPurchase", { name: productName })}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gs-border bg-gs-surface/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm md:px-6"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gs-text">{productName}</p>
          <p className="text-lg font-extrabold text-gs-accent-strong">
            {priceLabel}
          </p>
        </div>
        <div className="w-full sm:max-w-md">
          <ProductPurchase productId={productId} stock={stock} compact />
        </div>
      </div>
    </div>
  );
}
