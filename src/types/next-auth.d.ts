import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      gymId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    gymId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    gymId?: string;
  }
}
