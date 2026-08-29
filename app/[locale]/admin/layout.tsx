/**
 * Layout /admin — gate ADMIN + shell con sidebar (sin Navbar de tienda).
 */

import { hasLocale } from "next-intl";
import { auth } from "@/auth";
import { AdminNavProvider } from "@/components/admin/AdminNavContext";
import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const session = await auth();
  const user = session?.user;

  if (!hasLocale(routing.locales, locale)) {
    return children;
  }

  if (!user) {
    redirect({ href: "/login", locale });
    return null;
  }

  if (user.role !== "ADMIN") {
    redirect({ href: "/", locale });
    return null;
  }

  return (
    <AdminNavProvider>
      <AdminShell user={{ name: user.name, image: user.image }}>
        {children}
      </AdminShell>
    </AdminNavProvider>
  );
}
