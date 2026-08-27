import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/password";
import { normalizeEmail } from "@/lib/normalize-email";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "client" | "admin";
      name: string;
      email: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "client" | "admin";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? normalizeEmail(credentials.email) : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: "client" | "admin" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
        session.user.role = token.role ?? "client";
      }
      return session;
    },
  },
});
