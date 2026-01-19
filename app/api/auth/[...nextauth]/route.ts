import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// 👇 IMPORT THIS TO FIX THE TYPE CASTING
import type { Adapter } from "next-auth/adapters"; 

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // 👇 FIX 1: Cast the adapter to 'Adapter' (or 'any') to silence the type mismatch
  adapter: PrismaAdapter(prisma) as Adapter,
  
  session: { strategy: "jwt" },
  
  // 👇 FIX 2: Add '!' to promise the secret exists
  secret: process.env.NEXTAUTH_SECRET!,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
        
        // Ensure user exists and has a password (google users might not)
        if (!user || !user.password) throw new Error("User not found or uses Google Login");
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 👇 FIX: Update both Name AND Picture when 'update()' is called
      if (trigger === "update") {
        if (session?.name) token.name = session.name;
        if (session?.image) token.picture = session.image; 
      }
      
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error - Session user type extended in types/next-auth.d.ts
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };