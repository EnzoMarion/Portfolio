import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string | string[] } }
) {
    try {
        // Si c'est un tableau, on prend le premier élément
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string | string[] } }
) {
    try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string | string[] } }
) {
    try {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ message: "Projet supprimé" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
