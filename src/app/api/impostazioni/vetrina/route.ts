import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig, DEFAULT_BARBERLY_SHOWCASE_CONFIG } from "@/lib/showcase-defaults";

export async function GET() {
  await ensureDatabase();
  try {
    const config = await prisma.tenantLocalCache.findUnique({
      where: { id: "singleton" },
    });

    const parsed = parseShowcaseConfig(config?.showcaseConfig);
    // Assicuriamoci che brandName e colori siano sincronizzati
    if (config) {
      if (config.brandName) parsed.brandName = config.brandName;
      if (config.primaryColor) parsed.primaryColor = config.primaryColor;
      if (config.accentColor) parsed.accentColor = config.accentColor;
      if (config.logoUrl !== undefined) parsed.logoUrl = config.logoUrl;
      if (config.faviconUrl !== undefined) parsed.faviconUrl = config.faviconUrl;
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Errore recupero configurazione vetrina:", error);
    return NextResponse.json(DEFAULT_BARBERLY_SHOWCASE_CONFIG);
  }
}

export async function PUT(req: NextRequest) {
  await ensureDatabase();
  try {
    const showcaseConfig = await req.json();
    const showcaseConfigStr = JSON.stringify(showcaseConfig);

    const updated = await prisma.tenantLocalCache.upsert({
      where: { id: "singleton" },
      update: {
        ...(showcaseConfig.brandName && { brandName: showcaseConfig.brandName }),
        ...(showcaseConfig.primaryColor && { primaryColor: showcaseConfig.primaryColor }),
        ...(showcaseConfig.accentColor && { accentColor: showcaseConfig.accentColor }),
        ...(showcaseConfig.logoUrl !== undefined && { logoUrl: showcaseConfig.logoUrl }),
        ...(showcaseConfig.faviconUrl !== undefined && { faviconUrl: showcaseConfig.faviconUrl }),
        showcaseConfig: showcaseConfigStr,
        lastSyncedAt: new Date(),
      },
      create: {
        id: "singleton",
        domain: "barberly-demo.taaaac.eu",
        licenseStatus: "ATTIVO",
        enabledModules: "[]",
        brandName: showcaseConfig.brandName || "Barberly Grooming Club",
        primaryColor: showcaseConfig.primaryColor || "#0f172a",
        accentColor: showcaseConfig.accentColor || "#d97706",
        logoUrl: showcaseConfig.logoUrl || null,
        faviconUrl: showcaseConfig.faviconUrl || null,
        contactEmail: "info@barberly.taaaac.eu",
        phone: "+39 02 8901 2345",
        showcaseConfig: showcaseConfigStr,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      config: parseShowcaseConfig(updated.showcaseConfig),
    });
  } catch (error) {
    console.error("Errore salvataggio vetrina:", error);
    return NextResponse.json({ error: "Errore salvataggio vetrina" }, { status: 500 });
  }
}
