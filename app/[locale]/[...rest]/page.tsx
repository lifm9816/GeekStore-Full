import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { pageTitle } from "@/lib/page-title";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: pageTitle(t("brand"), t("pageNotFound")) };
}

export default function CatchAllPage() {
  notFound();
}
