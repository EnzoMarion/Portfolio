// app/api/news/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer toutes les actualités (GET)
export async function GET() {
    try {
        const news = await prisma.news.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(news, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la récupération des actualités:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Ajouter une actualité (POST)
export async function POST(req: Request) {
    try {
        const { title, content, imageUrl, moreUrl } = await req.json();

        if (!title || !content || !imageUrl) {
            return NextResponse.json(
                { error: "Titre, contenu et URL de l'image sont requis" },
                { status: 400 }
            );
        }

        const newNews = await prisma.news.create({
            data: {
                title,
                content,
                imageUrl,
                moreUrl: moreUrl || null, // Optionnel
            },
        });

        return NextResponse.json(newNews, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de l'actualité:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Modifier une actualité (PUT)
export async function PUT(req: Request) {
    try {
        const { id, title, content, imageUrl, moreUrl } = await req.json();

        if (!id || !title || !content || !imageUrl) {
            return NextResponse.json(
                { error: "ID, titre, contenu et URL de l'image sont requis" },
                { status: 400 }
            );
        }

        const updatedNews = await prisma.news.update({
            where: { id },
            data: {
                title,
                content,
                imageUrl,
                moreUrl: moreUrl || null, // Optionnel
            },
        });

        return NextResponse.json(updatedNews, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la modification de l'actualité:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Supprimer une actualité (DELETE)
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "ID est requis" }, { status: 400 });
        }

        await prisma.news.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Actualité supprimée" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'actualité:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}