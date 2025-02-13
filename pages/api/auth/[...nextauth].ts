import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

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
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const { email, password } = credentials;

                // Connexion avec Supabase Auth
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error || !data.user) {
                    throw new Error(error?.message || "Invalid credentials");
                }

                // Récupérer des informations supplémentaires si nécessaire
                const { data: userMetadata, error: metadataError } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();

                if (metadataError || !userMetadata) {
                    throw new Error(metadataError?.message || "Role not found");
                }

                return {
                    id: data.user.id,
                    email: data.user.email,
                    role: userMetadata.role || "user",
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            return url.startsWith(baseUrl) ? url : baseUrl;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || "user";
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string; // S'assurer que id est une chaîne
                session.user.role = token.role as string || "user"; // S'assurer que role est une chaîne
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});