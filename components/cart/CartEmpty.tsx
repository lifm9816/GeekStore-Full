"use client";

/** Estado vacío del mockup 12: ícono, copy y CTA al catálogo. */

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CartEmpty() {
  const t = useTranslations("cart");

  return (
    <section className="mx-auto max-w-md rounded-[10px] border border-gs-border bg-gs-surface px-8 py-16 text-center">
      <div
        className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center rounded-full bg-gs-surface-2 text-gs-muted"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-7 w-7"
        >
          <path d="M3 3h2l2.4 12.4a2 2 0 002 1.6h8.2a2 2 0 002-1.6L21 8H6" />
          <circle cx="9" cy="21" r="1.3" />
          <circle cx="18" cy="21" r="1.3" />
        </svg>
      </div>
      <h1 className="text-base font-bold">{t("emptyTitle")}</h1>
      <p className="mt-1.5 mb-[22px] text-[13px] text-gs-muted">
        {t("emptyDescription")}
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
