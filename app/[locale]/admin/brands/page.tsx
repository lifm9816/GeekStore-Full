/**
 * Gestión de marcas — crear/listar; editar y eliminar desde la lista.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BrandForm } from "@/components/admin/BrandForm";
import { DeleteBrandButton } from "@/components/admin/DeleteBrandButton";
import { AdminPageHeader } from "@/components/admin/AdminNavContext";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type BrandsPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: BrandsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("adminBrands")) };
}

export default async function AdminBrandsPage() {
  const t = await getTranslations("admin.brands");
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <AdminPageHeader title={t("title")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <BrandForm />

        <section className="rounded-[10px] border border-gs-border bg-gs-surface p-5 md:p-6">
          <h2 className="mb-4 text-[15px] font-bold">{t("listTitle")}</h2>
          {brands.length === 0 ? (
            <p className="text-sm text-gs-muted">{t("empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {brands.map((brand) => (
                <li
                  key={brand.id}
                  className="flex items-center gap-3 rounded-[10px] border border-gs-border px-3 py-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gs-surface-2">
                    <Image
                      src={brand.logoUrl}
                      alt={t("logoAlt", { name: brand.name })}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{brand.name}</p>
                    <p className="text-[12px] text-gs-muted">
                      {t("productCount", { count: brand._count.products })}
                    </p>
                  </div>
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border border-gs-border"
                    style={{ backgroundColor: brand.bannerColor }}
                    title={brand.bannerColor}
                    aria-label={t("colorSwatch", { color: brand.bannerColor })}
                  />
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/brands/${brand.id}/edit`}
                      className="rounded-[7px] px-2.5 py-1.5 text-[12px] font-semibold text-gs-accent hover:text-gs-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                    >
                      {t("edit")}
                    </Link>
                    <DeleteBrandButton
                      brandId={brand.id}
                      brandName={brand.name}
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
