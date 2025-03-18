import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les projets (GET)
export async function GET(req: NextRequest) {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des projets" },
            { status: 500 }
        );
    }
}

// Ajouter un projet (POST)
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
                moreUrl: moreUrl || null,
                deploymentUrl: deploymentUrl || null,
                createdAt: new Date(),
            },
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la création du projet" },
            { status: 500 }
        );
    }
}