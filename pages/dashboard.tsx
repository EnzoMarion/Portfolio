"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Navbar from "../app/components/Navbar";
import Footer from "../app/components/Footer";
import Link from "next/link";
import Image from "next/image";

const skills = [
    { name: "HTML", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/html5.svg" },
    { name: "CSS", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/css3.svg" },
    { name: "PHP", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/php.svg" },
    { name: "JavaScript", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/javascript.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/python.svg" },
    { name: "SQL", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/postgresql.svg" },
    { name: "Tailwind CSS", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/tailwindcss.svg" },
    { name: "Bootstrap", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/bootstrap.svg" },
    { name: "Vue.js", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/vuedotjs.svg" },
    { name: "React", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/react.svg" },
    { name: "React Native", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/react.svg" },
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/nodedotjs.svg" },
    { name: "GitLab", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/gitlab.svg" },
];

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

// Composant pour le fond animé avec particules uniquement
const CrazyBackground = () => {
    const particleVariants = {
        animate: (i: number) => ({
            x: [0, Math.random() * 400 - 200, 0],
            y: [0, Math.random() * 400 - 200, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
            transition: {
                duration: 5 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        }),
    };

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Particules dégradées */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-6 h-6 rounded-full particle-glow"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        background: `radial-gradient(circle, var(--accent-${["pink", "purple", "blue"][i % 3]}) 20%, transparent 70%)`,
                    }}
                    variants={particleVariants}
                    animate="animate"
                    custom={i}
                />
            ))}
        </div>
    );
};

export default function Dashboard() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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

    const sectionVariants = {
        hidden: { opacity: 0, y: 100, rotate: -5 },
        visible: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.8, ease: "easeOut", type: "spring", bounce: 0.4 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, x: -50 },
        visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", type: "spring", stiffness: 100 } },
        hover: { scale: 1.05, borderColor: "var(--accent-purple)", boxShadow: "0 15px 30px rgba(255, 105, 180, 0.6)", transition: { duration: 0.3 } },
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } },
    };

    if (loadingSession) {
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
    }

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-x-hidden relative">
            {/* Fond animé avec particules uniquement */}
            <CrazyBackground />

            <Navbar />
            <div className="flex flex-col items-center justify-center mt-16 px-4 sm:px-8 md:px-12 flex-grow w-full max-w-[100vw] z-10">
                <motion.h1
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-6"
                >
                    Bienvenue sur mon portfolio !
                </motion.h1>
                <motion.p
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-[var(--gray-light)] text-lg sm:text-xl md:text-2xl text-center max-w-3xl mb-12"
                >
                    {user
                        ? `Bonjour ${user.pseudo} ! Explore mes projets, mes compétences et mes dernières actualités.`
                        : "Découvrez mon univers créatif, mes compétences techniques et mes projets récents."}
                </motion.p>

                {/* À propos de moi */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-16 w-full max-w-6xl">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent-pink)] mb-6">À propos de moi</h2>
                    <p className="text-[var(--gray-light)] text-lg sm:text-xl leading-relaxed">
                        Je m’appelle Enzo Marion, né en 2003 dans la Drôme. Passionné par l’informatique et le développement web depuis plusieurs années, j’ai choisi d’en faire mon métier. En dehors de la programmation, j’aime relever des défis, explorer de nouvelles technologies et m’investir dans des projets créatifs. Curieux et persévérant, je suis toujours motivé pour apprendre et repousser mes limites.
                    </p>
                </motion.div>

                {/* Mon cursus */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-16 w-full max-w-6xl">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent-purple)] mb-6">Mon Parcours</h2>
                    <p className="text-[var(--gray-light)] text-lg sm:text-xl leading-relaxed">
                        Actuellement en 3e année de BUT MMI (Métiers du Multimédia et de l’Internet) spécialisation développement web, j’ai auparavant obtenu un BTS SIO (Services Informatiques aux Organisations) option SLAM (Solutions Logicielles et Applications Métiers) après un baccalauréat général scientifique avec les spécialités Mathématiques, Physique-Chimie et SVT. Ce parcours m’a permis de développer des compétences solides en développement web (JavaScript, PHP, SQL, ...) et de maîtriser des outils modernes comme React, Next.js et Node.js, tout en cultivant une rigueur scientifique héritée de mon bac.
                    </p>
                </motion.div>

                {/* Mes compétences */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-16 w-full max-w-6xl">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent-blue)] mb-6">Mes compétences</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-6">
                        {skills.map((skill, index) => (
                            <motion.div
                                key={skill.name}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover="hover"
                                transition={{ delay: index * 0.05 }}
                                className="bg-[var(--gray-dark)] rounded-xl p-4 flex flex-col items-center justify-center border border-transparent"
                            >
                                <Image src={skill.logo} alt={skill.name} width={48} height={48} className="invert mb-2" />
                                <span className="text-[var(--foreground)] text-sm font-medium text-center">{skill.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Projets */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-16 w-full max-w-6xl">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent-pink)] mb-6">Mes derniers projets</h2>
                    {loadingData ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--gray-light)] text-lg">
                            Chargement des projets...
                        </motion.p>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[var(--gray-dark)] rounded-xl overflow-hidden border border-transparent"
                                >
                                    <Link href={`/projects/${project.id}`}>
                                        <Image
                                            src={project.imageUrl}
                                            alt={project.title}
                                            width={400}
                                            height={200}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="p-6">
                                            <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{project.title}</h3>
                                            <p className="text-[var(--gray-light)] text-sm sm:text-base mt-2">
                                                {project.description.slice(0, 100)}
                                            </p>
                                            <p className="text-xs text-[var(--gray-light)] mt-3">
                                                Date : {new Date(project.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--gray-light)] text-lg">Aucun projet trouvé.</p>
                    )}
                    <motion.p variants={sectionVariants} initial="hidden" animate="visible" className="mt-8">
                        <Link
                            href="/projects"
                            className="inline-block px-6 py-3 text-[var(--accent-blue)] text-lg border-2 border-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-purple)] hover:text-[var(--foreground)] hover:border-[var(--accent-purple)] transition-all duration-300"
                        >
                            Voir tous mes projets
                        </Link>
                    </motion.p>
                </motion.div>

                {/* Actualités */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mt-16 w-full max-w-6xl mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold text-[var(--accent-purple)] mb-6">Mes dernières actualités</h2>
                    {loadingData ? (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--gray-light)] text-lg">
                            Chargement des actualités...
                        </motion.p>
                    ) : news.length > 0 ? (
                        <div className="space-y-8 mt-6">
                            {news.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-[var(--gray-dark)] rounded-xl p-6 flex items-center space-x-6 border border-transparent"
                                >
                                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{item.title}</h3>
                                        <p className="text-[var(--gray-light)] text-sm sm:text-base mt-2">
                                            {item.content.slice(0, 100)}
                                        </p>
                                        <p className="text-xs text-[var(--gray-light)] mt-3">
                                            Date : {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[var(--gray-light)] text-lg">Aucune actualité trouvée.</p>
                    )}
                    <motion.p variants={sectionVariants} initial="hidden" animate="visible" className="mt-8">
                        <Link
                            href="/news"
                            className="inline-block px-6 py-3 text-[var(--accent-blue)] text-lg border-2 border-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-purple)] hover:text-[var(--foreground)] hover:border-[var(--accent-purple)] transition-all duration-300"
                        >
                            Voir toutes mes actualités
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
}