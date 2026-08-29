import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";
import type { AppLocale } from "@/i18n/routing";
import { safeRedirectPath } from "@/lib/auth-redirect";
import { pageTitle } from "@/lib/page-title";

type RegisterPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({
  params,
}: RegisterPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("register")) };
}

export default async function RegisterPage({
  params,
  searchParams,
}: RegisterPageProps) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;

  return <RegisterForm callbackUrl={safeRedirectPath(callbackUrl, locale)} />;
}
