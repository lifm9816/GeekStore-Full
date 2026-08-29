import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ConfusedRobotLoader } from "@/components/mascot/ConfusedRobotLoader";
import { pageTitle } from "@/lib/page-title";

export async function generateMetadata(): Promise<Metadata> {
  const tMeta = await getTranslations("meta");
  const t = await getTranslations("pageNotFound");
  return { title: pageTitle(tMeta("brand"), t("code")) };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("pageNotFound");
  const tCatalog = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center md:py-24">
      <ConfusedRobotLoader className="-mb-6" />
      <p className="text-6xl font-extrabold tracking-tight text-gs-muted">
        {t("code")}
      </p>
      <h1 className="mt-4 text-xl font-bold">{t("title")}</h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-w-40 items-center justify-center rounded-[7px] bg-gs-accent px-5 py-2.5 text-sm font-bold text-gs-surface transition-colors hover:bg-gs-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
      >
        {tCatalog("viewCatalog")}
      </Link>
    </div>
  );
}
