import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Définition d'un type spécifique pour les paramètres
interface Params {
    params: { id: string };
}

// Récupérer un projet par ID (GET)
export async function GET(
    request: NextRequest,
    { params }: Params // ✅ Typage correct
) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: params.id },
        });

        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la récupération du projet" }, { status: 500 });
    }
}

// Supprimer un projet (DELETE)
export async function DELETE(
    request: NextRequest,
    { params }: Params // ✅ Typage correct
) {
    try {
        const deletedProject = await prisma.project.delete({
            where: { id: params.id },
        });

        return NextResponse.json(deletedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la suppression du projet" }, { status: 500 });
    }
}
