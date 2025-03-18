"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

interface User {
    email: string;
    pseudo: string;
}

const supabase = createClientComponentClient();

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session?.user) {
                    setUser(null);
                } else {
                    setUser({
                        email: session.user.email || "",
                        pseudo: session.user.user_metadata?.pseudo || "Admin",
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la session:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
                setUser(
                    session?.user
                        ? { email: session.user.email || "", pseudo: session.user.user_metadata?.pseudo || "Admin" }
                        : null
                );
                setLoading(false);
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth/signin");
    };

    const scrollToContact = () => {
        const contactSection = document.getElementById("contact-section");
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) return null;

    const linkVariants = {
        hover: {
            scale: 1.1,
            color: "var(--accent-purple)",
            transition: { duration: 0.3 },
        },
    };

    const buttonVariants = {
        hover: {
            scale: 1.1,
            backgroundColor: "var(--accent-purple)",
            borderColor: "var(--accent-purple)",
            transition: { duration: 0.3 },
        },
    };

    return (
        <nav className="bg-[var(--gray-dark)] fixed top-0 left-0 w-full z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo/Nom */}
                    <Link href="/">
                        <motion.div
                            whileHover="hover"
                            variants={linkVariants}
                            className="text-4xl font-bold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent"
                        >
                            Enzo Marion
                        </motion.div>
                    </Link>

                    {/* Liens de navigation (centrés) */}
                    <div className="flex-1 flex justify-center items-center gap-8">
                        <Link href="/projects">
                            <motion.span
                                whileHover="hover"
                                variants={linkVariants}
                                className="text-[var(--foreground)] text-2xl"
                            >
                                Projets
                            </motion.span>
                        </Link>
                        <Link href="/news">
                            <motion.span
                                whileHover="hover"
                                variants={linkVariants}
                                className="text-[var(--foreground)] text-2xl"
                            >
                                Actualités
                            </motion.span>
                        </Link>
                        <button onClick={scrollToContact}>
                            <motion.span
                                whileHover="hover"
                                variants={linkVariants}
                                className="text-[var(--foreground)] text-2xl"
                            >
                                Contact
                            </motion.span>
                        </button>
                    </div>

                    {/* Section utilisateur */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xl text-[var(--gray-light)]"
                                >
                                    {user.pseudo}
                                </motion.p>
                                <motion.button
                                    onClick={handleSignOut}
                                    whileHover="hover"
                                    variants={buttonVariants}
                                    className="text-xl px-8 py-3 text-[var(--foreground)] bg-[var(--accent-blue)] rounded-md border border-[var(--accent-blue)]"
                                >
                                    Se déconnecter
                                </motion.button>
                            </>
                        ) : (
                            <Link href="/auth/signin">
                                <motion.span
                                    whileHover="hover"
                                    variants={linkVariants}
                                    className="text-xl text-[var(--accent-blue)]"
                                >
                                    Se connecter
                                </motion.span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}