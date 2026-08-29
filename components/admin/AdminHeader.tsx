"use client";

/**
 * Header admin estilo tienda + franja de vista (título/acciones) o breadcrumb corto.
 */

import Image from "next/image";
import { useTranslations } from "next-intl";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { Link, usePathname } from "@/i18n/navigation";
import { useAdminNav } from "@/components/admin/AdminNavContext";

const TOP_LEVEL = new Set([
  "/admin",
  "/admin/products",
  "/admin/categories",
  "/admin/genres",
  "/admin/brands",
  "/admin/promotions",
  "/admin/orders",
]);

type CrumbItem = {
  href?: string;
  label: string;
};

type AdminHeaderProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
};

function buildCrumbs(
  pathname: string,
  t: (key: string, values?: Record<string, string>) => string,
  dynamicLabel?: string,
): CrumbItem[] {
  if (pathname.startsWith("/admin/products")) {
    const parent = { href: "/admin/products", label: t("products") };

    if (pathname === "/admin/products/new") {
      return [parent, { label: t("newProduct") }];
    }

    if (pathname.includes("/edit")) {
      return [
        parent,
        {
          label: dynamicLabel
            ? t("editNamed", { name: dynamicLabel })
            : t("editProduct"),
        },
      ];
    }

    return [parent];
  }

  if (pathname.startsWith("/admin/orders/")) {
    return [
      { href: "/admin/orders", label: t("orders") },
      { label: dynamicLabel ?? t("orderDetail") },
    ];
  }

  if (pathname.startsWith("/admin/brands") && pathname.includes("/edit")) {
    return [
      { href: "/admin/brands", label: t("brands") },
      {
        label: dynamicLabel
          ? t("editNamed", { name: dynamicLabel })
          : t("editBrand"),
      },
    ];
  }

  if (pathname.startsWith("/admin/genres") && pathname.includes("/edit")) {
    return [
      { href: "/admin/genres", label: t("genres") },
      {
        label: dynamicLabel
          ? t("editNamed", { name: dynamicLabel })
          : t("editGenre"),
      },
    ];
  }

  if (pathname.startsWith("/admin/promotions") && pathname.includes("/edit")) {
    return [
      { href: "/admin/promotions", label: t("promotions") },
      {
        label: dynamicLabel
          ? t("editNamed", { name: dynamicLabel })
          : t("editPromotion"),
      },
    ];
  }

  if (pathname.startsWith("/admin/categories") && pathname.includes("/edit")) {
    return [
      { href: "/admin/categories", label: t("categories") },
      {
        label: dynamicLabel
          ? t("editNamed", { name: dynamicLabel })
          : t("editCategory"),
      },
    ];
  }

  return [];
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1.25em" height="1.25em" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"
      />
    </svg>
  );
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const t = useTranslations("admin.nav");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const {
    crumb,
    pageTitle,
    setToolbarActionsEl,
    sidebarOpen,
    toggleSidebar,
  } = useAdminNav();

  const showBreadcrumb =
    pathname.startsWith("/admin") && !TOP_LEVEL.has(pathname);
  const crumbs = showBreadcrumb
    ? buildCrumbs(
        pathname,
        t as (key: string, values?: Record<string, string>) => string,
        crumb?.label,
      )
    : null;

  // En detalle el breadcrumb corto reemplaza el título grande.
  const showPageTitle = Boolean(pageTitle) && !crumbs;
  const showToolbar = showPageTitle || Boolean(crumbs);

  return (
    <header className="sticky top-0 z-20 bg-gs-header">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-[7px] focus:bg-gs-accent focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-gs-header"
      >
        {tNav("skipToContent")}
      </a>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 md:px-6">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center justify-self-start rounded-[7px] text-gs-on-header transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
          aria-label={sidebarOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={sidebarOpen}
          aria-controls="admin-sidebar"
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </button>

        <Link
          href="/"
          aria-label={tNav("logoAlt")}
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

        <SettingsMenu user={user} isAdmin={false} />
      </div>

      {showToolbar ? (
        <div className="border-t border-white/10 px-4 py-2.5 md:px-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {crumbs ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <nav aria-label={t("breadcrumb")} className="min-w-0">
                  <ol className="flex flex-wrap items-center gap-1.5 text-[12px] font-light tracking-wide text-gs-on-header/65">
                    {crumbs.map((item, index) => {
                      const isLast = index === crumbs.length - 1;

                      return (
                        <li
                          key={`${item.label}-${index}`}
                          className="flex min-w-0 items-center gap-1.5"
                        >
                          {index > 0 ? (
                            <span className="shrink-0 opacity-70" aria-hidden>
                              →
                            </span>
                          ) : null}
                          {isLast || !item.href ? (
                            <span
                              className="truncate font-normal text-gs-on-header/85"
                              aria-current={isLast ? "page" : undefined}
                            >
                              {item.label}
                            </span>
                          ) : (
                            <Link
                              href={item.href}
                              className="truncate transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong"
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </nav>
                <div
                  ref={setToolbarActionsEl}
                  className="flex shrink-0 flex-wrap items-center gap-2"
                />
              </div>
            ) : null}

            {showPageTitle ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 truncate text-xl font-extrabold tracking-tight text-white md:text-2xl">
                  {pageTitle}
                </p>
                <div
                  ref={setToolbarActionsEl}
                  className="flex shrink-0 flex-wrap items-center gap-2"
                />
              </div>
            ) : null}

            {!crumbs && !showPageTitle ? (
              <div ref={setToolbarActionsEl} className="hidden" />
            ) : null}
          </div>
        </div>
      ) : (
        <div ref={setToolbarActionsEl} className="hidden" />
      )}
    </header>
  );
}
