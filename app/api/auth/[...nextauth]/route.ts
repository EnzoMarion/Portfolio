// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt"; // Import JWT depuis le bon sous-module
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Supabase Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
                pseudo: { label: "Pseudo", type: "text" },
            },
            async authorize(credentials) {
                const email = credentials?.email;
                const password = credentials?.password;
                const pseudo = credentials?.pseudo;

                if (!email || !password) {
                    throw new Error("Email et mot de passe sont requis.");
                }

                // Vérifier si l'utilisateur existe dans Prisma (connexion)
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (user) {
                    // Connexion : vérifier le mot de passe
                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Mot de passe incorrect.");
                    }
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    };
                } else if (pseudo) {
                    // Inscription : créer un nouvel utilisateur
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
                    await prisma.user.create({
                        data: {
                            id: authData.user.id,
                            email: authData.user.email!,
                            pseudo,
                            password: hashedPassword,
                            role: "user",
                        },
                    });

                    return {
                        id: authData.user.id,
                        email: authData.user.email!,
                        role: "user",
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
    callbacks: {
        async jwt({
                      token,
                      user,
                      account,
                      profile,
                      isNewUser,
                  }: {
            token: JWT;
            user?: User;
            account?: any;
            profile?: any;
            isNewUser?: boolean;
        }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user";
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string || "user";
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

// Export pour App Router
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export GET et POST pour gérer les requêtes
export { handlers as GET, handlers as POST };