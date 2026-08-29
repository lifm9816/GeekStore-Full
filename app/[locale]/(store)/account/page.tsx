/**
 * Mockup 10 — Perfil. Stats reales (Order, loyaltyPoints, Address, Wishlist).
 * Título: GeekStore | Mi cuenta.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { AccountShell } from "@/components/account/AccountShell";
import { AccountStats } from "@/components/account/AccountStats";
import {
  EditProfileButton,
  ProfileForm,
} from "@/components/account/ProfileForm";
import { redirect } from "@/i18n/navigation";
import {
  getAccountUser,
  getInitials,
  splitDisplayName,
} from "@/lib/account";
import type { AppLocale } from "@/i18n/routing";
import { pageTitle } from "@/lib/page-title";

export const dynamic = "force-dynamic";

type AccountPageProps = {
  params: Promise<{ locale: AppLocale }>;
};

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return { title: pageTitle(t("brand"), t("account")) };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const user = await getAccountUser(userId);
  const t = await getTranslations("account");
  const format = await getFormatter();

  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  const { name, lastName } = splitDisplayName(user.name);
  const initials = getInitials(user.name);
  const memberSince = format.dateTime(user.createdAt, {
    month: "short",
    year: "numeric",
  });

  return (
    <AccountShell
      intro={
        <>
          <div className="h-24 rounded-[10px] bg-gs-surface-2" aria-hidden="true" />
          <div className="-mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3.5 px-1">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] rounded-full border-4 border-gs-bg object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-gs-bg bg-gs-accent-strong text-xl font-extrabold text-gs-header"
                >
                  {initials}
                </div>
              )}
              <div className="pb-1.5">
                <h1 className="text-[19px] font-extrabold">
                  {user.name ?? t("title")}
                </h1>
                <p className="mt-1.5 w-fit rounded-full bg-gs-surface-2 px-2.5 py-0.5 text-[12px] text-gs-muted">
                  {t("memberSince", { date: memberSince })}
                </p>
              </div>
            </div>
            <EditProfileButton />
          </div>
          <AccountStats
            orders={user._count.orders}
            loyaltyPoints={user.customer?.loyaltyPoints ?? 0}
            addresses={user.customer?._count.addresses ?? 0}
            wishlist={user._count.wishlists}
            labels={{
              orders: t("stats.orders"),
              loyalty: t("stats.loyalty"),
              addresses: t("stats.addresses"),
              wishlist: t("stats.wishlist"),
            }}
          />
        </>
      }
    >
      <ProfileForm
        name={name}
        lastName={lastName}
        email={user.email}
        phone={user.customer?.phone ?? ""}
      />
    </AccountShell>
  );
}
