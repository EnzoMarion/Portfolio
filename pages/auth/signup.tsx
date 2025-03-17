"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

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

        // Étape 1 : Inscription dans Supabase Auth
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { pseudo } },
        });

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        // Étape 2 : Créer l'utilisateur dans la table User via l'API
        try {
            const response = await fetch("/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, pseudo, password }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                setError(error || "Erreur lors de la création de l'utilisateur");
                return;
            }

            // Redirection après succès
            router.push("/auth/verify-email");
        } catch (error) {
            setError("Erreur lors de la communication avec le serveur");
            console.error(error);
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
                <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 p-2 rounded w-80"
                >
                    Retour
                </button>
            </form>
            <p className="mt-4">
                Déjà un compte ?{" "}
                <Link href="/auth/signin" className="text-blue-400">
                    Se connecter
                </Link>
            </p>
        </div>
    );
}