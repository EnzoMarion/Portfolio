"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../app/components/Navbar";
import Link from "next/link";

const supabase = createClientComponentClient();

export default function Dashboard() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event:", event);
            if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
                if (session?.user) {
                    setUser({
                        email: session.user.email!,
                        pseudo: session.user.user_metadata?.pseudo || "Pseudo non défini",
                    });
                } else {
                    setUser(null);
                }
                setLoadingSession(false);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setLoadingSession(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (loadingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Chargement en cours...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            {user ? (
                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-3xl">Bienvenue, {user.pseudo} !</h1>
                    <p className="text-gray-400">({user.email})</p>
                    <div className="mt-10 mx-4">
                        <h2 className="text-2xl">Mes Projets</h2>
                        <p className="text-gray-400">Ici, vos projets personnels (à implémenter).</p>
                    </div>
                    <div className="mt-10 mx-4">
                        <h2 className="text-2xl">Mes Actualités</h2>
                        <p className="text-gray-400">Vos actualités personnalisées (à implémenter).</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-3xl">Bienvenue sur mon Portfolio !</h1>
                    <p className="text-gray-400 mt-2">
                        Découvrez mes projets et actualités.{" "}
                        <Link href="/auth/signin" className="text-blue-400 hover:underline">
                            Connectez-vous
                        </Link>{" "}
                        pour accéder à votre tableau de bord personnel.
                    </p>
                    <div className="mt-10 mx-4">
                        <h2 className="text-2xl">Projets</h2>
                        <p className="text-gray-400">
                            <Link href="/projects" className="text-blue-400 hover:underline">
                                Voir tous mes projets
                            </Link>
                        </p>
                    </div>
                    <div className="mt-10 mx-4">
                        <h2 className="text-2xl">Actualités</h2>
                        <p className="text-gray-400">
                            <Link href="/news" className="text-blue-400 hover:underline">
                                Voir toutes mes actualités
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}