import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { from, subject, message } = await req.json();

        if (!from || !subject || !message) {
            console.log("Données manquantes :", { from, subject, message });
            return NextResponse.json({ error: "Email, objet et message requis" }, { status: 400 });
        }

        console.log("Données reçues :", { from, subject, message });
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Défini" : "Non défini");

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // marionenzo26@gmail.com
                pass: process.env.EMAIL_PASS, // Mot de passe d'application
            },
            tls: {
                rejectUnauthorized: false, // Désactive la vérification stricte des certificats (local uniquement)
            },
        });

        const mailOptions = {
            from: `"Enzo Marion" <${process.env.EMAIL_USER}>`, // Expéditeur technique
            to: "marionenzo26@gmail.com", // Destinataire
            subject: subject,
            text: `${message}\n\nEnvoyé par : ${from}`,
            replyTo: from, // Répondre à l'utilisateur connecté
        };

        console.log("Tentative d'envoi de l'email avec options :", mailOptions);
        await transporter.sendMail(mailOptions);

        console.log("Email envoyé avec succès à marionenzo26@gmail.com depuis :", from);
        return NextResponse.json({ message: "Email envoyé avec succès" }, { status: 200 });
    } catch (error: any) {
        console.error("Erreur détaillée lors de l'envoi de l'email:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
        });
        return NextResponse.json(
            { error: "Erreur lors de l'envoi de l'email", details: error.message || "Erreur inconnue" },
            { status: 500 }
        );
    }
}