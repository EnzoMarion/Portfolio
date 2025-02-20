import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ Récupérer un projet par ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // ✅ Récupère l'ID directement depuis params
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
        }

        return NextResponse.json(project, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// ✅ Mettre à jour un projet par ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();

        const updatedProject = await prisma.project.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(updatedProject, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// ✅ Supprimer un projet par ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        await prisma.project.delete({ where: { id } });

        return NextResponse.json({ message: "Projet supprimé" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
