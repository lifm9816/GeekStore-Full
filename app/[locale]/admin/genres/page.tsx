/**
 * Gestión de géneros — crear/listar; editar y eliminar desde la lista.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { GenreForm } from "@/components/admin/GenreForm";
import { DeleteGenreButton } from "@/components/admin/DeleteGenreButton";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type GenresPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: GenresPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminGenres")) };
}

export default async function AdminGenresPage() {
  const t = await getTranslations("admin.genres");
  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <AdminPageHeader title={t("title")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <GenreForm />

        <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
          <h2 className="mb-4 text-[15px] font-bold">{t("listTitle")}</h2>
          {genres.length === 0 ? (
            <p className="text-sm text-gs-muted">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {genres.map((genre) => (
                <li
                  key={genre.id}
                  className="flex items-center gap-3 rounded-[10px] border border-gs-border px-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{genre.name}</p>
                    <p className="text-[12px] text-gs-muted">
                      {t("productCount", { count: genre._count.products })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/genres/${genre.id}/edit`}
                      className="rounded-[7px] px-2.5 py-1.5 text-[12px] font-semibold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                    >
                      {t("edit")}
                    </Link>
                    <DeleteGenreButton
                      genreId={genre.id}
                      genreName={genre.name}
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
