/**
 * Editar género (nombre).
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminCrumb } from "@/components/admin/AdminNavContext";
import { GenreForm } from "@/components/admin/GenreForm";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type EditGenrePageProps = {
  params: Promise<{ locale: AppLocale; id: string }>;
};

export async function generateMetadata({
  params,
}: EditGenrePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminGenreEdit")) };
}

export default async function AdminEditGenrePage({
  params,
}: EditGenrePageProps) {
  const { id } = await params;

  const genre = await prisma.genre.findUnique({ where: { id } });

  if (!genre) {
    notFound();
  }

  return (
    <div>
      <AdminCrumb label={genre.name} backHref="/admin/genres" />
      <div className="max-w-xl">
        <GenreForm
          mode="edit"
          genreId={genre.id}
          defaults={{ name: genre.name }}
        />
      </div>
    </div>
  );
}
