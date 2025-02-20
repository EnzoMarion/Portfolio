import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Supprimer un projet (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const project = await prisma.project.delete({
            where: { id },
        });
        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la suppression du projet" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    const { title, description, imageUrl, moreUrl } = await req.json();

    try {
        const updatedProject = await prisma.project.update({
            where: { id },
            data: { title, description, imageUrl, moreUrl },
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour du projet" }, { status: 500 });
    }
}
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
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
