import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AccountChrome } from "@/components/account/AccountChrome";
import { ProductChrome } from "@/components/product/ProductChrome";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { Link } from "@/i18n/navigation";

type SiteHeaderProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
};

export async function SiteHeader({ user, isAdmin = false }: SiteHeaderProps) {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-20 bg-gs-header">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-[7px] focus:bg-gs-accent focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-gs-header"
      >
        {t("skipToContent")}
      </a>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 md:px-6">
        <div />
        <Link
          href="/"
          aria-label={t("logoAlt")}
          className="justify-self-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
        >
          <Image
            src="/images/branding/dark_logo.png"
            alt=""
            width={500}
            height={175}
            priority
            className="logo-dark h-auto w-[250px] md:w-[min(100%,360px)]"
          />
          <Image
            src="/images/branding/logo.png"
            alt=""
            width={500}
            height={175}
            priority
            className="logo-light h-auto w-[250px] md:w-[min(100%,360px)]"
          />
        </Link>
        <SettingsMenu user={user} isAdmin={isAdmin} />
      </div>
      <AccountChrome />
      <ProductChrome />
    </header>
  );
}
