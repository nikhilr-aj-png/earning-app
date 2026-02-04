import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EarnFlow | The Executive Earning Portfolio",
  description: "Secure, high-fidelity earning platform for professional asset acquisition. Join the elite network of Flow Credit managers.",
  keywords: ["earning", "flow credits", "professional assets", "secure earning", "executive portfolio"],
  authors: [{ name: "EarnFlow Global" }],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "EarnFlow | Executive Earning Portfolio",
    description: "The elite standard in digital asset acquisition.",
    url: "https://earning-app.vercel.app",
    siteName: "EarnFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EarnFlow | Executive Earning Portfolio",
    description: "Transitioning to a new era of secure digital earning.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <ClientProviders>
          <div className="min-h-screen" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <main style={{ flex: 1, width: '100%' }}>
              {children}
            </main>
            <Footer />
            <BottomNav />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
