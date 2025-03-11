import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Téâtre Script Builder",
  description: "Outil de création de script pour le théâtre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`antialiased`}>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
