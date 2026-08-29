/**
 * Mockup 04 / Día 8: checkout aún no existe, así que el historial real
 * está vacío. No se pintan pedidos de placeholder.
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function OrdersEmpty() {
  const t = await getTranslations("account");

  return (
    <section className="mx-auto max-w-md rounded-[10px] border border-gs-border bg-gs-surface px-8 py-16 text-center">
      <h2 className="text-base font-bold">{t("ordersEmptyTitle")}</h2>
      <p className="mt-1.5 mb-[22px] text-[13px] text-gs-muted">
        {t("ordersEmptyDescription")}
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
