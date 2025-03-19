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
        setStatusMessage({ text: "", type: null });

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
        <footer
            className="bg-[var(--gray-dark)] py-12 mt-12 border-t-2 border-[var(--accent-blue)]"
            style={{ display: "flex", justifyContent: "space-around" }}
        >
            <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                    {/* Mes réseaux */}
                    <div className="flex flex-col space-y-6">
                        <h3 className="text-2xl font-bold text-[var(--accent-blue)]">Mes réseaux</h3>
                        <div className="flex flex-col space-y-4">
                            <a
                                href="https://www.linkedin.com/in/enzo-marion-227495262/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300 group"
                            >
                                <div className="p-2 rounded-full bg-[var(--background)] bg-opacity-10 group-hover:bg-opacity-20 transition-all">
                                    <Image
                                        src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/linkedin.svg"
                                        alt="LinkedIn"
                                        width={20}
                                        height={20}
                                        className="invert"
                                    />
                                </div>
                                <span>LinkedIn</span>
                            </a>
                            <a
                                href="https://github.com/EnzoMarion"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 text-[var(--accent-blue)] hover:text-[var(--accent-purple)] transition-all duration-300 group"
                            >
                                <div className="p-2 rounded-full bg-[var(--background)] bg-opacity-10 group-hover:bg-opacity-20 transition-all">
                                    <Image
                                        src="https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/github.svg"
                                        alt="GitHub"
                                        width={20}
                                        height={20}
                                        className="invert"
                                    />
                                </div>
                                <span>GitHub</span>
                            </a>
                        </div>
                    </div>

                    {/* Mes coordonnées */}
                    <div className="flex flex-col space-y-6">
                        <h3 className="text-2xl font-bold text-[var(--accent-blue)]">Mes coordonnées</h3>
                        <div className="flex flex-col space-y-4">
                            <a
                                href="tel:0750315674"
                                className="flex items-center space-x-3 text-[var(--gray-light)] hover:text-[var(--accent-blue)] transition-all duration-300 group"
                            >
                                <div className="p-2 rounded-full bg-[var(--background)] bg-opacity-10 group-hover:bg-opacity-20 transition-all">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-[var(--accent-blue)]"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                    </svg>
                                </div>
                                <span>07 50 31 56 74</span>
                            </a>
                            <a
                                href="mailto:marionenzo26@gmail.com"
                                className="flex items-center space-x-3 text-[var(--gray-light)] hover:text-[var(--accent-blue)] transition-all duration-300 group"
                            >
                                <div className="p-2 rounded-full bg-[var(--background)] bg-opacity-10 group-hover:bg-opacity-20 transition-all">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-[var(--accent-blue)]"
                                    >
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <span>marionenzo26@gmail.com</span>
                            </a>
                        </div>
                    </div>

                    {/* Me contacter */}
                    <div id="contact-section" className="flex flex-col space-y-6">
                        <h3 className="text-2xl font-bold text-[var(--accent-blue)]">Me contacter</h3>
                        <p className="text-[var(--gray-light)] text-sm">
                            Envoyez-moi un message directement depuis ce formulaire, je vous répondrai par email dès que possible !
                        </p>
                        {user ? (
                            <form onSubmit={handleSendEmail} className="flex flex-col space-y-6">
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Objet de votre message"
                                    required
                                    className="p-3 rounded-md bg-[var(--background)] text-[var(--foreground)] border border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent w-full"
                                />
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Votre message..."
                                    required
                                    rows={4}
                                    className="p-3 rounded-md bg-[var(--background)] text-[var(--foreground)] border border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent w-full"
                                />
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="inline-block px-6 py-3 text-[var(--accent-blue)] text-lg border-2 border-[var(--accent-blue)] rounded-lg hover:bg-[var(--accent-purple)] hover:text-[var(--foreground)] hover:border-[var(--accent-purple)] transition-all duration-300"
                                >
                                    {sending ? "Envoi en cours..." : "Envoyer"}
                                </button>
                                {statusMessage.text && (
                                    <p
                                        className={`text-sm mt-2 ${
                                            statusMessage.type === "success"
                                                ? "text-[var(--accent-blue)]"
                                                : "text-[var(--accent-pink)]"
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
                                    className="text-[var(--accent-blue)] hover:text-[var(--accent-purple)] hover:underline"
                                >
                                    Connectez-vous
                                </Link>{" "}
                                pour m’envoyer un message via ce formulaire.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    );
}