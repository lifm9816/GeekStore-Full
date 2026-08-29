/**
 * Top productos por unidades vendidas (mockup 07).
 */

import Image from "next/image";
import type { TopProductRow } from "@/lib/admin-dashboard";

type AdminTopProductsProps = {
  title: string;
  emptyLabel: string;
  soldLabel: (count: number) => string;
  products: TopProductRow[];
};

export function AdminTopProducts({
  title,
  emptyLabel,
  soldLabel,
  products,
}: AdminTopProductsProps) {
  return (
    <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5">
      <h2 className="mb-4 text-[15px] font-bold">{title}</h2>
      {products.length === 0 ? (
        <p className="text-sm text-gs-muted">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {products.map((product) => (
            <li key={product.productId} className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.coverImageUrl}
                  alt={product.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                {product.name}
              </p>
              <p className="shrink-0 text-[12px] text-gs-muted">
                {soldLabel(product.unitsSold)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
