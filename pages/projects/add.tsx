"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";

const supabase = createClientComponentClient();

export default function AddProject() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [moreUrl, setMoreUrl] = useState("");
    const [deploymentUrl, setDeploymentUrl] = useState("");
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
                Ajouter un projet
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
                    <label htmlFor="description" className="block text-[var(--gray-light)] mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        required
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="imageUrl" className="block text-[var(--gray-light)] mb-2">
                        URL de l'image
                    </label>
                    <input
                        type="text"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        required
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="moreUrl" className="block text-[var(--gray-light)] mb-2">
                        Lien GitHub (optionnel)
                    </label>
                    <input
                        type="text"
                        id="moreUrl"
                        value={moreUrl}
                        onChange={(e) => setMoreUrl(e.target.value)}
                        placeholder="ex: https://github.com/username/repo"
                        className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                    />
                </motion.div>
                <motion.div variants={inputVariants}>
                    <label htmlFor="deploymentUrl" className="block text-[var(--gray-light)] mb-2">
                        URL de déploiement (optionnel)
                    </label>
                    <input
                        type="text"
                        id="deploymentUrl"
                        value={deploymentUrl}
                        onChange={(e) => setDeploymentUrl(e.target.value)}
                        placeholder="ex: https://mon-projet.vercel.app"
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
                        onClick={() => router.push("/projects")}
                        className="w-full bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                    >
                        Annuler
                    </button>
                </motion.div>
            </motion.form>
        </div>
    );
}