import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig, DEFAULT_BARBERLY_SHOWCASE_CONFIG } from "@/lib/showcase-defaults";

export async function GET() {
  await ensureDatabase();
  try {
    const config = await prisma.tenantLocalCache.findUnique({
      where: { id: "singleton" },
    });

    if (config) {
      return NextResponse.json({
        brandName: config.brandName,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        contactEmail: config.contactEmail,
        phone: config.phone,
        showcaseConfig: parseShowcaseConfig(config.showcaseConfig),
      });
    }

    return NextResponse.json({
      brandName: "Barberly Grooming Club",
      logoUrl: null,
      faviconUrl: null,
      primaryColor: "#0f172a",
      accentColor: "#d97706",
      contactEmail: "info@barberly.taaaac.eu",
      phone: "+39 02 8901 2345",
      showcaseConfig: DEFAULT_BARBERLY_SHOWCASE_CONFIG,
    });
  } catch (error) {
    console.error("Errore recupero impostazioni:", error);
    return NextResponse.json({ error: "Errore nel recupero impostazioni" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  await ensureDatabase();
  try {
    const body = await req.json();
    const { brandName, logoUrl, faviconUrl, primaryColor, accentColor, contactEmail, phone, showcaseConfig } = body;

    const showcaseConfigStr =
      showcaseConfig !== undefined
        ? typeof showcaseConfig === "string"
          ? showcaseConfig
          : JSON.stringify(showcaseConfig)
        : undefined;

    const updated = await prisma.tenantLocalCache.upsert({
      where: { id: "singleton" },
      update: {
        ...(brandName !== undefined && { brandName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(faviconUrl !== undefined && { faviconUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(phone !== undefined && { phone }),
        ...(showcaseConfigStr !== undefined && { showcaseConfig: showcaseConfigStr }),
        lastSyncedAt: new Date(),
      },
      create: {
        id: "singleton",
        domain: "barberly-demo.taaaac.eu",
        licenseStatus: "ATTIVO",
        enabledModules: "[]",
        brandName: brandName || "Barberly Grooming Club",
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor: primaryColor || "#0f172a",
        accentColor: accentColor || "#d97706",
        contactEmail: contactEmail || "info@barberly.taaaac.eu",
        phone: phone || "+39 02 8901 2345",
        showcaseConfig: showcaseConfigStr || "{}",
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        ...updated,
        showcaseConfig: parseShowcaseConfig(updated.showcaseConfig),
      },
    });
  } catch (error) {
    console.error("Errore salvataggio impostazioni:", error);
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }
}
