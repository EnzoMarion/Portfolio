"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation"; // Utilisation de useParams
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    moreUrl: string;
}

export default function ModifyProject() {
    const [user, setUser] = useState<{ email: string; pseudo: string; role: string } | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const params = useParams(); // Utilisation de useParams

    // Vérification de la présence de 'id' dans les params et de son type
    const projectId = typeof params?.id === "string" ? params.id : null;
    console.log("Project ID:", projectId);  // Pour vérifier si l'ID est correct

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

        const fetchProject = async () => {
            if (!projectId) return;

            try {
                const response = await fetch(`/api/projects/${projectId}`);
                if (!response.ok) {
                    const errorMessage = await response.text();  // Récupérer le message d'erreur
                    console.error("Erreur API:", errorMessage);  // Afficher l'erreur dans la console
                    throw new Error(errorMessage);
                }

                const projectData = await response.json();
                setProject(projectData);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error("Erreur lors de la récupération du projet:", error.message);
                    setError("Erreur lors de la récupération du projet");
                } else {
                    console.error("Erreur inconnue lors de la récupération du projet.");
                }
            }
        };



        fetchUser();
        fetchProject();
        setLoading(false);
    }, [projectId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!project) return;  // Vérifiez que les données du projet existent

// Vérifiez que les champs requis sont remplis avant d'envoyer la requête PUT
        if (!project.title || !project.description || !project.imageUrl || !project.moreUrl) {
            alert("Tous les champs doivent être remplis");
            return;
        }


        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour du projet");

            const updatedProject = await response.json();
            router.push("/projects");
            alert("Le projet a été mis à jour avec succès");
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
                        <label htmlFor="title" className="block">Titre</label>
                        <input
                            id="title"
                            type="text"
                            value={project.title}
                            onChange={(e) => setProject({ ...project, title: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block">Description</label>
                        <textarea
                            id="description"
                            value={project.description}
                            onChange={(e) => setProject({ ...project, description: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block">URL de l'image</label>
                        <input
                            id="imageUrl"
                            type="url"
                            value={project.imageUrl}
                            onChange={(e) => setProject({ ...project, imageUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="moreUrl" className="block">URL plus d'infos</label>
                        <input
                            id="moreUrl"
                            type="url"
                            value={project.moreUrl}
                            onChange={(e) => setProject({ ...project, moreUrl: e.target.value })}
                            className="w-full p-2 mt-1 bg-gray-800 text-white border rounded"
                            required
                        />
                    </div>

                    <div className="mt-4 flex space-x-2">
                        <button
                            type="submit"
                            className="bg-blue-500 p-2 rounded"
                        >
                            Sauvegarder les modifications
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/projects")}
                            className="bg-gray-500 p-2 rounded"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
