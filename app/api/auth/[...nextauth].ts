import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"; // Pour hasher le mot de passe

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Supabase Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                pseudo: { label: "Pseudo", type: "text" },
            },
            async authorize(credentials) {
                const email = credentials?.email ?? "";
                const password = credentials?.password ?? "";
                const pseudo = credentials?.pseudo ?? "";

                if (!email || !password || !pseudo) {
                    throw new Error("Tous les champs sont requis.");
                }

                // Vérifier si l'utilisateur existe déjà dans Prisma
                const existingUser = await prisma.user.findFirst({
                    where: { OR: [{ email }, { pseudo }] },
                });

                if (existingUser) {
                    throw new Error("Cet email ou pseudo est déjà utilisé.");
                }

                // Inscrire l'utilisateur avec Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${process.env.NEXTAUTH_URL}/auth/callback`,
                        data: { pseudo },
                    },
                });

                if (authError || !authData?.user) {
                    throw new Error(authError?.message || "Erreur lors de l'inscription");
                }

                // Hasher le mot de passe avant de l'ajouter dans la base de données Prisma
                const hashedPassword = await bcrypt.hash(password, 10);

                // Ajouter l'utilisateur dans la base Prisma
                await prisma.user.create({
                    data: {
                        id: authData.user.id,
                        email: authData.user.email!,
                        pseudo,
                        password: hashedPassword, // Hashed password au lieu du mot de passe en clair
                        role: "user",
                    },
                });

                return {
                    id: authData.user.id,
                    email: authData.user.email!,
                    role: "user",
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user";
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string || "user";
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
