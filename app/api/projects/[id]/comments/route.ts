/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les commentaires d'un projet
export async function GET(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        const comments = await prisma.message.findMany({
            where: { projectId: id },
            include: {
                user: { select: { pseudo: true } },
                replies: { include: { user: { select: { pseudo: true } } } },
            },
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
    const { id } = context.params as { id: string };

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        const { content, userId, parentId } = await request.json();

        if (!content || !userId) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        const newComment = await prisma.message.create({
            data: {
                content,
                userId,
                projectId: id,
                parentId: parentId || null,
            },
            include: { user: { select: { pseudo: true } } },
        });

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Modifier un commentaire
export async function PUT(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
        const { commentId, content, userId } = await request.json();

        if (!commentId || !content || !userId) {
            return NextResponse.json({ error: "ID du commentaire, contenu et userId sont requis" }, { status: 400 });
        }

        const comment = await prisma.message.findUnique({ where: { id: commentId } });
        if (!comment) {
            return NextResponse.json({ error: "Commentaire non trouvé" }, { status: 404 });
        }

        // Autoriser la modification uniquement si l'utilisateur est l'auteur
        if (comment.userId !== userId) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à modifier ce commentaire" }, { status: 403 });
        }

        const updatedComment = await prisma.message.update({
            where: { id: commentId },
            data: { content },
            include: { user: { select: { pseudo: true } } },
        });

        return NextResponse.json(updatedComment, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur lors de la modification" }, { status: 500 });
    }
}

// Supprimer un commentaire par ID
export async function DELETE(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
        const { commentId, userId, isAdmin } = await request.json();

        if (!commentId || !userId) {
            return NextResponse.json({ error: "ID du commentaire et userId sont requis" }, { status: 400 });
        }

        const comment = await prisma.message.findUnique({ where: { id: commentId } });
        if (!comment) {
            return NextResponse.json({ error: "Commentaire non trouvé" }, { status: 404 });
        }

        if (comment.userId !== userId && !isAdmin) {
            return NextResponse.json({ error: "Vous n'êtes pas autorisé à supprimer ce commentaire" }, { status: 403 });
        }

        await prisma.message.delete({ where: { id: commentId } });

        return NextResponse.json({ message: "Commentaire supprimé" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
    }
}