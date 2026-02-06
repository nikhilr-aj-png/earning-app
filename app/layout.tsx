import type { Metadata } from "next";
export const dynamic = 'force-dynamic';
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import MonetagAds from "@/components/MonetagAds";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "EarnFlow | Play Games & Earn Real Cash",
    description: "The #1 platform to earn money by playing games, completing tasks, and inviting friends. Fast withdrawals and daily rewards.",
    keywords: ["earning app", "play to earn", "make money online", "tasks", "rewards", "casual games"],
    authors: [{ name: "EarnFlow Team" }],
    icons: {
        icon: "/icon.png",
    },
    openGraph: {
        title: "EarnFlow | Play Games & Earn Cash",
        description: "Join millions earning daily rewards. Sign up now!",
        url: "https://earning-app.vercel.app",
        siteName: "EarnFlow",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "EarnFlow | Play Games & Earn Cash",
        description: "The easiest way to make money online. Start earning today.",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} antialiased`}>
                <ClientProviders>
                    <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <main style={{ flex: 1, width: '100%' }}>
                            {children}
                        </main>
                        <Footer />
                        <BottomNav />
                        <MonetagAds />
                    </div>
                </ClientProviders>
            </body>
        </html>
    );
}
