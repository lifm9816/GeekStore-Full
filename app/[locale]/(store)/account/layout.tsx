/**
 * Gate de /account. El proxy también redirige a login; esto cubre
 * Server Components si el matcher no corre (p. ej. navegación interna).
 */

import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

export const dynamic = "force-dynamic";

type AccountLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AccountLayout({
  children,
  params,
}: AccountLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  if (!hasLocale(routing.locales, locale)) {
    return children;
  }

  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
    return null;
  }

  return children;
}
