import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role } from "@/app/generated/prisma/client";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.role = user.role ?? "CUSTOMER";
        token.picture = user.image;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id ?? token.sub ?? "");
      session.user.role = (token.role as Role) ?? "CUSTOMER";
      session.user.image = typeof token.picture === "string" ? token.picture : session.user.image;

      return session;
    },
  },
} satisfies NextAuthConfig;
