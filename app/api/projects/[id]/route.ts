/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer un projet par ID (GET)
export async function GET(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
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

// Mettre à jour un projet par ID (PUT)
export async function PUT(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
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

// Supprimer un projet par ID (DELETE)
export async function DELETE(request: NextRequest, context: any) {
    const { id } = context.params as { id: string };
    try {
        await prisma.project.delete({ where: { id } });
        return NextResponse.json({ message: "Projet supprimé" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}