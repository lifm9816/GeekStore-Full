/**
 * Editar promoción.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { PromotionForm } from "@/components/admin/PromotionForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type EditPromotionPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: EditPromotionPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminPromotionEdit")) };
}

export default async function AdminEditPromotionPage({
  params,
}: EditPromotionPageProps) {
  const { id } = await params;

  const [promotion, products] = await Promise.all([
    prisma.promotion.findUnique({ where: { id } }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!promotion) {
    notFound();
  }

  return (
    <div>
      <AdminCrumb label={promotion.title} backHref="/admin/promotions" />
      <div className="max-w-xl">
        <PromotionForm
          mode="edit"
          promotionId={promotion.id}
          products={products}
          defaults={{
            title: promotion.title,
            imageUrl: promotion.imageUrl,
            productId: promotion.productId,
            order: promotion.order,
            active: promotion.active,
          }}
        />
      </div>
    </div>
  );
}
