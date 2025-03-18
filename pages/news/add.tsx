"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";

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

    // Variants pour les animations
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } },
    };

    const inputVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    if (!user || user.role !== "admin") {
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
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            <motion.h1
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-8"
            >
                Ajouter une actualité
            </motion.h1>
            <motion.form
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w space-y-6 p-6 bg-[var(--gray-dark)] rounded-xl shadow-lg"
            >
                <motion.div variants={inputVariants}>
                    <label htmlFor="title" className="block text-[var(--gray-light)] mb-2">
                        Titre
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        required
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="content" className="block text-[var(--gray-light)] mb-2">
                        Contenu
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        required
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="imageUrl" className="block text-[var(--gray-light)] mb-2">
                        URL de l'image
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        required
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="moreUrl" className="block text-[var(--gray-light)] mb-2">
                        URL supplémentaire (optionnel)
                    </label>
                    <input
                        type="url"
                        id="moreUrl"
                        value={moreUrl}
                        onChange={(e) => setMoreUrl(e.target.value)}
                        placeholder="ex: certification, site d'école, etc."
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                    />
                </motion.div>
                <motion.div variants={inputVariants} className="flex gap-4">
                    <button
                        type="submit"
                        className="w-full bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                    >
                        Ajouter
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/news")}
                        className="w-full bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                    >
                        Annuler
                    </button>
                </motion.div>
            </motion.form>
        </div>
    );
}