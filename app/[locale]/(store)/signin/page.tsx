import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type SignInAliasProps = {
  params: Promise<{ locale: AppLocale }>;
};

export default async function SignInAlias({ params }: SignInAliasProps) {
  const { locale } = await params;
  redirect({ href: "/register", locale });
}
