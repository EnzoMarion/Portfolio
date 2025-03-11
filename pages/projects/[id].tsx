"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../../app/components/Navbar";

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    links?: string[]; // Ajuste selon ton modèle Prisma
}

export default function ProjectDetail() {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query; // Récupère l'ID depuis l'URL

    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${id}`);
                if (!response.ok) throw new Error("Projet non trouvé");
                const data = await response.json();
                setProject(data);
            } catch (error) {
                console.error("Erreur lors de la récupération du projet:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) return <p className="text-white text-center mt-10">Chargement...</p>;
    if (!project) return <p className="text-white text-center mt-10">Projet non trouvé</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-6">{project.title}</h1>
                <Image
                    src={project.imageUrl.startsWith("/") ? project.imageUrl : `/${project.imageUrl}`}
                    alt={project.title}
                    className="w-full h-64 object-cover rounded-lg mb-6"
                    width={800}
                    height={400}
                />
                <p className="text-gray-300 mb-6">{(project.description)}</p>
                {project.links && project.links.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-2">Liens :</h2>
                        <ul className="list-disc list-inside">
                            {project.links.map((link, index) => (
                                <li key={index}>
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <Link href="/projects" className="text-blue-400 hover:underline">
                    Retour aux projets
                </Link>
            </div>
        </div>
    );
}