import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig, DEFAULT_BARBERLY_SHOWCASE_CONFIG } from "@/lib/showcase-defaults";
import { applicaAnagrafica, caricaVetrinaUnificata, leggiCache, leggiOrariGiorni } from "@/lib/anagrafica-attivita";

export async function GET() {
  await ensureDatabase();
  try {
    // Dati dell'attivita' e orari arrivano da Impostazioni > Bottega e dalla pagina Orari (non si modificano
    // qui); colori, logo e favicon si modificano solo nello Studio.
    const { showcase: parsed, cache: config } = await caricaVetrinaUnificata();
    if (config) {
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
    const body = await req.json();
    // Nome, indirizzo, telefono, email, descrizione e orari non si modificano dallo Studio: si riallineano sempre
    const [cacheAttuale, giorni] = await Promise.all([leggiCache(), leggiOrariGiorni()]);
    const showcaseConfig = applicaAnagrafica(parseShowcaseConfig(JSON.stringify(body)), cacheAttuale, giorni);
    showcaseConfig.about = {
      ...showcaseConfig.about,
      description: parseShowcaseConfig(cacheAttuale?.showcaseConfig).about.description,
    };
    const showcaseConfigStr = JSON.stringify(showcaseConfig);

    const updated = await prisma.tenantLocalCache.upsert({
      where: { id: "singleton" },
      update: {
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
