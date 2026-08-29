/**
 * Mockup 13 — Lista de deseos conectada al modelo Wishlist.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AccountShell } from "@/components/account/AccountShell";
import { WishlistGrid } from "@/components/account/WishlistGrid";
import { redirect } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";
import { getWishlistItems } from "@/lib/wishlist";

export const dynamic = "force-dynamic";

type WishlistPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: WishlistPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("accountWishlist")) };
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const items = await getWishlistItems(userId);

  return (
    <AccountShell>
      <WishlistGrid items={items} />
    </AccountShell>
  );
}
