// import NextAuth, { type NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@auth/prisma-adapter";

// // Extend the PrismaAdapter's AdapterUser type to include role and gymId
// declare module "@auth/core/adapters" {
//   interface AdapterUser {
//     role: string;
//     gymId?: string;
//   }
// }

// // Extend the AdapterUser type to include the role property
// declare module "next-auth/adapters" {
//   interface AdapterUser {
//     role: string;
//     gymId?: string;
//   }
// }
// import { PrismaClient } from "@prisma/client";
// import type { JWT } from "next-auth/jwt";
// import type { Session, User } from "next-auth";

// import { verifyPassword } from "@/lib/auth";

// const prisma = new PrismaClient();

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma) as unknown as import("next-auth/adapters").Adapter,

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",

//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(
//         credentials: Record<"email" | "password", string> | undefined
//       ) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Missing credentials");
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user || !user.isActive) {
//           throw new Error("Invalid credentials");
//         }

//         const isValid = await verifyPassword(
//           credentials.password,
//           user.password
//         );

//         if (!isValid) {
//           throw new Error("Invalid credentials");
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           role: user.role,
//           gymId: user.gymId ?? undefined,
//         } as User;
//       },
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     async jwt({
//       token,
//       user,
//     }: {
//       token: JWT;
//       user?: User & { role?: string; gymId?: string };
//     }) {
//       if (user) {
//         token.role = user.role;
//         token.gymId = user.gymId;
//       }

//       return token;
//     },

//     async session({
//       session,
//       token,
//     }: {
//       session: Session;
//       token: JWT;
//     }) {
//       if (session.user) {
//         session.user.role = token.role as string;
//         session.user.gymId = token.gymId as string;
//       }

//       return session;
//     },
//   },

//   pages: {
//     signIn: "/login",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/auth";

// ────────────────────────────────────────────────
// Type Augmentation (very important for TypeScript safety)
// ────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      gymId?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
    gymId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    gymId?: string | null;
  }
}

// ────────────────────────────────────────────────
// Prisma Client
// ────────────────────────────────────────────────

const prisma = new PrismaClient();

// ────────────────────────────────────────────────
// Auth Options
// ────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as unknown as import("next-auth/adapters").Adapter,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials");
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object with all needed fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          gymId: user.gymId ?? null,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    // When user signs in → add custom fields to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.gymId = user.gymId;
      }
      return token;
    },

    // When session is requested → add fields from JWT to session.user
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string; // or token.id if you set it
        session.user.role = token.role as string;
        session.user.gymId = token.gymId as string | null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    // error: "/auth/error",     // optional
    // newUser: "/welcome",      // optional
  },

  secret: process.env.AUTH_SECRET, // ← Use AUTH_SECRET in v5 (not NEXTAUTH_SECRET)

  debug: process.env.NODE_ENV === "development", // helpful logs
};

// Export handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };