import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma"; // Assure-toi que Prisma est bien configuré

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
                pseudo: { label: "Pseudo", type: "text" }, // Ajout du pseudo pour l'inscription
            },
            async authorize(credentials) {
                const email = credentials?.email ?? "";
                const password = credentials?.password ?? "";
                const pseudo = credentials?.pseudo ?? "";

                if (!email || !password || !pseudo) {
                    throw new Error("Email, password et pseudo sont requis.");
                }

                // Vérifier si l'utilisateur existe déjà
                const { data: existingUser } = await supabase
                    .from("users")
                    .select("*")
                    .or(`email.eq.${email},pseudo.eq.${pseudo}`)
                    .single();

                if (existingUser) {
                    throw new Error("Cet email ou pseudo est déjà utilisé.");
                }

                // Inscription de l'utilisateur avec Supabase Auth
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

                // Vérifier si l'utilisateur a confirmé son email
                if (!authData.user?.confirmed_at) {
                    throw new Error(
                        "Inscription réussie ! Vérifiez votre email pour confirmer votre compte avant de vous connecter."
                    );
                }

                // Créer l'utilisateur dans Prisma
                await prisma.user.create({
                    data: {
                        id: authData.user.id,
                        email: authData.user.email!,
                        pseudo,
                        password, // ⚠️ À remplacer par un hash sécurisé
                        role: "user",
                    },
                });

                return {
                    id: authData.user.id,
                    email: authData.user.email!,
                    role: "user",
                };
            }
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user"; // Assurer que role est une chaîne
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string; // Assurer que id est une chaîne
                session.user.role = token.role as string || "user"; // Assurer que role est une chaîne
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
