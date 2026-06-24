import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";

import { auth } from "@/auth";
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
  const session = await auth();
  const isLoginPage = pathname.startsWith("/login");

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={manrope.variable}>
        <ThemeProvider>
          {isLoginPage ? (
            children
          ) : (
            <AppShell pathname={pathname} session={session}>
              {children}
            </AppShell>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
