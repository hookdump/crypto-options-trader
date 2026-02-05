import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { DataProvider } from "@/components/data-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Options Trader | Binance European Options",
  description:
    "Professional-grade crypto options trading platform with real-time data, advanced analytics, and streamlined order execution.",
  keywords: ["crypto", "options", "trading", "binance", "derivatives", "bitcoin", "ethereum"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        <DataProvider>
          <Header />
          <main className="container mx-auto px-4 py-4">{children}</main>
        </DataProvider>
      </body>
    </html>
  );
}
