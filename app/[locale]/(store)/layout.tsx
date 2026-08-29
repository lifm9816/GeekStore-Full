/**
 * Layout de tienda — Header + Navbar (Instrucciones §4–5).
 * Hermano de admin/; no comparte chrome con el panel.
 */

import { AccountNavProvider } from "@/components/account/AccountNavContext";
import { ProductNavProvider } from "@/components/product/ProductNavContext";
import { MobileNav } from "@/components/layout/MobileNav";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { auth } from "@/auth";
import { getCartCount } from "@/lib/cart-query";

type StoreLayoutProps = {
  children: React.ReactNode;
};

export default async function StoreLayout({ children }: StoreLayoutProps) {
  const session = await auth();
  const user = session?.user
    ? { name: session.user.name, image: session.user.image }
    : null;
  const signedIn = Boolean(session?.user?.id);
  const isAdmin = session?.user?.role === "ADMIN";
  const cartCount = session?.user?.id
    ? await getCartCount(session.user.id)
    : 0;

  return (
    <div className="flex min-h-full flex-col">
      <AccountNavProvider>
        <ProductNavProvider>
          <SiteHeader user={user} isAdmin={isAdmin} />
          <main id="contenido" className="flex-1 pb-32">
            {children}
          </main>
        </ProductNavProvider>
      </AccountNavProvider>
      <MobileNav
        user={user}
        signedIn={signedIn}
        serverCartCount={cartCount}
      />
    </div>
  );
}
