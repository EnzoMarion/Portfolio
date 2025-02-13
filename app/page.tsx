import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-6">Bienvenue sur mon Portfolio</h1>
            <p className="mb-6">Découvrez mes projets et laissez un message !</p>
            <div className="flex space-x-4">
                <Link href="/auth/signin" className="bg-blue-500 px-4 py-2 rounded">Se connecter</Link>
                <Link href="/auth/signup" className="bg-green-500 px-4 py-2 rounded">S'inscrire</Link>
            </div>
        </div>
    );
}
