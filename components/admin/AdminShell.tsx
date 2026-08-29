/**
 * Shell del panel admin: sidebar que empuja el contenido + header de tienda.
 */

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    image?: string | null;
  } | null;
};

export function AdminShell({ children, user }: AdminShellProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={user} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader user={user} />
        <main id="contenido" className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
