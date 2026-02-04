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
  title: "EarnFlow | Premium Earning Platform",
  description: "The next-generation platform to earn virtual coins with style and ease.",
  icons: {
    icon: "/icon.png",
  }
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
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        <ClientProviders>
          <main>
            {children}
          </main>
          <BottomNav />
        </ClientProviders>
      </body>
    </html>
  );
}
