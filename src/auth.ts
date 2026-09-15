import NextAuth, { type DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

const providers = [];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  providers,
  session: {
    strategy: prisma ? "database" : "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token?.sub ?? "";
        session.user.role =
          ((user as { role?: "USER" | "ADMIN" } | undefined)?.role as
            | "USER"
            | "ADMIN") ?? "USER";
      }
      return session;
    },
    authorized({ auth: currentAuth, request }) {
      if (env.DEMO_MODE) return true;
      const protectedPath = /^\/(dashboard|new-kundli|reports|charts|predictions|compatibility|settings|admin)/.test(
        request.nextUrl.pathname,
      );
      return !protectedPath || Boolean(currentAuth?.user);
    },
  },
  trustHost: true,
});

export async function getCurrentActor() {
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? "User",
      email: session.user.email ?? null,
      role: session.user.role,
      demo: false,
    };
  }
  if (env.DEMO_MODE) {
    return {
      id: "demo-user",
      name: "Demo Explorer",
      email: null,
      role: "ADMIN" as const,
      demo: true,
    };
  }
  return null;
}