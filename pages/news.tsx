"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";

const supabase = createClientComponentClient();

interface NewsItem {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    moreUrl?: string;
    createdAt: string;
}

export default function News() {
    const [user, setUser] = useState<{ id: string; email: string; pseudo: string; role: string } | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                setUser(null);
            } else {
                try {
                    const response = await fetch(`/api/user?email=${authData.user.email}`);
                    if (!response.ok) throw new Error("Utilisateur non trouvé");
                    const userData = await response.json();
                    setUser(userData);
                } catch (error) {
                    console.error("Erreur lors de la récupération de l'utilisateur:", error);
                    setUser(null);
                }
            }
        };

        const fetchNews = async () => {
            try {
                const response = await fetch("/api/news");
                if (!response.ok) throw new Error("Erreur lors de la récupération des actualités");
                const data = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des actualités:", error);
                setNews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchNews();
    }, [router]);

    const handleDeleteNews = async (newsId: string) => {
        if (!user || user.role !== "admin") return;

        try {
            const response = await fetch("/api/news", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: newsId }),
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression de l'actualité");

            setNews((prev) => prev.filter((n) => n.id !== newsId));
        } catch (error) {
            console.error("Erreur lors de la suppression de l'actualité:", error);
        }
    };

    if (loading) return <p className="text-white">Chargement...</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <h1 className="text-3xl p-4">Actualités</h1>

            {user?.role === "admin" && (
                <div className="p-4">
                    <button
                        onClick={() => router.push("/news/add")}
                        className="bg-green-500 hover:bg-green-600 p-2 rounded mb-4"
                    >
                        Ajouter une actualité
                    </button>
                </div>
            )}

            <div className="p-4">
                {news.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-400 text-lg">
                            Aucune actualité pour le moment. Ajoutez-en une si vous êtes admin !
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {news.map((item) => (
                            <div key={item.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                    width={400}
                                    height={200}
                                />
                                <h2 className="text-xl font-bold">{item.title}</h2>
                                <p className="text-gray-300">{item.content}</p>
                                {item.moreUrl && (
                                    <p className="mt-2">
                                        <a
                                            href={item.moreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            Plus d'infos
                                        </a>
                                    </p>
                                )}
                                <p className="text-gray-500 text-sm mt-2">
                                    Publié le {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                                {user?.role === "admin" && (
                                    <div className="mt-4 flex space-x-2">
                                        <Link href={`/news/${item.id}/modify`}>
                                            <button className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded">Modifier</button>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteNews(item.id)}
                                            className="bg-red-500 hover:bg-red-600 p-2 rounded"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 text-center">
                <Link href="/dashboard" className="text-blue-400 hover:underline">
                    Retour au tableau de bord
                </Link>
            </div>
        </div>
    );
}