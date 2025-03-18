"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../app/components/Navbar";
import Footer from "@/app/components/Footer";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    moreUrl?: string;
    deploymentUrl?: string;
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

export default function ProjectDetail() {
    const [project, setProject] = useState<Project | null>(null);
    const [user, setUser] = useState<{ id: string; email: string; pseudo: string; role: string } | null>(null);
    const [comments, setComments] = useState<Message[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editComment, setEditComment] = useState<{ commentId: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const id = params?.id as string | undefined;

    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/projects/${id}/comments`);
            if (!response.ok) return;
            const data = await response.json();
            setComments(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires:", error);
        }
    };

    useEffect(() => {
        if (!id) return;

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

        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${id}`);
                if (!response.ok) throw new Error("Projet non trouvé");
                const data = await response.json();
                setProject(data);
            } catch (error) {
                console.error("Erreur lors de la récupération du projet:", error);
            }
        };

        fetchUser();
        fetchProject();
        fetchComments().finally(() => setLoading(false));
    }, [id]);

    const handleAddComment = async (parentId: string | null = null) => {
        if (!newComment || !user || !id) return;

        try {
            const response = await fetch(`/api/projects/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment, userId: user.id, parentId }),
            });

            if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

            setNewComment("");
            setReplyTo(null);
            await fetchComments();
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
        }
    };

    const handleEditComment = async (commentId: string) => {
        if (!user || !editComment || editComment.content.trim() === "" || !id) return;

        try {
            const response = await fetch(`/api/projects/${id}/comments`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    content: editComment.content,
                    userId: user.id,
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la modification du commentaire");

            setEditComment(null);
            await fetchComments();
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire:", error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user || !id) return;

        try {
            const response = await fetch(`/api/projects/${id}/comments`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    commentId,
                    userId: user.id,
                    isAdmin: user.role === "admin",
                }),
            });

            if (!response.ok) throw new Error("Erreur lors de la suppression du commentaire");

            await fetchComments();
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire:", error);
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 100, rotate: -5 },
        visible: {
            opacity: 1,
            y: 0,
            rotate: 0,
            transition: { duration: 0.8, ease: "easeOut", type: "spring", bounce: 0.4 },
        },
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, x: -50 },
        visible: {
            opacity: 1,
            scale: 1,
            x: 0,
            transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 100 },
        },
    };

    const renderComments = (messages: Message[], depth = 0) =>
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
                                onClick={() => handleEditComment(comment.id)}
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
                                    onClick={() => setEditComment({ commentId: comment.id, content: comment.content })}
                                    className="text-[var(--accent-pink)] hover:text-[var(--accent-purple)] text-sm"
                                >
                                    Modifier
                                </button>
                            )}
                            {(user?.id === comment.userId || user?.role === "admin") && (
                                <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-[var(--accent-pink)] hover:text-[var(--accent-purple)] text-lg font-bold"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">{renderComments(comment.replies, depth + 1)}</div>
                )}
                {user?.role === "admin" && (
                    <button
                        onClick={() => setReplyTo(comment.id)}
                        className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] text-sm mt-1"
                    >
                        Répondre
                    </button>
                )}
                {user?.role === "admin" && replyTo === comment.id && (
                    <div className="mt-2 flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Répondre..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-[var(--background)] text-[var(--foreground)] p-2 rounded-lg w-full border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)]"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddComment(comment.id)}
                                className="bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Envoyer
                            </button>
                            <button
                                onClick={() => setReplyTo(null)}
                                className="bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-2 rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        ));

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

    if (!project)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
                <motion.p
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[var(--foreground)] text-xl"
                >
                    Projet non trouvé
                </motion.p>
            </div>
        );

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
            <Navbar />
            <div className="flex flex-col items-center justify-center mt-16 px-4 sm:px-8 md:px-12 flex-grow w-full max-w-[100vw]">
                <motion.div
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-4xl"
                >
                    <motion.h1
                        variants={titleVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-6"
                    >
                        {project.title}
                    </motion.h1>

                    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="mb-6">
                        <Image
                            src={project.imageUrl}
                            alt={project.title}
                            width={800}
                            height={400}
                            className="w-full h-64 object-cover rounded-lg border border-[var(--accent-blue)]"
                        />
                    </motion.div>

                    <motion.p
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-[var(--gray-light)] text-base sm:text-lg mb-6"
                    >
                        {project.description}
                    </motion.p>

                    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--accent-blue)] mb-4">Liens :</h2>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {project.moreUrl && (
                                <a
                                    href={project.moreUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--background)] font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                                >
                                    Voir sur GitHub
                                </a>
                            )}
                            {project.deploymentUrl && (
                                <a
                                    href={project.deploymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-[var(--accent-pink)] hover:bg-[var(--accent-purple)] text-[var(--background)] font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
                                >
                                    Voir le déploiement
                                </a>
                            )}
                            {!project.moreUrl && !project.deploymentUrl && (
                                <p className="text-[var(--gray-light)] italic">Aucun lien disponible</p>
                            )}
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="mb-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-[var(--accent-blue)] mb-2">Commentaires :</h2>
                        <div className="space-y-2">
                            {comments.length > 0 ? (
                                renderComments(comments.filter((c) => !c.parentId))
                            ) : (
                                <p className="text-[var(--gray-light)]">Aucun commentaire pour l'instant.</p>
                            )}
                        </div>
                        {user ? (
                            <div className="mt-4 flex flex-col gap-2">
                                <input
                                    type="text"
                                    placeholder="Ajouter un commentaire..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="bg-[var(--background)] text-[var(--foreground)] p-2 rounded-lg w-full border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)]"
                                />
                                <button
                                    onClick={() => handleAddComment()}
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
                    </motion.div>

                    <motion.div variants={cardVariants} initial="hidden" animate="visible">
                        <Link
                            href="/projects"
                            className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300"
                        >
                            Retour aux projets
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}