"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

interface NewsItem {
    id: string;
    title: string;
    content: string;
    imageUrl: string; // Obligatoire
    moreUrl?: string; // Optionnel
    createdAt: string;
}

export default function ModifyNews() {
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const newsId = typeof params?.id === "string" ? params.id : null;

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
                if (userData.role !== "admin") {
                    router.push("/news");
                }
            } catch (error: unknown) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                router.push("/news");
            }
        };

        const fetchNews = async () => {
            if (!newsId) return;

            try {
                const response = await fetch(`/api/news`); // Récupère toutes les actualités
                if (!response.ok) throw new Error("Erreur lors de la récupération des actualités");

                const newsData: NewsItem[] = await response.json();
                const currentNews = newsData.find((n) => n.id === newsId);
                if (!currentNews) {
                    throw new Error("Actualité non trouvée");
                }
                setNews(currentNews);
            } catch (error: unknown) {
                console.error("Erreur lors de la récupération de l'actualité:", error);
                setError("Erreur lors de la récupération de l'actualité");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchNews();
    }, [newsId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!news) return;

        if (!news.title || !news.content || !news.imageUrl) {
            alert("Titre, contenu et URL de l'image sont requis");
            return;
        }

        try {
            const response = await fetch(`/api/news`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(news),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'actualité");

            router.push("/news");
        } catch (error) {
            alert("Erreur lors de la mise à jour de l'actualité");
            console.error(error);
        }
    };

    if (loading) return <p className="text-white">Chargement...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Modifier l'actualité</h1>

            {news && (
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-gray-300">
                            Titre
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={news.title}
                            onChange={(e) => setNews({ ...news, title: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-gray-300">
                            Contenu
                        </label>
                        <textarea
                            id="content"
                            value={news.content}
                            onChange={(e) => setNews({ ...news, content: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block text-gray-300">
                            URL de l'image
                        </label>
                        <input
                            id="imageUrl"
                            type="url"
                            value={news.imageUrl}
                            onChange={(e) => setNews({ ...news, imageUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="moreUrl" className="block text-gray-300">
                            URL supplémentaire (optionnel)
                        </label>
                        <input
                            id="moreUrl"
                            type="url"
                            value={news.moreUrl || ""}
                            onChange={(e) => setNews({ ...news, moreUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            placeholder="ex: certification, site d'école, etc."
                        />
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2 rounded">
                            Sauvegarder les modifications
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
            )}
        </div>
    );
}