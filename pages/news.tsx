"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

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
                // Trier par date décroissante (plus récent en haut)
                const sortedNews = data.sort(
                    (a: NewsItem, b: NewsItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setNews(sortedNews);
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

    // Variants pour les animations (style dashboard.tsx)
    const sectionVariants = {
        hidden: { opacity: 0, y: 100, rotate: -5 },
        visible: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: { duration: 0.8, ease: "easeOut", type: "spring", bounce: 0.4 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, x: -50 },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 100 },
        },
        hover: {
            scale: 1.05,
            borderColor: "var(--accent-purple)",
            boxShadow: "0 15px 30px rgba(255, 105, 180, 0.6)",
            transition: { duration: 0.3 },
        },
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } },
    };

    // Grouper les actualités par année
    const groupNewsByYear = () => {
        const grouped: { [year: string]: NewsItem[] } = {};
        news.forEach((item) => {
            const year = new Date(item.createdAt).getFullYear().toString();
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(item);
        });
        return grouped;
    };

    const groupedNews = groupNewsByYear();

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <motion.p
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="text-[var(--foreground)] text-xl"
                >
                    Chargement en cours...
                </motion.p>
            </div>
        );

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-16 px-4 sm:px-8 md:px-12 flex-grow w-full max-w-[100vw]">
                <motion.h1
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-2"
                >
                    Actualités
                </motion.h1>
                <motion.p
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[var(--gray-light)] text-sm sm:text-base text-center mb-6 max-w-2xl"
                >
                    Retrouvez ici mes dernières activités : années de formation, diplômes, certifications, stages, alternances, CDD, et bien plus encore. Un aperçu de mon parcours et de mes réalisations !
                </motion.p>

                {user?.role === "admin" && (
                    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                        <button
                            onClick={() => router.push("/news/add")}
                            className="px-6 py-3 text-[var(--accent-blue)] text-lg border-2 border-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-purple)] hover:text-[var(--foreground)] hover:border-[var(--accent-purple)] transition-all duration-300"
                        >
                            Ajouter une actualité
                        </button>
                    </motion.div>
                )}

                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-6xl"
                >
                    {news.length === 0 ? (
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center"
                        >
                            <p className="text-[var(--gray-light)] text-lg sm:text-xl">
                                Aucune actualité pour le moment. Ajoutez-en une si vous êtes admin !
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedNews)
                                .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA)) // Trier par année décroissante
                                .map(([year, items]) => (
                                    <div key={year} className="space-y-6">
                                        <motion.h2
                                            variants={titleVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="text-3xl sm:text-4xl font-bold text-[var(--accent-blue)] border-b-2 border-[var(--accent-purple)] pb-2"
                                        >
                                            {year}
                                        </motion.h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {items.map((item, index) => (
                                                <motion.div
                                                    key={item.id}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    whileHover="hover"
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-[var(--gray-dark)] rounded-xl overflow-hidden border border-transparent"
                                                >
                                                    <Image
                                                        src={item.imageUrl}
                                                        alt={item.title}
                                                        width={400}
                                                        height={200}
                                                        className="w-full h-48 object-cover rounded-t-xl border-b border-[var(--accent-blue)]"
                                                    />
                                                    <div className="p-6">
                                                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
                                                            {item.title}
                                                        </h3>
                                                        <p className="text-[var(--gray-light)] text-sm sm:text-base mb-4">{item.content}</p>
                                                        {item.moreUrl && (
                                                            <p className="mt-2">
                                                                <a
                                                                    href={item.moreUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300"
                                                                >
                                                                    Plus d'infos
                                                                </a>
                                                            </p>
                                                        )}
                                                        <p className="text-[var(--gray-light)] text-xs mt-2">
                                                            Date {new Date(item.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {user?.role === "admin" && (
                                                            <div className="mt-4 flex space-x-2">
                                                                <Link href={`/news/${item.id}/modify`}>
                                                                    <button className="bg-[var(--accent-pink)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] py-1 px-3 rounded-lg">
                                                                        Modifier
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDeleteNews(item.id)}
                                                                    className="bg-[var(--accent-pink)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] py-1 px-3 rounded-lg"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="mt-8 text-center"
                >
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}