"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    moreUrl?: string;
    deploymentUrl?: string;
}

export default function ModifyProject() {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams();
    const projectId = typeof params?.id === "string" ? params.id : null;

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
                    router.push("/");
                }
            } catch (error: unknown) {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                router.push("/");
            }
        };

        const fetchProject = async () => {
            if (!projectId) return;

            try {
                const response = await fetch(`/api/projects/${projectId}`);
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error("Erreur API:", errorMessage);
                    throw new Error(errorMessage);
                }

                const projectData = await response.json();
                setProject(projectData);
            } catch (error: unknown) {
                console.error("Erreur lors de la récupération du projet:", error);
                setError("Erreur lors de la récupération du projet");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchProject();
    }, [projectId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!project) return;

        if (!project.title || !project.description || !project.imageUrl) {
            alert("Les champs titre, description et URL de l'image sont requis");
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour du projet");

            router.push("/projects");
        } catch (error) {
            alert("Erreur lors de la mise à jour du projet");
            console.error(error);
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
    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <p className="text-[var(--accent-pink)]">{error}</p>
            </div>
        );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            <motion.h1
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-8"
            >
                Modifier le projet
            </motion.h1>
            {project && (
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
                            id="title"
                            type="text"
                            value={project.title}
                            onChange={(e) => setProject({ ...project, title: e.target.value })}
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
                            value={project.description}
                            onChange={(e) => setProject({ ...project, description: e.target.value })}
                            className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                            required
                        />
                    </motion.div>
                    <motion.div variants={inputVariants}>
                        <label htmlFor="imageUrl" className="block text-[var(--gray-light)] mb-2">
                            URL de l'image
                        </label>
                        <input
                            id="imageUrl"
                            type="url"
                            value={project.imageUrl}
                            onChange={(e) => setProject({ ...project, imageUrl: e.target.value })}
                            className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                            required
                        />
                    </motion.div>
                    <motion.div variants={inputVariants}>
                        <label htmlFor="moreUrl" className="block text-[var(--gray-light)] mb-2">
                            Lien GitHub (optionnel)
                        </label>
                        <input
                            id="moreUrl"
                            type="url"
                            value={project.moreUrl || ""}
                            onChange={(e) => setProject({ ...project, moreUrl: e.target.value })}
                            className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        />
                    </motion.div>
                    <motion.div variants={inputVariants}>
                        <label htmlFor="deploymentUrl" className="block text-[var(--gray-light)] mb-2">
                            URL de déploiement (optionnel)
                        </label>
                        <input
                            id="deploymentUrl"
                            type="url"
                            value={project.deploymentUrl || ""}
                            onChange={(e) => setProject({ ...project, deploymentUrl: e.target.value })}
                            className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                        />
                    </motion.div>
                    <motion.div variants={inputVariants} className="flex gap-4">
                        <button
                            type="submit"
                            className="w-full bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                        >
                            Sauvegarder les modifications
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
            )}
        </div>
    );
}