/**
 * Tabla de productos admin (mockup 08).
 */

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin";

export type ProductTableRow = {
  id: string;
  name: string;
  coverImageUrl: string;
  price: number;
  stock: number;
  brandName: string;
  categoryName: string;
};

type ProductTableProps = {
  products: ProductTableRow[];
  emptyLabel: string;
  labels: {
    product: string;
    brand: string;
    category: string;
    price: string;
    stock: string;
    actions: string;
    edit: string;
  };
  formatMoney: (value: number) => string;
};

export function ProductTable({
  products,
  emptyLabel,
  labels,
  formatMoney,
}: ProductTableProps) {
  if (products.length === 0) {
    return <p className="text-sm text-gs-muted">{emptyLabel}</p>;
  }

  return (
    <div className="-mx-1 overflow-x-auto rounded-[10px] border border-gs-border bg-gs-surface">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gs-border text-[12px] text-gs-muted">
            <th className="px-4 py-3 font-semibold">{labels.product}</th>
            <th className="px-3 py-3 font-semibold">{labels.brand}</th>
            <th className="px-3 py-3 font-semibold">{labels.category}</th>
            <th className="px-3 py-3 font-semibold">{labels.price}</th>
            <th className="px-3 py-3 font-semibold">{labels.stock}</th>
            <th className="px-3 py-3 font-semibold">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const lowStock = product.stock < LOW_STOCK_THRESHOLD;
            const stockClass = lowStock
              ? "bg-gs-warning/15 text-gs-warning"
              : "bg-gs-accent/15 text-gs-accent-strong";

            return (
              <tr key={product.id} className="border-b border-gs-border/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={product.coverImageUrl}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold">{product.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gs-muted">{product.brandName}</td>
                <td className="px-3 py-3 text-gs-muted">{product.categoryName}</td>
                <td className="px-3 py-3 font-semibold">
                  {formatMoney(product.price)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${stockClass}`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-current"
                      aria-hidden="true"
                    />
                    {product.stock}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-[7px] p-2 text-gs-muted transition-colors hover:bg-gs-surface-2 hover:text-gs-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                      aria-label={labels.edit}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
