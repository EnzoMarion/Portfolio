"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../app/components/Navbar";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: string; // Ajouté pour le tri
}

interface Message {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    parentId: string | null;
    user: {
        pseudo: string;
    };
    replies?: Message[];
}

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
                // Tri des projets du plus récent au moins récent
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

    const truncateDescription = (text: string, maxLength: number = 160) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const renderComments = (projectId: string, messages: Message[], depth = 0) => {
        return messages.map((comment) => (
            <div key={comment.id} className={`mt-3 ${depth > 0 ? "ml-6 border-l-2 border-gray-600 pl-4" : ""}`}>
                {editComment?.commentId === comment.id ? (
                    <div className="p-3 bg-gray-700 rounded-lg flex flex-col gap-2">
                        <input
                            type="text"
                            value={editComment.content}
                            onChange={(e) =>
                                setEditComment((prev) => (prev ? { ...prev, content: e.target.value } : null))
                            }
                            className="bg-gray-800 text-white p-2 rounded-lg w-full border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEditComment(projectId, comment.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                            >
                                Sauvegarder
                            </button>
                            <button
                                onClick={() => setEditComment(null)}
                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`p-3 rounded-lg ${depth > 0 ? "bg-gray-600" : "bg-gray-700"} flex justify-between items-start`}
                    >
                        <div>
                            <span className="font-semibold text-blue-300">{comment.user.pseudo}</span>
                            <span className="text-gray-300"> : {comment.content}</span>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {user?.id === comment.userId && (
                                <button
                                    onClick={() => setEditComment({ projectId, commentId: comment.id, content: comment.content })}
                                    className="text-yellow-400 hover:text-yellow-500 text-sm"
                                >
                                    Modifier
                                </button>
                            )}
                            {(user?.id === comment.userId || user?.role === "admin") && (
                                <button
                                    onClick={() => handleDeleteComment(projectId, comment.id)}
                                    className="text-red-400 hover:text-red-600 text-lg font-bold"
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
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1"
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
                            className="bg-gray-800 text-white p-2 rounded-lg w-full border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddComment(projectId, comment.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                            >
                                Envoyer
                            </button>
                            <button
                                onClick={() => setReplyTo((prev) => ({ ...prev, [projectId]: null }))}
                                className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-lg"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ));
    };

    if (loading) return <p className="text-white text-center mt-10">Chargement...</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8">Projets</h1>

                {user?.role === "admin" && (
                    <div className="mb-6 text-center">
                        <button
                            onClick={() => router.push("/projects/add")}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                        >
                            Ajouter un projet
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="relative">
                                <Image
                                    src={project.imageUrl}
                                    alt={project.title}
                                    className="w-full h-48 object-cover"
                                    width={500}
                                    height={200}
                                />
                                <Link href={`/projects/${project.id}`}>
                                    <button className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white py-1 px-3 rounded-lg hover:bg-opacity-75 transition-opacity">
                                        En savoir plus
                                    </button>
                                </Link>
                            </div>
                            <div className="p-4">
                                <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
                                <p className="text-gray-300 mb-4">{truncateDescription(project.description)}</p>

                                {user?.role === "admin" && (
                                    <div className="flex gap-2 mb-4">
                                        <Link href={`/projects/${project.id}/modify`}>
                                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg">
                                                Modifier
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Commentaires :</h3>
                                    <div className="space-y-2">
                                        {comments[project.id] &&
                                            renderComments(project.id, comments[project.id].filter((c) => !c.parentId))}
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
                                                className="bg-gray-800 text-white p-2 rounded-lg w-full border border-gray-600 focus:outline-none focus:border-blue-500"
                                            />
                                            <button
                                                onClick={() => handleAddComment(project.id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                                            >
                                                Envoyer
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 mt-2">
                                            <Link href="/auth/signin" className="text-blue-400 hover:underline">
                                                Connectez-vous
                                            </Link>{" "}
                                            pour commenter.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}