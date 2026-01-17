import NextAuth, { NextAuthOptions } from "next-auth"; // 👈 Import Type
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 👇 1. EXPORT THIS VARIABLE SEPARATELY
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) throw new Error("User not found");
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        return user;
      },
    }),
  ],
  // Optional: Add the user ID to the session so we can access it easily
  callbacks: {
    async jwt({ token, trigger, session }) {
      // 1. Listen for the "update" trigger from the frontend
      if (trigger === "update" && session?.name) {
        token.name = session.name; // Update the name in the token
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error  Add id to session.user
        session.user.id = token.sub;
        // 2. Ensure the session uses the updated name from the token
        session.user.name = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };