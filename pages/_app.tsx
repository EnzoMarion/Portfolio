// pages/_app.tsx
import { AppProps } from 'next/app';  // Importer le type AppProps de Next.js
import { SessionProvider } from 'next-auth/react';
import "../app/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}

export default MyApp;
