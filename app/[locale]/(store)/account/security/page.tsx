/**
 * Pestaña Seguridad del mockup 10: cerrar sesión + eliminar cuenta de verdad.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountShell } from "@/components/account/AccountShell";
import { DangerZone } from "@/components/account/DangerZone";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type SecurityPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: SecurityPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("accountSecurity")) };
}

export default async function SecurityPage() {
  return (
    <AccountShell>
      <DangerZone />
    </AccountShell>
  );
}
