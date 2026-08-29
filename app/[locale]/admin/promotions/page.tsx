/**
 * Gestión de promociones (carousel home). Día 15.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { DeletePromotionButton } from "@/components/admin/DeletePromotionButton";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type PromotionsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: PromotionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminPromotions")) };
}

export default async function AdminPromotionsPage() {
  const t = await getTranslations("admin.promotions");
  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { product: { select: { name: true } } },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader title={t("title")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <PromotionForm products={products} />

        <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
          <h2 className="mb-4 text-[15px] font-bold">{t("listTitle")}</h2>
          {promotions.length === 0 ? (
            <p className="text-sm text-gs-muted">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {promotions.map((promo) => (
                <li
                  key={promo.id}
                  className="flex items-center gap-3 rounded-[10px] border border-gs-border px-3 py-3"
                >
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-gs-surface-2">
                    <Image
                      src={promo.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{promo.title}</p>
                    <p className="truncate text-[12px] text-gs-muted">
                      {promo.product.name} · #{promo.order} ·{" "}
                      {promo.active ? t("active") : t("inactive")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/promotions/${promo.id}/edit`}
                      className="rounded-[7px] px-2.5 py-1.5 text-[12px] font-semibold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                    >
                      {t("edit")}
                    </Link>
                    <DeletePromotionButton
                      promotionId={promo.id}
                      title={promo.title}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
