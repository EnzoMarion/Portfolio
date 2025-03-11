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
    createdAt: string;
}

export default function ModifyNews() {
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();

    const newsId = typeof params?.id === "string" ? params.id : null;
    console.log("News ID:", newsId);

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
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
                } else {
                    console.error("Erreur inconnue lors de la récupération de l'utilisateur.");
                }
                router.push("/news");
            }
        };

        const fetchNews = async () => {
            if (!newsId) return;

            try {
                const response = await fetch(`/api/news`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des actualités");
                }

                const newsData = await response.json();
                const currentNews = newsData.find((n: NewsItem) => n.id === newsId);
                if (!currentNews) {
                    throw new Error("Actualité non trouvée");
                }
                setNews(currentNews);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération de l'actualité:", error.message);
                    setError("Erreur lors de la récupération de l'actualité");
                } else {
                    console.error("Erreur inconnue lors de la récupération de l'actualité.");
                }
            }
        };

        fetchUser();
        fetchNews();
        setLoading(false);
    }, [newsId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!news) return;

        if (!news.title || !news.content) {
            alert("Titre et contenu doivent être remplis");
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
            alert("L'actualité a été mise à jour avec succès");
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
                        <label htmlFor="title" className="block">Titre</label>
                        <input
                            id="title"
                            type="text"
                            value={news.title}
                            onChange={(e) => setNews({ ...news, title: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block">Contenu</label>
                        <textarea
                            id="content"
                            value={news.content}
                            onChange={(e) => setNews({ ...news, content: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-500 p-2 rounded"
                        >
                            Sauvegarder les modifications
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/news")}
                            className="bg-gray-500 p-2 rounded"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}