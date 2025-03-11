// lib/auth.ts
import { NextAuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Supabase Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                pseudo: { label: "Pseudo", type: "text" },
            },
// lib/auth.ts (extrait corrigé)
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;
                const pseudo = credentials?.pseudo;

                if (!email || !password) {
                    throw new Error("Email et mot de passe sont requis.");
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (user) {
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Mot de passe incorrect.");
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role, // Toujours inclus
                    };
                } else if (pseudo) {
                    const existingUser = await prisma.user.findFirst({
                        where: { OR: [{ email }, { pseudo }] },
                    });
                    if (existingUser) {
                        throw new Error("Cet email ou pseudo est déjà utilisé.");
                    }

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

                    const hashedPassword = await bcrypt.hash(password, 10);
                    const newUser = await prisma.user.create({
                        data: {
                            id: authData.user.id,
                            email: authData.user.email!,
                            pseudo,
                            password: hashedPassword,
                            role: "user",
                        },
                    });

                    return {
                        id: newUser.id,
                        email: newUser.email,
                        role: newUser.role, // Toujours inclus
                    };
                } else {
                    throw new Error("Utilisateur non trouvé. Veuillez vous inscrire.");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    // lib/auth.ts (extrait)
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user"; // Remplit role dans le token
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string || "user"; // Remplit role dans la session
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
    },
};