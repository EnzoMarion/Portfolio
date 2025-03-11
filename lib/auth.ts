// lib/auth.ts
import { NextAuthOptions } from "next-auth";
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
                pseudo: { label: "Pseudo", type: "text" }, // Optionnel pour l'inscription
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;
                const pseudo = credentials?.pseudo;

                if (!email || !password) {
                    throw new Error("Email et mot de passe sont requis.");
                }

                // Vérifie si l'utilisateur existe
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (user) {
                    // Connexion
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Mot de passe incorrect.");
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role ?? "user", // Valeur par défaut si role est null
                    };
                } else if (pseudo) {
                    // Inscription
                    const existingUser = await prisma.user.findFirst({
                        where: { OR: [{ email }, { pseudo }] },
                    });
                    if (existingUser) {
                        throw new Error("Cet email ou pseudo est déjà utilisé.");
                    }

                    // Inscription via Supabase
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
                        role: newUser.role,
                    };
                } else {
                    throw new Error("Utilisateur non trouvé. Veuillez vous inscrire.");
                }
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
                token.role = user.role ?? "user"; // Assure que role est toujours défini
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string; // Role est déjà garanti par le callback jwt
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