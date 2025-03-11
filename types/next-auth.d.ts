// types/next-auth.d.ts
import { JWT as NextAuthJWT } from "next-auth/jwt";
import { Session as NextAuthSession, User as NextAuthUser } from "next-auth";

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        id?: string;
        role?: string;
    }
}

declare module "next-auth" {
    interface Session extends NextAuthSession {
        user: {
            id: string;
            role: string;
        } & NextAuthSession["user"];
    }

    interface User extends NextAuthUser {
        role?: string;
    }
}