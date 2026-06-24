import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Agenda CRO-MG | Gestão de Eventos",
  description: "Aplicação web para gestão da agenda de eventos do CRO-MG."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={manrope.variable}>
        <ThemeProvider>
          <AppShell pathname={pathname}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
