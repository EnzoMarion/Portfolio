/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Permet au build de réussir même avec des erreurs ESLint
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;