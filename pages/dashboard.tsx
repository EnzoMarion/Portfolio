"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Navbar from "../app/components/Navbar";
import Link from "next/link";
import Image from "next/image";

const supabase = createClientComponentClient();

interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: string;
}

interface News {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event:", event);
            if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
                if (session?.user) {
                    setUser({
                        email: session.user.email!,
                        pseudo: session.user.user_metadata?.pseudo || "Pseudo non défini",
                    });
                } else {
                    setUser(null);
                }
                setLoadingSession(false);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setLoadingSession(false);
            }
        });

        const fetchData = async () => {
            try {
                const projectsResponse = await fetch("/api/projects");
                if (!projectsResponse.ok) throw new Error("Erreur lors de la récupération des projets");
                const projectsData: Project[] = await projectsResponse.json();
                const sortedProjects = projectsData
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);
                setProjects(sortedProjects);

                const newsResponse = await fetch("/api/news");
                if (!newsResponse.ok) throw new Error("Erreur lors de la récupération des actualités");
                const newsData: News[] = await newsResponse.json();
                const sortedNews = newsData
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);
                setNews(sortedNews);
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    if (loadingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <p className="text-white">Chargement en cours...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            {user ? (
                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-3xl">Bienvenue, {user.pseudo} !</h1>
                    <p className="text-gray-400">({user.email})</p>

                    <div className="mt-10 mx-4 w-full max-w-4xl">
                        <h2 className="text-2xl">Mes derniers projets</h2>
                        {loadingData ? (
                            <p className="text-gray-400">Chargement des projets...</p>
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {projects.map((project) => (
                                    <Link href={`/projects/${project.id}`} key={project.id}>
                                        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer">
                                            <img
                                                src={project.imageUrl}
                                                alt={project.title}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold">{project.title}</h3>
                                                <p className="text-gray-300 text-sm">
                                                    {project.description.slice(0, 100)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Créé le {new Date(project.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">Aucun projet trouvé.</p>
                        )}
                        <p className="mt-2">
                            <Link href="/projects" className="text-blue-400 hover:underline">
                                Voir tous mes projets
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 mx-4 w-full max-w-4xl">
                        <h2 className="text-2xl">Mes dernières actualités</h2>
                        {loadingData ? (
                            <p className="text-gray-400">Chargement des actualités...</p>
                        ) : news.length > 0 ? (
                            <div className="space-y-4 mt-4">
                                {news.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
                                    >
                                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{item.title}</h3>
                                            <p className="text-gray-300 text-sm">
                                                {item.content.slice(0, 100)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Publié le {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">Aucune actualité trouvée.</p>
                        )}
                        <p className="mt-2">
                            <Link href="/news" className="text-blue-400 hover:underline">
                                Voir toutes mes actualités
                            </Link>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-10">
                    <h1 className="text-3xl">Bienvenue sur mon Portfolio !</h1>
                    <p className="text-gray-400 mt-2">
                        Découvrez mes projets et actualités.{" "}
                        <Link href="/auth/signin" className="text-blue-400 hover:underline">
                            Connectez-vous
                        </Link>{" "}
                        pour accéder à votre tableau de bord personnel.
                    </p>

                    <div className="mt-10 mx-4 w-full max-w-4xl">
                        <h2 className="text-2xl">Derniers projets</h2>
                        {loadingData ? (
                            <p className="text-gray-400">Chargement des projets...</p>
                        ) : projects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {projects.map((project) => (
                                    <Link href={`/projects/${project.id}`} key={project.id}>
                                        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer">
                                            <img
                                                src={project.imageUrl}
                                                alt={project.title}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="text-lg font-bold">{project.title}</h3>
                                                <p className="text-gray-300 text-sm">
                                                    {project.description.slice(0, 100)}...
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    Créé le {new Date(project.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">Aucun projet trouvé.</p>
                        )}
                        <p className="mt-2">
                            <Link href="/projects" className="text-blue-400 hover:underline">
                                Voir tous les projets
                            </Link>
                        </p>
                    </div>

                    <div className="mt-10 mx-4 w-full max-w-4xl">
                        <h2 className="text-2xl">Dernières actualités</h2>
                        {loadingData ? (
                            <p className="text-gray-400">Chargement des actualités...</p>
                        ) : news.length > 0 ? (
                            <div className="space-y-4 mt-4">
                                {news.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
                                    >
                                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.title}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">{item.title}</h3>
                                            <p className="text-gray-300 text-sm">
                                                {item.content.slice(0, 100)}...
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Publié le {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">Aucune actualité trouvée.</p>
                        )}
                        <p className="mt-2">
                            <Link href="/news" className="text-blue-400 hover:underline">
                                Voir toutes les actualités
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}