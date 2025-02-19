import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    try {
        const projects = await prisma.project.findMany();
        return res.status(200).json(projects);
    } catch (error) {
        console.error("Erreur API récupération projets:", error);
        return res.status(500).json({ error: "Erreur lors du chargement des projets" });
    }
}
