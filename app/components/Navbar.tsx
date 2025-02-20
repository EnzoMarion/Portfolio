"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

// Définir un type pour l'utilisateur
interface User {
    email: string;
    pseudo: string;
}

const supabase = createClientComponentClient();

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null); // Utilisation du type défini
    const router = useRouter();

    // Fonction de déconnexion
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/signin"); // Rediriger vers la page de connexion après la déconnexion
    };

    // Utiliser useEffect pour récupérer l'utilisateur
    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError) {
                console.error("Erreur lors de la récupération de l'utilisateur", authError);
            }
            // Utilisation d'une valeur par défaut pour email
            setUser(authData?.user ? { email: authData.user.email || "", pseudo: authData.user.user_metadata?.pseudo || 'Pseudo' } : null);
        };

        fetchUser(); // Appeler la fonction au chargement du composant

        // Optionnel : écouter les changements d'authentification
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ? { email: session.user.email || "", pseudo: session.user.user_metadata?.pseudo || 'Pseudo' } : null);
        });

        // Retourner la fonction de nettoyage pour désabonner l'écouteur
        return () => {
            authListener?.subscription.unsubscribe(); // Désabonnement
        };
    }, []);

    return (
        <nav className="bg-gray-800 p-4">
            <div className="flex justify-between items-center w-full">
                <Link href="/" className="hover:text-green-500 text-white">
                    <div className="text-xl text-white">Enzo Marion</div>
                </Link>
                <div className="flex space-x-8">
                    <Link href="/projects" className="hover:text-green-500 text-white">
                        Projets
                    </Link>
                    <Link href="/news" className="hover:text-green-500 text-white">
                        Actualités
                    </Link>
                    <Link href="/profile" className="hover:text-green-500 text-white">
                        Profil
                    </Link>
                </div>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            <p className="text-sm text-white">{user.pseudo}</p>
                            <button
                                onClick={handleSignOut}
                                className="text-sm text-red-500 hover:text-red-600"
                            >
                                Se déconnecter
                            </button>
                        </>
                    ) : (
                        <Link href="/auth/signin" className="text-sm text-blue-500 hover:text-blue-600">
                            Se connecter
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
