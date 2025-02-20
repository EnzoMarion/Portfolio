"use client";

import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
    const router = useRouter();

    const handleConfirmation = () => {
        // Une fois l'email confirmé, redirige l'utilisateur vers la page de connexion
        router.push("/auth/signin");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-3xl mb-6">Vérifiez votre email</h1>
            <p className="mb-4 text-center">
                Un email de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre compte.
            </p>
            <button
                onClick={handleConfirmation}
                className="w-full bg-green-500 hover:bg-green-600 p-2 rounded"
            >
                J&apos;ai confirmé mon email
            </button>
        </div>
    );
}
