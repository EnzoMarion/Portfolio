"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

const supabase = createClientComponentClient();

export default function SignIn() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const isEmail = identifier.includes("@");
        let emailToUse = identifier;

        if (!isEmail) {
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("email")
                .eq("pseudo", identifier)
                .single();

            if (userError || !userData) {
                setError("Aucun utilisateur trouvé avec ce pseudo.");
                return;
            }
            emailToUse = userData.email;
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password,
        });

        if (authError) {
            setError(`Erreur de connexion : ${authError.message}`);
            return;
        }

        if (!authData.user?.confirmed_at) {
            setError("Merci de confirmer votre email avant de vous connecter.");
            return;
        }

        router.push("/dashboard");
    };

    // Variants pour les animations
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } },
    };

    const inputVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
            <motion.h1
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-8"
            >
                Se connecter
            </motion.h1>
            <motion.form
                onSubmit={handleSubmit}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md space-y-6 p-6 bg-[var(--gray-dark)] rounded-xl shadow-lg"
            >
                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[var(--accent-pink)] text-center"
                    >
                        {error}
                    </motion.p>
                )}
                <motion.input
                    type="text"
                    placeholder="Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    variants={inputVariants}
                    className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                    required
                />
                <motion.input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variants={inputVariants}
                    className="w-full p-3 rounded-lg bg-[var(--background)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-purple)] text-[var(--foreground)]"
                    required
                />
                <motion.button
                    type="submit"
                    variants={inputVariants}
                    className="w-full bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                >
                    Se connecter
                </motion.button>
                <motion.button
                    onClick={() => router.push("/dashboard")}
                    variants={inputVariants}
                    className="w-full bg-[var(--gray-dark)] hover:bg-[var(--gray-light)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                >
                    Retour
                </motion.button>
            </motion.form>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 text-[var(--gray-light)]"
            >
                Pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300">
                    S'inscrire
                </Link>
            </motion.p>
        </div>
    );
}