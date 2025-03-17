"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export default function AddProject() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [moreUrl, setMoreUrl] = useState(""); // Lien GitHub
    const [deploymentUrl, setDeploymentUrl] = useState(""); // Nouveau champ optionnel
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                router.push("/auth/signin");
                return;
            }

            try {
                const response = await fetch(`/api/user?email=${authData.user.email}`);
                if (!response.ok) throw new Error("Utilisateur non trouvé");

                const userData = await response.json();
                setUser(userData);

                if (userData.role !== "admin") {
                    router.push("/");
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
                } else {
                    console.error("Erreur inconnue lors de la récupération de l'utilisateur.");
                }
                router.push("/");
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !imageUrl) {
            console.error("Les champs titre, description et imageUrl sont requis");
            return;
        }

        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, description, imageUrl, moreUrl, deploymentUrl }),
        });

        if (response.ok) {
            router.push("/projects");
        } else {
            console.error("Erreur lors de l'ajout du projet");
        }
    };

    if (!user || user.role !== "admin") {
        return <p>Chargement...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Ajouter un projet</h1>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-300">
                        Titre
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="imageUrl" className="block text-gray-300">
                        URL de l'image
                    </label>
                    <input
                        type="text"
                        id="imageUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="moreUrl" className="block text-gray-300">
                        Lien GitHub (optionnel)
                    </label>
                    <input
                        type="text"
                        id="moreUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={moreUrl}
                        onChange={(e) => setMoreUrl(e.target.value)}
                        placeholder="ex: https://github.com/username/repo"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="deploymentUrl" className="block text-gray-300">
                        URL de déploiement (optionnel)
                    </label>
                    <input
                        type="text"
                        id="deploymentUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={deploymentUrl}
                        onChange={(e) => setDeploymentUrl(e.target.value)}
                        placeholder="ex: https://mon-projet.vercel.app"
                    />
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-green-500 hover:bg-green-600 p-2 rounded-lg">
                        Ajouter
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/projects")}
                        className="bg-gray-500 hover:bg-gray-600 p-2 rounded-lg"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}