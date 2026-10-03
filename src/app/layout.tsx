import type { Metadata } from "next";
import "./globals.css";
import { getTenantConfig } from "@/lib/taaaac-core";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantConfig();
  return {
    title: `${config.theme.brandName} | Barberly (Taaaac Modular)`,
    description: "Gestionale verticale per barbieri e saloni di grooming maschile.",
    manifest: "/manifest.webmanifest",
    icons: {
      icon: config.theme.faviconUrl || "/icon.svg",
      apple: config.theme.faviconUrl || "/icon.svg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: config.theme.brandName || "Barberly",
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
        <link rel="icon" href={config.theme.faviconUrl || "/icon.svg"} />
        <link rel="apple-touch-icon" href={config.theme.faviconUrl || "/icon.svg"} />
        <style dangerouslySetInnerHTML={{ __html: dynamicCssVariables }} />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
      </body>
    </html>
  );
}
