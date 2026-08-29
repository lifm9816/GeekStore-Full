"use client";

/**
 * Sidebar admin: empuja el contenido (sin overlay). Animación suave de ancho.
 * Labels alineados con los títulos de cada vista.
 */

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Link, usePathname } from "@/i18n/navigation";
import { useAdminNav } from "@/components/admin/AdminNavContext";

const NAV_ITEMS = [
  { href: "/admin", key: "dashboard" as const, match: "exact" as const },
  {
    href: "/admin/products",
    key: "products" as const,
    match: "prefix" as const,
  },
  {
    href: "/admin/categories",
    key: "categories" as const,
    match: "prefix" as const,
  },
  {
    href: "/admin/genres",
    key: "genres" as const,
    match: "prefix" as const,
  },
  { href: "/admin/brands", key: "brands" as const, match: "prefix" as const },
  {
    href: "/admin/promotions",
    key: "promotions" as const,
    match: "prefix" as const,
  },
  { href: "/admin/orders", key: "orders" as const, match: "prefix" as const },
];

const SIDEBAR_WIDTH = "16rem";

type AdminSidebarProps = {
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
};

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("admin");
  const tNav = useTranslations("admin.nav");
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminNav();
  const displayName = user?.name?.trim() || tNav("adminUser");

  const labels = {
    dashboard: t("title"),
    products: t("products.title"),
    categories: t("categories.title"),
    genres: t("genres.title"),
    brands: t("brands.title"),
    promotions: t("promotions.title"),
    orders: t("ordersTitle"),
  } as const;

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <aside
      id="admin-sidebar"
      aria-label={tNav("label")}
      aria-hidden={!sidebarOpen}
      className="sticky top-0 h-screen shrink-0 self-start overflow-hidden border-r border-transparent bg-gs-header transition-[width,border-color] duration-300 ease-out"
      style={{ width: sidebarOpen ? SIDEBAR_WIDTH : 0 }}
    >
      <div className="flex h-screen flex-col" style={{ width: SIDEBAR_WIDTH }}>
        <div className="flex flex-col items-center gap-2 border-b border-white/10 px-4 py-5">
          <UserAvatar name={user?.name} image={user?.image} size={72} />
          <p className="max-w-full truncate text-center text-sm font-bold text-white">
            {displayName}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href, item.match);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    tabIndex={sidebarOpen ? undefined : -1}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-[7px] px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gs-accent-strong ${
                      active
                        ? "bg-gs-accent text-gs-header"
                        : "text-gs-on-header hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {labels[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
