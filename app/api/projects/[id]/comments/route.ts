/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les commentaires d'un projet
export async function GET(request: NextRequest, context: any) {
    const { id: projectId } = context.params as { id: string };
    try {
        // Vérifier si le projet existe
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        const comments = await prisma.message.findMany({
            where: { projectId },
            include: { user: { select: { pseudo: true } } },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Ajouter un commentaire à un projet
export async function POST(request: NextRequest, context: any) {
    const { id: projectId } = context.params as { id: string };

    try {
        // Vérifier si le projet existe
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        const { content, userId } = await request.json();

        if (!content || !userId) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        const newComment = await prisma.message.create({
            data: { content, userId, projectId },
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Supprimer un commentaire par ID
export async function DELETE(request: NextRequest) {
    try {
        const { commentId } = await request.json();

        if (!commentId) {
            return NextResponse.json({ error: "ID du commentaire manquant" }, { status: 400 });
        }

        await prisma.message.delete({ where: { id: commentId } });

        return NextResponse.json({ message: "Commentaire supprimé" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
