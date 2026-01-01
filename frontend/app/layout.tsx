/**
 * app/layout.tsx
 * 
 *  Layout geral do aplicativo.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "@/providers";
import { AuthProvider } from "@/contexts/AuthContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sala de Leitura",
  description: "Sistema de gerenciamento de sala de leitura",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <AuthProvider>
          {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
