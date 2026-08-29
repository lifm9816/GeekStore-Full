/**
 * Editar categoría (nombre).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type EditCategoryPageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: EditCategoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminCategoryEdit")) };
}

export default async function AdminEditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <AdminCrumb label={category.name} backHref="/admin/categories" />
      <div className="max-w-xl">
        <CategoryForm
          mode="edit"
          categoryId={category.id}
          defaults={{ name: category.name }}
        />
      </div>
    </div>
  );
}
