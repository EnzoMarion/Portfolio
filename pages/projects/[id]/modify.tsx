"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    moreUrl?: string; // Optionnel (GitHub)
    deploymentUrl?: string; // Optionnel (Déploiement)
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

        // Seuls title, description et imageUrl sont requis
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

    if (loading) return <p className="text-white">Chargement...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Modifier le projet</h1>

            {project && (
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-gray-300">
                            Titre
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={project.title}
                            onChange={(e) => setProject({ ...project, title: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-gray-300">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={project.description}
                            onChange={(e) => setProject({ ...project, description: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-gray-300">
                            URL de l'image
                        </label>
                        <input
                            id="imageUrl"
                            type="url"
                            value={project.imageUrl}
                            onChange={(e) => setProject({ ...project, imageUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="moreUrl" className="block text-gray-300">
                            Lien GitHub (optionnel)
                        </label>
                        <input
                            id="moreUrl"
                            type="url"
                            value={project.moreUrl || ""}
                            onChange={(e) => setProject({ ...project, moreUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="deploymentUrl" className="block text-gray-300">
                            URL de déploiement (optionnel)
                        </label>
                        <input
                            id="deploymentUrl"
                            type="url"
                            value={project.deploymentUrl || ""}
                            onChange={(e) => setProject({ ...project, deploymentUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 p-2 rounded">
                            Sauvegarder les modifications
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/projects")}
                            className="bg-gray-500 hover:bg-gray-600 p-2 rounded"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}