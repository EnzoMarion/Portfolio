import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer un projet par ID (GET)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } } // Assurer que params.id est une string
) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: params.id }, // L'ID est bien une string
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

// Mettre à jour un projet (PUT)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { title, description, imageUrl, moreUrl } = await request.json();

        const updatedProject = await prisma.project.update({
            where: { id: params.id },
            data: { title, description, imageUrl, moreUrl },
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour du projet" }, { status: 500 });
    }
}

// Supprimer un projet (DELETE)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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
