import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Récupérer un utilisateur par email (GET)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération de l'utilisateur" },
            { status: 500 }
        );
    }
}

// Créer un utilisateur (POST)
export async function POST(req: NextRequest) {
    try {
        const { email, pseudo, password } = await req.json();

        if (!email || !pseudo || !password) {
            return NextResponse.json(
                { error: "Email, pseudo et mot de passe sont requis" },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur existe déjà (par email ou pseudo)
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { pseudo }],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email ou pseudo est déjà utilisé" },
                { status: 409 }
            );
        }

        // Hasher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer l'utilisateur dans la table User
        const newUser = await prisma.user.create({
            data: {
                email,
                pseudo,
                password: hashedPassword, // Mot de passe hashé
                role: "user",
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}