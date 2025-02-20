"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

export default function SignIn() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const supabase = createClientComponentClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const isEmail = identifier.includes("@");

        let emailToUse = identifier;

        // Si l'utilisateur se connecte avec un pseudo, récupérer l'email associé
        if (!isEmail) {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("email")
                .eq("pseudo", identifier)
                .single();

            if (userError || !userData) {
                setError("Aucun utilisateur trouvé avec ce pseudo.");
                return;
            }
            emailToUse = userData.email;
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password,
        });

        if (authError) {
            setError(`Erreur de connexion : ${authError.message}`);
            return;
        }

        // Vérifier que l'email est confirmé
        if (!authData.user?.confirmed_at) {
            setError("Merci de confirmer votre email avant de vous connecter.");
            return;
        }

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl mb-6">Se connecter</h1>
            <form onSubmit={handleSubmit} className="w-80 space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <input
                    type="text"
                    placeholder="Email ou pseudo"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
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
                    Se connecter
                </button>
            </form>
            <p className="mt-4">
                Pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-blue-400">
                    S&apos;inscrire
                </Link>
            </p>
        </div>
    );
}
