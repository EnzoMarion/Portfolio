"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

interface User {
    email: string;
    pseudo: string;
}

const supabase = createClientComponentClient();

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session?.user) {
                    setUser(null);
                } else {
                    setUser({
                        email: session.user.email || "",
                        pseudo: session.user.user_metadata?.pseudo || "Pseudo",
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
                setUser(
                    session?.user
                        ? { email: session.user.email || "", pseudo: session.user.user_metadata?.pseudo || "Pseudo" }
                        : null
                );
                setLoading(false);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/signin");
    };

    if (loading) return null; // Éviter le rendu pendant le chargement

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