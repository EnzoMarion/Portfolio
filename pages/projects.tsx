"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { prisma } from "@/lib/prisma"; // Assure-toi que Prisma est configuré dans lib/prisma

const supabase = createClientComponentClient();

export default function Projects() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                router.push("/auth/signin");
                return;
            }

            // Récupérer le rôle de l'utilisateur depuis la base de données via Prisma
            const user = await prisma.user.findUnique({
                where: { email: authData.user.email },
            });

            if (!user || user.role !== "admin") {
                router.push("/"); // Rediriger l'utilisateur si ce n'est pas un admin
                return;
            }

            setUser({
                email: user.email,
                pseudo: user.pseudo,
                role: user.role,
            });
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    const handleProjectSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");

        if (!title || !description || !imageUrl) {
            setError("Tous les champs sont requis.");
            return;
        }

        try {
            // Créer un nouveau projet
            const newProject = await prisma.project.create({
                data: {
                    title,
                    description,
                    imageUrl,
                },
            });

            console.log("Nouveau projet ajouté:", newProject);
            setTitle("");
            setDescription("");
            setImageUrl("");
        } catch (error) {
            setError("Erreur lors de la création du projet.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Chargement en cours...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="flex justify-between p-4">
                <h1 className="text-3xl">Gestion des projets</h1>
                <div>
                    <p>{user.pseudo}</p>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.push("/auth/signin");
                        }}
                        className="mt-2 bg-red-500 hover:bg-red-600 p-2 rounded"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>

            <form onSubmit={handleProjectSubmit} className="w-96 mx-auto space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                <input
                    type="text"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Titre du projet"
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />

                <textarea
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description du projet"
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />

                <input
                    type="text"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL de l'image du projet"
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 p-2 rounded"
                >
                    Ajouter un projet
                </button>
            </form>
        </div>
    );
}
