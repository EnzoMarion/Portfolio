"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";

const supabase = createClientComponentClient();

export default function Footer() {
    const [user, setUser] = useState<{ email: string; pseudo: string } | null>(null);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | null }>({
        text: "",
        type: null,
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser({
                        email: session.user.email || "",
                        pseudo: session.user.user_metadata?.pseudo || "Pseudo non défini",
                    });
                } else {
                    setUser(null);
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
            if (event === "SIGNED_IN" && session?.user) {
                setUser({
                    email: session.user.email || "",
                    pseudo: session.user.user_metadata?.pseudo || "Pseudo non défini",
                });
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setStatusMessage({ text: "Vous devez être connecté pour envoyer un message.", type: "error" });
            return;
        }

        setSending(true);
        setStatusMessage({ text: "", type: null }); // Réinitialiser le message avant envoi

        try {
            const emailData = {
                from: user.email,
                subject: subject,
                message: `[Message depuis mon portfolio - ${user.pseudo}] ${message}`,
            };
            console.log("Données envoyées à l'API :", emailData);

            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailData),
            });

            const responseData = await response.json();
            console.log("Réponse de l'API :", responseData);

            if (response.ok) {
                setStatusMessage({ text: "Message envoyé avec succès !", type: "success" });
                setSubject("");
                setMessage("");
            } else {
                throw new Error(responseData.details || responseData.error || "Erreur lors de l'envoi");
            }
        } catch (error: any) {
            console.error("Erreur côté client lors de l'envoi de l'email:", error.message);
            setStatusMessage({ text: `Une erreur est survenue : ${error.message}`, type: "error" });
        } finally {
            setSending(false);
        }
    };

    if (loading) return null;

    return (
        <footer className="bg-[var(--gray-dark)] py-8 mt-12">
            <div className="max-w-5xl mx-auto px-4 flex flex-row justify-between gap-4">
                {/* Mes réseaux (gauche) */}
                <div className="flex flex-col space-y-4" style={{ width: "25%", minWidth: 0, flexShrink: 0, flexGrow: 0 }}>
                    <h3 className="text-2xl font-bold text-[var(--accent-blue)]">Mes réseaux</h3>
                    <div className="flex flex-col space-y-2">
                        <a
                            href="https://linkedin.com/in/enzo-marion"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-all duration-300"
                        >
                            <Image
                                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/linkedin.svg"
                                alt="LinkedIn"
                                width={24}
                                height={24}
                                className="invert"
                            />
                            <span>LinkedIn</span>
                        </a>
                        <a
                            href="https://github.com/enzo-marion"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-all duration-300"
                        >
                            <Image
                                src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/github.svg"
                                alt="GitHub"
                                width={24}
                                height={24}
                                className="invert"
                            />
                            <span>GitHub</span>
                        </a>
                    </div>
                </div>

                {/* Mes coordonnées (proche de Mes réseaux) */}
                <div
                    className="flex flex-col space-y-4 ml-[-2rem]"
                    style={{ width: "25%", minWidth: 0, flexShrink: 0, flexGrow: 0 }}
                >
                    <h3 className="text-2xl font-bold text-[var(--accent-blue)]">Mes coordonnées</h3>
                    <div className="flex flex-col space-y-2">
                        <p className="text-[var(--gray-light)]">07 50 31 56 74</p>
                        <p className="text-[var(--gray-light)]">marionenzo26@gmail.com</p>
                    </div>
                </div>

                {/* Me contacter (droite, plus large) */}
                <div id="contact-section" className="flex flex-col" style={{ width: "50%", minWidth: 0, flexShrink: 0, flexGrow: 0 }}>
                    <h3 className="text-2xl font-bold text-[var(--accent-blue)] mb-2">Me contacter</h3>
                    <p className="text-[var(--gray-light)] text-sm mb-4">
                        Envoyez-moi un message directement depuis ce formulaire, je vous répondrai par email dès que possible !
                    </p>
                    {user ? (
                        <form onSubmit={handleSendEmail} className="flex flex-col space-y-4">
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Objet de votre message"
                                required
                                className="p-2 rounded-md bg-[var(--background)] text-[var(--foreground)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-blue)] w-full"
                            />
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Votre message..."
                                required
                                rows={4}
                                className="p-2 rounded-md bg-[var(--background)] text-[var(--foreground)] border border-[var(--accent-blue)] focus:outline-none focus:border-[var(--accent-blue)] w-full"
                            />
                            <button
                                type="submit"
                                disabled={sending}
                                className="px-4 py-2 bg-[var(--accent-blue)] text-[var(--foreground)] rounded-md hover:bg-[var(--accent-blue)] transition-all duration-300 disabled:opacity-50 self-start"
                            >
                                {sending ? "Envoi en cours..." : "Envoyer"}
                            </button>
                            {statusMessage.text && (
                                <p
                                    className={`text-sm mt-2 ${
                                        statusMessage.type === "success"
                                            ? "text-[var(--accent-blue)]"
                                            : "text-[var(--accent-blue)]"
                                    }`}
                                >
                                    {statusMessage.text}
                                </p>
                            )}
                        </form>
                    ) : (
                        <p className="text-[var(--gray-light)]">
                            <Link
                                href="/auth/signin"
                                className="text-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
                            >
                                Connectez-vous
                            </Link>{" "}
                            pour m’envoyer un message via ce formulaire.
                        </p>
                    )}
                </div>
            </div>
        </footer>
    );
}