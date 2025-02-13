"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// @ts-ignore
import { prisma } from "@/lib/prisma"; // Assure-toi que Prisma est configuré dans lib/prisma

export default function SignUp() {
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Vérifier si le pseudo ou l'email est déjà utilisé
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .or(`email.eq.${email},pseudo.eq.${pseudo}`)
            .single();

        if (existingUser) {
            setError("Ce pseudo ou cet email est déjà utilisé.");
            return;
        }

        // Inscription avec Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                data: { pseudo },
            },
        });

        if (authError) {
            setError(authError.message);
        } else {
            // Insérer l'utilisateur dans la table `users` avec Prisma
            await prisma.user.create({
                data: {
                    email: authData.user.email,
                    pseudo: pseudo,
                    password: password, // Pense à hasher le mot de passe avant de le stocker
                    role: "user", // Par défaut, attribuer un rôle utilisateur
                },
            });
            router.push("/auth/signin"); // Rediriger vers la page de connexion
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl mb-6">Créer un compte</h1>
            <form onSubmit={handleSubmit} className="w-80 space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="text"
                    placeholder="Pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />
                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 p-2 rounded">
                    S'inscrire
                </button>
            </form>
            <p className="mt-4">
                Déjà un compte ? <a href="/auth/signin" className="text-blue-400">Se connecter</a>
            </p>
        </div>
    );
}
