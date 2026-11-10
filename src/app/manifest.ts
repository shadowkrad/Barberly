import { MetadataRoute } from "next";
import { prisma, ensureDatabase } from "@/lib/db";
import { getPwaIconVersion, pwaIconUrl } from "@/lib/pwa-icon-version";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let brandName = "Barberly";
  let themeColor = "#d97706";
  let v = "default";

  try {
    await ensureDatabase();
    const [cache, ver] = await Promise.all([
      prisma.tenantLocalCache.findUnique({
        where: { id: "singleton" },
      }),
      getPwaIconVersion(),
    ]);
    v = ver;
    if (cache?.brandName) {
      brandName = cache.brandName;
    }
    if (cache?.accentColor) {
      themeColor = cache.accentColor;
    }
  } catch (err) {
    console.error("[PWA Manifest Barberly] Fallback su default:", err);
  }

  return {
    name: `${brandName} — Gestionale Barbieri & Grooming`,
    short_name: brandName,
    description: `Modulo gestionale salone e appuntamenti per ${brandName}, parte dell'ecosistema Taaaac.`,
    start_url: "/admin",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: themeColor,
    icons: [
      {
        src: pwaIconUrl(192, v),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaIconUrl(512, v),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: pwaIconUrl(512, v, { maskable: true }),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
