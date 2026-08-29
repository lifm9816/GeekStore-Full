"use client";

/**
 * Breadcrumb + ← Volver en detalle de producto (Instrucciones §5).
 * Vuelve al catálogo (/). La Navbar inferior sigue ofreciendo Regresar.
 */

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useProductNav } from "@/components/product/ProductNavContext";

export function ProductChrome() {
  const t = useTranslations("product.navChrome");
  const tCatalog = useTranslations("catalog");
  const pathname = usePathname();
  const { crumb } = useProductNav();

  if (!pathname.startsWith("/product/")) {
    return null;
  }

  const productLabel = crumb?.label ?? t("productFallback");

  return (
    <div className="border-t border-white/10 px-4 py-2 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-[7px] px-2.5 py-1.5 text-[13px] font-bold text-gs-on-header transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          ← {t("back")}
        </Link>

        <nav aria-label={t("breadcrumb")} className="min-w-0">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
            <li className="flex min-w-0 items-center gap-1.5">
              <Link
                href="/"
                className="truncate font-semibold text-gs-on-header transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
              >
                {tCatalog("title")}
              </Link>
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-gs-on-header/60" aria-hidden>
                →
              </span>
              <span
                className="truncate font-semibold text-white"
                aria-current="page"
              >
                {productLabel}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
