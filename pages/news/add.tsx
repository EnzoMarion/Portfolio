"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export default function AddNews() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [moreUrl, setMoreUrl] = useState("");
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
                    router.push("/news");
                }
            } catch (error: unknown) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                router.push("/news");
            }
        };

        fetchUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !imageUrl) {
            console.error("Titre, contenu et URL de l'image sont requis");
            return;
        }

        const response = await fetch("/api/news", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, content, imageUrl, moreUrl }),
        });

        if (response.ok) {
            router.push("/news");
        } else {
            console.error("Erreur lors de l'ajout de l'actualité");
        }
    };

    if (!user || user.role !== "admin") {
        return <p>Chargement...</p>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Ajouter une actualité</h1>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label htmlFor="title" className="block text-gray-300">
                        Titre
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-gray-300">
                        Contenu
                    </label>
                    <textarea
                        id="content"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-gray-300">
                        URL de l'image
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="moreUrl" className="block text-gray-300">
                        URL supplémentaire (optionnel)
                    </label>
                    <input
                        type="url"
                        id="moreUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        value={moreUrl}
                        onChange={(e) => setMoreUrl(e.target.value)}
                        placeholder="ex: certification, site d'école, etc."
                    />
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-green-500 hover:bg-green-600 p-2 rounded">
                        Ajouter
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/news")}
                        className="bg-gray-500 hover:bg-gray-600 p-2 rounded"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}