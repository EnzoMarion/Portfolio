"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
    const router = useRouter();

    const handleConfirmation = () => {
        router.push("/auth/signin");
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

    const buttonVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
            <motion.h1
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-[var(--accent-pink)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent mb-8"
            >
                Vérifiez votre email
            </motion.h1>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w p-6 bg-[var(--gray-dark)] rounded-xl shadow-lg space-y-6"
            >
                <p className="text-[var(--gray-light)] text-center text-sm sm:text-base">
                    Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre compte.
                </p>
                <motion.button
                    onClick={handleConfirmation}
                    variants={buttonVariants}
                    className="w-full bg-[var(--accent-blue)] hover:bg-[var(--accent-purple)] text-[var(--foreground)] p-3 rounded-lg transition-all duration-300"
                >
                    J'ai confirmé mon email
                </motion.button>
            </motion.div>
        </div>
    );
}