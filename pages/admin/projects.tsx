"use client";

import { useState, useEffect } from "react";

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

const AdminProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        const fetchProjects = async () => {
            const response = await fetch("/api/projects");
            if (!response.ok) return console.error("Erreur lors du chargement des projets");

            const data = await response.json();
            setProjects(data);
        };

        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        await fetch(`/api/projects/${id}`, { method: "DELETE" });
        setProjects((prev) => prev.filter((p) => p.id !== id));
    };

    const handleAddProject = async () => {
        if (!title || !description || !imageUrl) return alert("Tous les champs sont requis");

        const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, imageUrl }),
        });

        if (!response.ok) return alert("Erreur lors de l'ajout");

        const newProject = await response.json();
        setProjects((prev) => [...prev, newProject]);
        setTitle("");
        setDescription("");
        setImageUrl("");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-2xl font-bold">Gestion des projets</h1>

            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">Ajouter un projet</h2>
                <input
                    type="text"
                    placeholder="Titre"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
                />
                <input
                    type="text"
                    placeholder="URL de l'image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2 mb-2 bg-gray-800 border border-gray-700 rounded"
                />
                <button onClick={handleAddProject} className="bg-green-500 p-2 rounded w-full">
                    Ajouter
                </button>
            </div>

            <div className="mt-6">
                {projects.length === 0 ? (
                    <p>Aucun projet disponible.</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="p-4 bg-gray-800 rounded-lg mt-2">
                            <h2>{project.title}</h2>
                            <p>{project.description}</p>
                            <button onClick={() => handleDelete(project.id)} className="bg-red-500 p-2 rounded mt-2">
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminProjects;
