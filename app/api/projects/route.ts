/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer un projet spécifique par ID (GET)
export async function GET(req: NextRequest, context: any) {
    try {
        const id = context.params.id; // Récupère l'ID depuis context.params

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
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