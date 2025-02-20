"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../app/components/Navbar"; // Importation de la Navbar

const supabase = createClientComponentClient();

export default function Dashboard() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                router.push("/auth/signin");
                return;
            }

            // Si l'utilisateur est connecté, récupérer ses infos
            setUser({
                email: authData.user.email!,
                pseudo: authData.user.user_metadata?.pseudo || 'Pseudo non défini',
            });
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    // Si les données sont en cours de chargement
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Chargement en cours...</p>
            </div>
        );
    }

    // Vérifier si user est défini avant d'afficher ses informations
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Aucun utilisateur trouvé.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="flex flex-col items-center justify-center mt-10">
                <h1 className="text-3xl">Bienvenue, {user.pseudo} !</h1>
                <p className="text-gray-400">({user.email})</p>
            </div>

            <div className="mt-10 mx-4">
                <h2 className="text-2xl">Mes Projets</h2>
            </div>

            <div className="mt-10 mx-4">
                <h2 className="text-2xl">Mes Actualités</h2>
            </div>
        </div>
    );
}
