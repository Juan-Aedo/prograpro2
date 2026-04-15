import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { LocationProvider } from "@/components/LocationProvider";
import { LocationBanner } from "@/components/LocationBanner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Panoramas — ¿Qué me recomiendas hacer?",
  description:
    "Descubre actividades de ocio personalizadas según tus preferencias, el clima y la disponibilidad en tu ciudad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <LocationProvider>
            <Navbar />
            <LocationBanner />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
