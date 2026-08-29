/**
 * Editar marca (nombre, logo, color).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { BrandForm } from "@/components/admin/BrandForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type EditBrandPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: EditBrandPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminBrandEdit")) };
}

export default async function AdminEditBrandPage({
  params,
}: EditBrandPageProps) {
  const { id } = await params;

  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    notFound();
  }

  return (
    <div>
      <AdminCrumb label={brand.name} backHref="/admin/brands" />
      <div className="max-w-xl">
        <BrandForm
          mode="edit"
          brandId={brand.id}
          defaults={{
            name: brand.name,
            logoUrl: brand.logoUrl,
            bannerColor: brand.bannerColor,
          }}
        />
      </div>
    </div>
  );
}
