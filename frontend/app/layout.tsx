import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProviderAuth } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PahamKode - Analisis Error dengan AI",
  description: "Sistem analisis semantik error pemrograman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inject runtime environment variables ke window object
  // Untuk static export Next.js, environment variables harus di-inject via script
  const envScript = `
    window.__ENV__ = {
      NEXT_PUBLIC_API_URL: "${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      }"
    };
  `;

  return (
    <html lang="id">
      <head>
        {/* Inject environment variables untuk runtime config */}
        <script dangerouslySetInnerHTML={{ __html: envScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProviderAuth>{children}</ProviderAuth>
      </body>
    </html>
  );
}
