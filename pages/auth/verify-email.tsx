"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";

const supabase = createClientComponentClient();

export default function VerifyEmailPage() {
    const router = useRouter();

    useEffect(() => {
        const verifyEmail = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Erreur lors de la vérification:", error);
                return;
            }
            if (session) {
                router.push("/dashboard");
            }
        };
        verifyEmail();
    }, [router]);

    const containerVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
    const titleVariants = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut", delay: 0.2 } } };
    const buttonVariants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            <motion.h1 variants={titleVariants} initial="hidden" animate="visible" className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-8">
                Vérification de votre email
            </motion.h1>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md p-6 bg-[var(--gray-dark)] rounded-xl shadow-lg space-y-6">
                <p className="text-[var(--gray-light)] text-center text-sm sm:text-base">
                    Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre compte.
                </p>
                <p className="text-[var(--gray-light)] text-center text-sm sm:text-base">
                    Si vous avez déjà cliqué sur le lien, vous serez automatiquement redirigé vers le dashboard.
                </p>
            </motion.div>
        </div>
    );
}