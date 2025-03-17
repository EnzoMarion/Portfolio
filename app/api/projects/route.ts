/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer un projet spécifique par ID (GET)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // Récupère l'ID depuis les paramètres dynamiques

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

// Ajouter un projet (POST) - Note : Ça devrait être dans app/api/projects/route.ts
export async function POST(req: NextRequest) {
    try {
        const { title, description, imageUrl, moreUrl, deploymentUrl } = await req.json();

        if (!title || !description || !imageUrl) {
            return NextResponse.json(
                { error: "Les champs titre, description et imageUrl sont requis" },
                { status: 400 }
            );
        }

        const newProject = await prisma.project.create({
            data: {
                title,
                description,
                imageUrl,
                moreUrl: moreUrl || null, // Optionnel
                deploymentUrl: deploymentUrl || null, // Optionnel
                createdAt: new Date(),
            },
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création du projet" }, { status: 500 });
    }
}