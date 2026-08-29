"use client";

/**
 * Continuación del header en /account (Instrucciones §5):
 * pestañas fusionadas o breadcrumb + Volver al editar (ej. dirección).
 */

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useAccountNav } from "@/components/account/AccountNavContext";
import type { MouseEvent } from "react";

const TOP_TABS = [
  { href: "/account", key: "profile", exact: true },
  { href: "/account/addresses", key: "addresses", exact: false },
  { href: "/account/orders", key: "orders", exact: false },
  { href: "/account/wishlist", key: "wishlist", exact: false },
  { href: "/account/security", key: "security", exact: false },
] as const;

const TOP_LEVEL = new Set([
  "/account",
  "/account/addresses",
  "/account/orders",
  "/account/wishlist",
  "/account/security",
]);

type CrumbItem = {
  href?: string;
  label: string;
};

export function AccountChrome() {
  const t = useTranslations("account.tabs");
  const tNav = useTranslations("account.navChrome");
  const pathname = usePathname();
  const { crumb, setCrumb } = useAccountNav();

  if (!pathname.startsWith("/account")) {
    return null;
  }

  const showBreadcrumb = Boolean(crumb) && pathname === "/account/addresses";

  if (showBreadcrumb && crumb) {
    const activeCrumb = crumb;
    const crumbs: CrumbItem[] = [
      { href: "/account", label: t("profile") },
      { href: "/account/addresses", label: t("addresses") },
      { label: activeCrumb.label },
    ];

    function handleBack(event: MouseEvent<HTMLAnchorElement>) {
      // Misma ruta: no hay navegación real — solo salir del modo edición.
      if (pathname === activeCrumb.backHref) {
        event.preventDefault();
        setCrumb(null);
      }
    }

    return (
      <div className="border-t border-white/10 px-4 py-2 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Link
            href={activeCrumb.backHref}
            onClick={handleBack}
            className="inline-flex shrink-0 items-center rounded-[7px] px-2.5 py-1.5 text-[13px] font-bold text-gs-on-header transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          >
            ← {tNav("back")}
          </Link>
          <nav aria-label={tNav("breadcrumb")} className="min-w-0">
            <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
              {crumbs.map((item, index) => {
                const isLast = index === crumbs.length - 1;

                return (
                  <li
                    key={`${item.label}-${index}`}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {index > 0 ? (
                      <span
                        className="shrink-0 text-gs-on-header/60"
                        aria-hidden
                      >
                        →
                      </span>
                    ) : null}
                    {isLast || !item.href ? (
                      <span
                        className="truncate font-semibold text-white"
                        aria-current={isLast ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="truncate font-semibold text-gs-on-header transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    );
  }

  if (!TOP_LEVEL.has(pathname)) {
    return null;
  }

  return (
    <nav
      aria-label={t("label")}
      className="border-t border-white/10 px-4 pb-2.5 pt-1 md:px-6"
    >
      <ul className="mx-auto flex w-max max-w-7xl gap-1.5 md:w-full md:flex-wrap">
        {TOP_TABS.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex rounded-full px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
                  isActive
                    ? "bg-gs-accent text-gs-header"
                    : "text-gs-on-header hover:bg-white/10 hover:text-white"
                }`}
              >
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
