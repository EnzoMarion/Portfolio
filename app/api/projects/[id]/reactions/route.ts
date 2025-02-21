import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer les réactions d'un projet
export async function GET(request: NextRequest, context: any) {
    const { id: projectId } = context.params as { id: string };
    try {
        const reactions = await prisma.reaction.findMany({
            where: { projectId },
            include: { user: { select: { pseudo: true } } },
        });

        return NextResponse.json(reactions, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Ajouter une réaction à un projet
export async function POST(request: NextRequest, context: any) {
    const { id: projectId } = context.params as { id: string };

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
        }

        // Vérifier si l'utilisateur a déjà réagi
        const existingReaction = await prisma.reaction.findFirst({
            where: { userId, projectId },
        });

        if (existingReaction) {
            return NextResponse.json({ error: "Réaction déjà enregistrée" }, { status: 400 });
        }

        const newReaction = await prisma.reaction.create({
            data: { userId, projectId },
        });

        return NextResponse.json(newReaction, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Supprimer une réaction
export async function DELETE(request: NextRequest) {
    const { userId, projectId } = await request.json();

    try {
        // Vérifier si la réaction existe pour ce projet
        const existingReaction = await prisma.reaction.findFirst({
            where: {
                userId,
                projectId,
            },
        });

        if (!existingReaction) {
            return NextResponse.json({ error: "Réaction non trouvée" }, { status: 404 });
        }

        // Supprimer la réaction
        await prisma.reaction.delete({
            where: {
                id: existingReaction.id,  // Utiliser l'id de la réaction trouvée
            },
        });

        return NextResponse.json({ message: "Réaction supprimée" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

