import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Définir metadata avec des valeurs par défaut pour éviter null
export const metadata: Metadata = {
    title: "Portfolio Enzo Marion", // Toujours une string
    description: "Portfolio personnel d'Enzo Marion, développeur web passionné", // Toujours une string
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <Head>
            <title>{metadata.title as string}</title> {/* Cast en string car on sait qu'il est défini */}
            <meta name="description" content={metadata.description as string} /> {/* Idem */}
        </Head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}