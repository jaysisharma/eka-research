import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { DefaultSession } from "next-auth";

export type UserRole = "FREE_USER" | "TEACHER" | "RESEARCHER" | "MENTOR" | "PAID_MEMBER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
  interface User {
    role: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 24 * 60 * 60, updateAge: 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        // Account lockout check
        if (user.lockedUntil && new Date() < user.lockedUntil) return null;

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
          const attempts = (user.loginAttempts ?? 0) + 1;
          await db.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: attempts,
              // Lock for 30 minutes after 5 failed attempts
              ...(attempts >= 5 ? { lockedUntil: new Date(Date.now() + 30 * 60 * 1000) } : {}),
            },
          });
          return null;
        }

        if (!user.emailVerified) return null;

        // Reset lockout state on successful login
        await db.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token["id"] = user.id as string;
        token["role"] = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token["id"] as string;
      session.user.role = token["role"] as UserRole;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
});
