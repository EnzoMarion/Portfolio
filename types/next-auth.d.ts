import { DefaultSession, User as AdapterUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User extends AdapterUser {
        role: string;
    }

    interface JWT {
        id: string;
        role: string;
    }
}