// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importe depuis le nouveau fichier

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export { handlers as GET, handlers as POST };