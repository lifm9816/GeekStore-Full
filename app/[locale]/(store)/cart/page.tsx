import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { CartView } from "@/components/cart/CartView";
import type { AppLocale } from "@/i18n/routing";
import { getRelatedForCart, getUserCartLines } from "@/lib/cart-query";
import { pageTitle } from "@/lib/page-title";

/** Mockup 12 — Carrito. Título: GeekStore | Carrito (i18n). */

export const dynamic = "force-dynamic";

type CartPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: CartPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("cart")) };
}

export default async function CartPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const initialLines = userId ? await getUserCartLines(userId) : [];
  const initialRelated = userId
    ? await getRelatedForCart(initialLines.map((line) => line.productId))
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:py-12">
      <CartView
        signedIn={Boolean(userId)}
        initialLines={initialLines}
        initialRelated={initialRelated}
      />
    </div>
  );
}
