import FloatingWhatsAppWidget from "@/components/public/FloatingWhatsAppWidget";
import type { Metadata } from "next";
import "./globals.css";
import { getTenantConfig } from "@/lib/taaaac-core";
import { getPwaIconVersion, pwaIconUrl } from "@/lib/pwa-icon-version";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [config, v] = await Promise.all([getTenantConfig(), getPwaIconVersion()]);
  const brand = config.theme.brandName || "Barber Shop";
  return {
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description: `Servizi e prenotazioni online per ${brand}`,
    manifest: `/manifest.webmanifest?v=${v}`,
    icons: {
      icon: [
        { url: pwaIconUrl(32, v), sizes: "32x32", type: "image/png" },
        { url: pwaIconUrl(192, v), sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: pwaIconUrl(180, v), sizes: "180x180", type: "image/png" }],
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
  const [config, v] = await Promise.all([getTenantConfig(), getPwaIconVersion()]);

  const hasWhatsAppModule =
    Array.isArray(config.enabledModules) &&
    config.enabledModules.some((m) => String(m).toUpperCase().includes("WHATSAPP"));

  const waPhone = config.contact?.phone || "+39 02 8901 2345";

  // Iniezione variabili CSS semantiche per il brand dinamico Taaaac
  const dynamicCssVariables = `
    :root {
      --brand-primary: ${config.theme.primaryColor || "#0f172a"};
      --brand-accent: ${config.theme.accentColor || "#d97706"};
    }
  `;

  // La tessera del cliente ha icona (logo) e manifest propri, impostati dalla sua pagina
  const eTessera = ((await headers()).get("x-pathname") || "").startsWith("/tessera/");

  return (
    <html lang="it">
      <head>
        {!eTessera && (
          <>
            <link rel="icon" type="image/png" sizes="32x32" href={pwaIconUrl(32, v)} />
            <link rel="icon" type="image/png" sizes="192x192" href={pwaIconUrl(192, v)} />
            <link rel="apple-touch-icon" sizes="180x180" href={pwaIconUrl(180, v)} />
            <link rel="manifest" href={`/manifest.webmanifest?v=${v}`} />
          </>
        )}
        <style dangerouslySetInnerHTML={{ __html: dynamicCssVariables }} />
      </head>
      <body className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-amber-100 selection:text-amber-900">
        {children}
        {hasWhatsAppModule && (
          <FloatingWhatsAppWidget
            phone={waPhone}
            brandName={config.theme.brandName || "Barberly Studio"}
          />
        )}
      </body>
    </html>
  );
}
