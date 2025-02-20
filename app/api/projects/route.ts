import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Récupérer tous les projets (GET)
export async function GET() {
    try {
        const projects = await prisma.project.findMany();
        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la récupération des projets" }, { status: 500 });
    }
}

// Ajouter un projet (POST)
export async function POST(req: NextRequest) {
    try {
        const { title, description, imageUrl, moreUrl } = await req.json();

        if (!title || !description || !imageUrl || !moreUrl) {
            return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
        }

        const newProject = await prisma.project.create({
            data: { title, description, imageUrl, moreUrl },
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création du projet" }, { status: 500 });
    }
}
