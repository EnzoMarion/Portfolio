"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../app/components/Navbar";
import Footer from "@/app/components/Footer";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: string;
}

interface Message {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    parentId: string | null;
    user: { pseudo: string };
    replies?: Message[];
}

// Composant pour les particules animées
const CrazyBackground = () => {
    const particleVariants = {
        animate: (i: number) => ({
            x: [0, Math.random() * 400 - 200, 0],
            y: [0, Math.random() * 400 - 200, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
            transition: {
                duration: 5 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-6 h-6 rounded-full particle-glow"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        background: `radial-gradient(circle, var(--accent-${["pink", "purple", "blue"][i % 3]}) 20%, transparent 70%)`,
                    }}
                    variants={particleVariants}
                    animate="animate"
                    custom={i}
                />
            ))}
        </div>
    );
};

export default function Projects() {
    const [user, setUser] = useState<{ id: string; email: string; pseudo: string; role: string } | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<{ [key: string]: Message[] }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const [replyTo, setReplyTo] = useState<{ [key: string]: string | null }>({});
    const [editComment, setEditComment] = useState<{ projectId: string; commentId: string; content: string } | null>(null);
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

        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Erreur lors de la récupération des projets");
                const data: Project[] = await response.json();
                const sortedProjects = data.sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setProjects(sortedProjects);
                sortedProjects.forEach((project) => fetchComments(project.id));
            } catch (error) {
                console.error("Erreur lors de la récupération des projets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
        fetchProjects();
    }, [router]);

    const fetchComments = async (projectId: string) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/comments`);
            if (!response.ok) return;
            const data = await response.json();
            setComments((prev) => ({ ...prev, [projectId]: data }));
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires:", error);
        }
    };

    const handleAddComment = async (projectId: string, parentId: string | null = null) => {
        if (!newComment[projectId] || !user) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment[projectId], userId: user.id, parentId }),
            });

            if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

            fetchComments(projectId);
            setNewComment((prev) => ({ ...prev, [projectId]: "" }));
            setReplyTo((prev) => ({ ...prev, [projectId]: null }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteComment = async (projectId: string, commentId: string) => {
        if (!user) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    userId: user.id,
                    isAdmin: user.role === "admin",
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la suppression du commentaire");
            }

            fetchComments(projectId);
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire:", error);
        }
    };

    const handleEditComment = async (projectId: string, commentId: string) => {
        if (!user || !editComment || editComment.content.trim() === "") return;

        try {
            const response = await fetch(`/api/projects/${projectId}/comments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    content: editComment.content,
                    userId: user.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erreur lors de la modification du commentaire");
            }

            fetchComments(projectId);
            setEditComment(null);
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!user || user.role !== "admin") return;

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression du projet");

            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (error) {
            console.error("Erreur lors de la suppression du projet:", error);
        }
    };

    const truncateDescription = (text: string, maxLength: number = 160) =>
        text.length <= maxLength ? text : text.substring(0, maxLength) + "...";

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

    const renderComments = (projectId: string, messages: Message[], depth = 0) =>
        messages.map((comment) => (
            <motion.div
                key={comment.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className={`mt-3 ${depth > 0 ? "ml-6 border-l-2 border-[var(--gray-dark)] pl-4" : ""}`}
            >
                {editComment?.commentId === comment.id ? (
                    <div className="p-3 bg-[var(--gray-dark)] rounded-lg flex flex-col gap-2">
                        <input
                            type="text"
                            value={editComment.content}
                            onChange={(e) => setEditComment((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                            className="bg-[var(--background)] text-[var(--foreground)] p-2 rounded-lg w-full border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)]"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditComment(projectId, comment.id)}
                                className="bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Sauvegarder
                            </button>
                            <button
                                onClick={() => setEditComment(null)}
                                className="bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`p-3 rounded-lg border border-transparent ${depth > 0 ? "bg-[var(--gray-dark)]" : "bg-[var(--gray-dark)]"} flex justify-between items-start`}
                    >
                        <div>
                            <span className="font-semibold text-[var(--accent-blue)]">{comment.user.pseudo}</span>
                            <span className="text-[var(--foreground)]"> : {comment.content}</span>
                            <p className="text-xs text-[var(--gray-light)] mt-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {user?.id === comment.userId && (
                                <button
                                    onClick={() => setEditComment({ projectId, commentId: comment.id, content: comment.content })}
                                    className="text-[var(--accent-pink)] hover:text-[var(--accent-purple)] text-sm"
                                >
                                    Modifier
                                </button>
                            )}
                            {(user?.id === comment.userId || user?.role === "admin") && (
                                <button
                                    onClick={() => handleDeleteComment(projectId, comment.id)}
                                    className="text-[var(--accent-pink)] hover:text-[var(--accent-purple)] text-lg font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">{renderComments(projectId, comment.replies, depth + 1)}</div>
                )}
                {user?.role === "admin" && (
                    <button
                        onClick={() => setReplyTo((prev) => ({ ...prev, [projectId]: comment.id }))}
                        className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] text-sm mt-1"
                    >
                        Répondre
                    </button>
                )}
                {user?.role === "admin" && replyTo[projectId] === comment.id && (
                    <div className="mt-2 flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Répondre..."
                            value={newComment[projectId] || ""}
                            onChange={(e) => setNewComment((prev) => ({ ...prev, [projectId]: e.target.value }))}
                            className="bg-[var(--background)] text-[var(--foreground)] p-2 rounded-lg w-full border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)]"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddComment(projectId, comment.id)}
                                className="bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Envoyer
                            </button>
                            <button
                                onClick={() => setReplyTo((prev) => ({ ...prev, [projectId]: null }))}
                                className="bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        ));

    const groupProjectsByYear = () => {
        const grouped: { [year: string]: Project[] } = {};
        projects.forEach((project) => {
            const year = new Date(project.createdAt).getFullYear().toString();
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(project);
        });
        return grouped;
    };

    const groupedProjects = groupProjectsByYear();

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
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-x-hidden relative">
            {/* Ajout des particules */}
            <CrazyBackground />

            <Navbar />
            <div className="flex flex-col items-center justify-center mt-16 px-4 sm:px-8 md:px-12 pb-[3rem] flex-grow w-full max-w-[100vw] z-10">
                <motion.h1
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-4"
                >
                    Mes Projets
                </motion.h1>
                <motion.p
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[var(--gray-light)] text-base sm:text-lg md:text-xl text-center max-w-2xl mb-6"
                >
                    Retrouvez ici mes derniers projets : travaux personnels, collaborations, expérimentations et réalisations professionnelles. Un aperçu de mes compétences et de ma créativité à travers le temps !
                </motion.p>

                {user?.role === "admin" && (
                    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mb-8">
                        <button
                            onClick={() => router.push("/projects/add")}
                            className="px-6 py-3 text-[var(--accent-blue)] text-lg border-2 border-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-purple)] hover:text-[var(--foreground)] hover:border-[var(--accent-purple)] transition-all duration-300"
                        >
                            Ajouter un projet
                        </button>
                    </motion.div>
                )}

                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-6xl"
                >
                    {projects.length === 0 ? (
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="text-center"
                        >
                            <p className="text-[var(--gray-light)] text-lg sm:text-xl">
                                Aucun projet pour le moment. Ajoutez-en un si vous êtes admin !
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedProjects)
                                .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                                .map(([year, projects]) => (
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
                                            {projects.map((project, index) => (
                                                <motion.div
                                                    key={project.id}
                                                    variants={cardVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    whileHover="hover"
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-[var(--gray-dark)] rounded-xl overflow-hidden border border-transparent"
                                                >
                                                    <div className="relative">
                                                        <Image
                                                            src={project.imageUrl}
                                                            alt={project.title}
                                                            width={400}
                                                            height={200}
                                                            className="w-full h-48 object-cover"
                                                        />
                                                        <Link href={`/projects/${project.id}`}>
                                                            <button className="absolute bottom-2 right-2 bg-[var(--accent-blue)] text-[var(--foreground)] py-1 px-3 rounded-lg hover:bg-[var(--accent-purple)] transition-all duration-300">
                                                                En savoir plus
                                                            </button>
                                                        </Link>
                                                    </div>
                                                    <div className="p-6">
                                                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2">
                                                            {project.title}
                                                        </h3>
                                                        <p className="text-[var(--gray-light)] text-sm sm:text-base mb-4">
                                                            {truncateDescription(project.description)}
                                                        </p>

                                                        {user?.role === "admin" && (
                                                            <div className="flex gap-2 mb-4">
                                                                <Link href={`/projects/${project.id}/modify`}>
                                                                    <button className="bg-[var(--accent-pink)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] py-1 px-3 rounded-lg">
                                                                        Modifier
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDeleteProject(project.id)}
                                                                    className="bg-[var(--accent-pink)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] py-1 px-3 rounded-lg"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="mt-4">
                                                            <h4 className="text-lg font-semibold text-[var(--accent-blue)] mb-2">Commentaires :</h4>
                                                            <div className="space-y-2">
                                                                {comments[project.id] && comments[project.id].length > 0 ? (
                                                                    <>
                                                                        {renderComments(
                                                                            project.id,
                                                                            comments[project.id]
                                                                                .filter((c) => !c.parentId)
                                                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                                                .slice(0, 3)
                                                                        )}
                                                                        <Link href={`/projects/${project.id}`}>
                                                                            <button className="mt-2 text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300">
                                                                                Voir tous les commentaires
                                                                            </button>
                                                                        </Link>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-[var(--gray-light)]">Aucun commentaire pour l'instant.</p>
                                                                )}
                                                            </div>
                                                            {user ? (
                                                                <div className="mt-4 flex flex-col gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ajouter un commentaire..."
                                                                        value={newComment[project.id] || ""}
                                                                        onChange={(e) =>
                                                                            setNewComment((prev) => ({ ...prev, [project.id]: e.target.value }))
                                                                        }
                                                                        className="bg-[var(--background)] text-[var(--foreground)] p-2 rounded-lg w-full border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)]"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleAddComment(project.id)}
                                                                        className="bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-2 rounded-lg self-start"
                                                                    >
                                                                        Envoyer
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[var(--gray-light)] mt-2">
                                                                    <Link
                                                                        href="/auth/signin"
                                                                        className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)]"
                                                                    >
                                                                        Connectez-vous
                                                                    </Link>{" "}
                                                                    pour commenter.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}