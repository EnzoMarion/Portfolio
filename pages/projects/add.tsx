import { useState } from "react";
import { useRouter } from "next/router";

export default function AddProject() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [moreUrl, setMoreUrl] = useState(""); // Nouveau champ
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !imageUrl || !moreUrl) {
            console.error("Tous les champs sont requis");
            return;
        }

        // Envoi de la requête POST à l'API pour ajouter un projet
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, description, imageUrl, moreUrl }), // Ajouter moreUrl
        });

        if (response.ok) {
            // Redirection vers la page des projets après l'ajout réussi
            router.push("/projects");
        } else {
            // Gérer l'erreur ici
            console.error("Erreur lors de l'ajout du projet");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl p-4">Ajouter un projet</h1>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-300">Titre</label>
                    <input
                        type="text"
                        id="title"
                        className="w-full p-2 mt-2 bg-gray-800 text-white"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-300">Description</label>
                    <textarea
                        id="description"
                        className="w-full p-2 mt-2 bg-gray-800 text-white"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="imageUrl" className="block text-gray-300">URL de l'image</label>
                    <input
                        type="text"
                        id="imageUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="moreUrl" className="block text-gray-300">URL supplémentaire</label>
                    <input
                        type="text"
                        id="moreUrl"
                        className="w-full p-2 mt-2 bg-gray-800 text-white"
                        value={moreUrl}
                        onChange={(e) => setMoreUrl(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-green-500 p-2 rounded">
                    Ajouter
                </button>
            </form>
        </div>
    );
}
