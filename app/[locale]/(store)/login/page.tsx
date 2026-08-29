import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import type { AppLocale } from "@/i18n/routing";
import { safeRedirectPath } from "@/lib/auth-redirect";
import { pageTitle } from "@/lib/page-title";

type LoginPageProps = {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("login")) };
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;

  return <LoginForm callbackUrl={safeRedirectPath(callbackUrl, locale)} />;
}
