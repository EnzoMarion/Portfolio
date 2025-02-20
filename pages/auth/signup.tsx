import { useState } from "react";
import { signIn } from "next-auth/react"; // Utiliser signIn de NextAuth
import Link from "next/link"; // Importation de Link

export default function SignUp() {
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const response = await signIn("credentials", {
            redirect: false,
            email,
            password,
            pseudo, // Ajouter le pseudo ici pour l'inscription
        });

        if (response?.error) {
            setError(response.error);
        } else {
            // L'utilisateur a été inscrit et connecté avec succès
            window.location.href = "/auth/signin"; // Redirection vers la page de connexion
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
                    S&apos;inscrire {/* Remplacer le guillemet par &apos; */}
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
