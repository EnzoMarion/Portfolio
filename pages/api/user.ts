import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Import correct de Prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Méthode non autorisée" });
    }

    const { email } = req.query;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email requis" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur API:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
}
