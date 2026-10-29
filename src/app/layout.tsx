import FloatingWhatsAppWidget from "@/components/public/FloatingWhatsAppWidget";
import type { Metadata } from "next";
import "./globals.css";
import { getTenantConfig } from "@/lib/taaaac-core";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantConfig();
  const brand = config.theme.brandName || "Barber Shop";
  return {
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description: `Servizi e prenotazioni online per ${brand}`,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/api/pwa-icon?size=192", sizes: "192x192", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [{ url: "/api/pwa-icon?size=180", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: brand,
    },
  };
}

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getTenantConfig();

  // Iniezione variabili CSS semantiche per il brand dinamico Taaaac
  const dynamicCssVariables = `
    :root {
      --brand-primary: ${config.theme.primaryColor || "#0f172a"};
      --brand-accent: ${config.theme.accentColor || "#d97706"};
    }
  `;

  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/api/pwa-icon?size=192" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/api/pwa-icon?size=180" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <style dangerouslySetInnerHTML={{ __html: dynamicCssVariables }} />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
      <FloatingWhatsAppWidget />
      </body>
    </html>
  );
}
