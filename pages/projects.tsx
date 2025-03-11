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
}

interface Message {
    id: string;
    content: string;
    userId: string;
    createdAt: string;
    user: {
        pseudo: string;
    };
}

export default function Projects() {
    const [user, setUser] = useState<{ id: string; email: string; pseudo: string; role: string } | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<{ [key: string]: Message[] }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData.user) {
                // Pas de redirection, on laisse l'utilisateur à null pour les visiteurs
                setUser(null);
            } else {
                try {
                    const response = await fetch(`/api/user?email=${authData.user.email}`);
                    if (!response.ok) throw new Error("Utilisateur non trouvé");

                    const userData = await response.json();
                    setUser(userData);
                } catch (error) {
                    console.error("Erreur lors de la récupération de l'utilisateur:", error);
                    setUser(null); // On continue sans utilisateur
                }
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) throw new Error("Erreur lors de la récupération des projets");

                const data = await response.json();
                setProjects(data);

                // Charger les commentaires pour chaque projet
                data.forEach((project: Project) => {
                    fetchComments(project.id);
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des projets:", error);
            }
        };

        fetchUser();
        fetchProjects();
        setLoading(false);
    }, [router]);

    // Charger les commentaires d'un projet
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

    // Ajouter un commentaire
    const handleAddComment = async (projectId: string) => {
        if (!newComment[projectId] || !user) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment[projectId], userId: user.id }),
            });

            if (!response.ok) throw new Error("Erreur lors de l'ajout du commentaire");

            fetchComments(projectId); // Recharger les commentaires
            setNewComment((prev) => ({ ...prev, [projectId]: "" })); // Réinitialiser le commentaire
        } catch (error) {
            console.error(error);
        }
    };

    // Supprimer un projet (admin seulement)
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

    if (loading) return <p className="text-white">Chargement...</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <h1 className="text-3xl p-4">Projets</h1>

            {user?.role === "admin" && (
                <div className="p-4">
                    <button
                        onClick={() => router.push("/projects/add")}
                        className="bg-green-500 p-2 rounded mb-4"
                    >
                        Ajouter un projet
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {projects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <Image
                            src={project.imageUrl.startsWith("/") ? project.imageUrl : `/${project.imageUrl}`}
                            alt={project.title}
                            className="w-full h-40 object-cover rounded"
                            width={500}
                            height={200}
                        />
                        <h2 className="text-xl font-bold mt-2">{project.title}</h2>
                        <p className="text-gray-300">{project.description}</p>

                        {/* Options admin : Modifier et Supprimer */}
                        {user?.role === "admin" && (
                            <div className="mt-4 flex space-x-2">
                                <Link href={`/projects/${project.id}/modify`}>
                                    <button className="bg-yellow-500 p-2 rounded">Modifier</button>
                                </Link>
                                <button
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="bg-red-500 p-2 rounded"
                                >
                                    Supprimer
                                </button>
                            </div>
                        )}

                        {/* Commentaires */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Commentaires :</h3>
                            <div className="space-y-2">
                                {comments[project.id]?.map((comment) => (
                                    <p key={comment.id} className="bg-gray-700 p-2 rounded">
                                        <span className="font-bold">{comment.user.pseudo} :</span> {comment.content}
                                    </p>
                                ))}
                            </div>
                            {user ? (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        placeholder="Ajouter un commentaire..."
                                        value={newComment[project.id] || ""}
                                        onChange={(e) =>
                                            setNewComment((prev) => ({ ...prev, [project.id]: e.target.value }))
                                        }
                                        className="bg-gray-600 p-2 rounded w-full text-white"
                                    />
                                    <button
                                        onClick={() => handleAddComment(project.id)}
                                        className="bg-blue-500 p-2 rounded mt-2"
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
                ))}
            </div>
        </div>
    );
}