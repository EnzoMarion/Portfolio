import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Supprimer un projet (DELETE)
export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = context.params;
    try {
        const project = await prisma.project.delete({
            where: { id },
        });
        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du projet" },
            { status: 500 }
        );
    }
}

// Mise à jour d'un projet (PUT)
export async function PUT(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = context.params;
    const { title, description, imageUrl, moreUrl } = await req.json();
    try {
        const updatedProject = await prisma.project.update({
            where: { id },
            data: { title, description, imageUrl, moreUrl },
        });
        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du projet" },
            { status: 500 }
        );
    }
}

// Récupérer un projet (GET)
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    const { id } = context.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id },
        });
        if (!project) {
            return NextResponse.json(
                { error: "Projet non trouvé" },
                { status: 404 }
            );
        }
        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération du projet" },
            { status: 500 }
        );
    }
}