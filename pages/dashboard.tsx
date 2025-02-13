"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma"; // Assure-toi que Prisma est configuré dans lib/prisma

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData.user) {
                router.push("/auth/signin");
                return;
            }

            // Récupérer le pseudo de l'utilisateur depuis la base de données via Prisma
            const user = await prisma.user.findUnique({
                where: { email: authData.user.email },
            });

            if (!user) {
                router.push("/auth/signin");
                return;
            }

            setUser(user); // Set the user state with the fetched user
        };

        fetchUser();
    }, [router]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Chargement en cours...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl">Bienvenue, {user.pseudo} !</h1>
            <p className="text-gray-400">({user.email})</p>
        </div>
    );
}
