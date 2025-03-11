// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Exporte directement les handlers GET et POST
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);