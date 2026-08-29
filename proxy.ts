import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const adminMatch = pathname.match(/^\/(es|en)\/admin(?:\/|$)/);
  // /account es de clientes (y admin); sin sesión → login, no al home.
  const accountMatch = pathname.match(/^\/(es|en)\/account(?:\/|$)/);
  const checkoutMatch = pathname.match(/^\/(es|en)\/checkout(?:\/|$)/);
  const orderMatch = pathname.match(/^\/(es|en)\/order(?:\/|$)/);

  if (adminMatch) {
    const locale = adminMatch[1];

    if (!request.auth?.user) {
      const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (request.auth.user.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(`/${locale}`, request.nextUrl.origin),
      );
    }
  }

  if (accountMatch && !request.auth?.user) {
    const locale = accountMatch[1];
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((checkoutMatch || orderMatch) && !request.auth?.user) {
    const locale = (checkoutMatch ?? orderMatch)![1];
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
