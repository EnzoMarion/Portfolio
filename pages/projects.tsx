"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

export default function Projects() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
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
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération de l'utilisateur:", error.message);
                } else {
                    console.error("Erreur inconnue lors de la récupération de l'utilisateur.");
                }
                router.push("/");
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects");
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des projets");
                }
                const data = await response.json();
                setProjects(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération des projets:", error.message);
                } else {
                    console.error("Erreur inconnue lors de la récupération des projets.");
                }
            }
        };

        fetchUser();
        fetchProjects();
        setLoading(false);
    }, [router]);

    if (loading) return <p className="text-white">Chargement...</p>;

    // Fonction pour supprimer un projet
    const handleDelete = async (id: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            try {
                const response = await fetch(`/api/projects/${id}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
                    alert("Le projet a été supprimé avec succès");
                } else {
                    throw new Error("Erreur lors de la suppression du projet");
                }
            } catch (error) {
                alert("Erreur lors de la suppression du projet");
                console.error(error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Projets</h1>

            {/* Button to add a new project, only for admins */}
            {user?.role === "admin" && (
                <button
                    onClick={() => router.push("/projects/add")}
                    className="bg-green-500 p-2 rounded mb-4"
                >
                    Ajouter un projet
                </button>
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
                        {user?.role === "admin" && (
                            <div className="mt-2 flex space-x-2">
                                <button
                                    onClick={() => router.push(`/projects/${project.id}/modify`)} // Redirection vers la page de modification
                                    className="bg-yellow-500 p-2 rounded"
                                >
                                    Modifier
                                </button>
                                <button
                                    onClick={() => handleDelete(project.id)} // Supprimer le projet
                                    className="bg-red-500 p-2 rounded"
                                >
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

}
