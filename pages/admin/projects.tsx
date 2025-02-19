import { useState, useEffect } from "react";

interface Project {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
}

const AdminProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]); // 👈 Ajout du typage ici

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects"); // API à créer
                if (!response.ok) throw new Error("Erreur lors du chargement des projets");

                const data: Project[] = await response.json(); // 👈 Typage ici
                setProjects(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Gestion des projets</h1>

            <div className="mt-6">
                {projects.length === 0 ? (
                    <p className="text-gray-400 text-center">Aucun projet pour l'instant.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <div key={project.id} className="p-4 bg-gray-800 rounded-lg shadow-md">
                                <img src={project.imageUrl} alt={project.title} className="w-full h-40 object-cover rounded" />
                                <h2 className="text-xl font-bold mt-2">{project.title}</h2>
                                <p className="text-gray-300">{project.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProjects;
