import { NextRequest, NextResponse } from "next/server";
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig, DEFAULT_BARBERLY_SHOWCASE_CONFIG } from "@/lib/showcase-defaults";
import { fetchTenantConfig } from "@/lib/taaaac-client";
import { caricaVetrinaUnificata, riallineaVetrinaSalvata } from "@/lib/anagrafica-attivita";

/**
 * Telegram è gestito da Taaaac Core: qui si legge solo lo stato (mai token né chat ID).
 */
async function getTelegramHub() {
  try {
    const cfg = await fetchTenantConfig();
    return {
      managedByCore: true,
      enabled: Boolean(cfg.telegramEnabled),
      botUsername: cfg.telegramBotUsername || "",
      staffAlerts: cfg.telegramAutoConfirm !== false,
      reminder24h: cfg.telegramAutoReminder24h !== false,
    };
  } catch {
    return { managedByCore: true, enabled: false, botUsername: "", staffAlerts: true, reminder24h: true };
  }
}

export async function GET() {
  await ensureDatabase();
  try {
    const config = await prisma.tenantLocalCache.findUnique({
      where: { id: "singleton" },
    });

    let fidelityRules = null;
    try {
      if (config?.fidelityRules) {
        fidelityRules = JSON.parse(config.fidelityRules);
      }
    } catch {
      fidelityRules = null;
    }

    if (config) {
      const { showcase: vetrinaUnificata } = await caricaVetrinaUnificata();
      return NextResponse.json({
        brandName: config.brandName,
        address: config.address,
        descrizione: vetrinaUnificata.about.description,
        logoUrl: config.logoUrl,
        faviconUrl: config.faviconUrl,
        primaryColor: config.primaryColor,
        accentColor: config.accentColor,
        contactEmail: config.contactEmail,
        phone: config.phone,
        showcaseConfig: vetrinaUnificata,
        telegramHub: await getTelegramHub(),
        fidelitySettings: {
          enabled: Boolean(config.fidelityEnabled),
          pointsPerEuro: fidelityRules?.pointsPerEuro || 1,
          welcomeBonusPoints: fidelityRules?.welcomeBonusPoints || 10,
          minPointsToRedeem: fidelityRules?.minPointsToRedeem || 40,
          rewardVoucherMonths: fidelityRules?.rewardVoucherMonths ?? 6,
          compleanno: fidelityRules?.compleanno,
          rewards: fidelityRules?.rewards || [
            { id: "rew_b1", name: "Rifinitura Barba Express & Panno Caldo", pointsRequired: 40, rewardType: "FREE_ITEM", freeItemName: "Modellatura barba e balsamo idratante" },
            { id: "rew_b2", name: "Sconto 10€ su Taglio o Trattamento", pointsRequired: 80, rewardType: "DISCOUNT", discountAmount: 10 },
            { id: "rew_b3", name: "Taglio Barbiere Completo + Shampoo Scrub", pointsRequired: 150, rewardType: "FREE_ITEM", freeItemName: "Taglio con sfumatura e scrub cute" },
          ],
        },
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
      telegramHub: await getTelegramHub(),
      fidelitySettings: {
        enabled: false,
        pointsPerEuro: 1,
        welcomeBonusPoints: 10,
        minPointsToRedeem: 40,
        rewards: [],
      },
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
    const { brandName, logoUrl, faviconUrl, primaryColor, accentColor, contactEmail, phone, address, descrizione, showcaseConfig, fidelitySettings } = body;

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
        ...(address !== undefined && { address: String(address) }),
        ...(showcaseConfigStr !== undefined && { showcaseConfig: showcaseConfigStr }),
        ...(fidelitySettings?.enabled !== undefined && { fidelityEnabled: Boolean(fidelitySettings.enabled) }),
        ...(fidelitySettings !== undefined && { fidelityRules: JSON.stringify(fidelitySettings) }),
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
        ...(address !== undefined && { address: String(address) }),
        showcaseConfig: showcaseConfigStr || "{}",
        fidelityEnabled: Boolean(fidelitySettings?.enabled),
        fidelityRules: fidelitySettings ? JSON.stringify(fidelitySettings) : "{}",
        lastSyncedAt: new Date(),
      },
    });

    // La descrizione dell'attivita' vive nella vetrina salvata (about.description) ma si modifica solo da qui
    if (descrizione !== undefined) {
      const sc = parseShowcaseConfig(updated.showcaseConfig);
      sc.about = { ...sc.about, description: String(descrizione) };
      await prisma.tenantLocalCache.update({
        where: { id: "singleton" },
        data: { showcaseConfig: JSON.stringify(sc) },
      });
    }
    // Allinea la copia salvata della vetrina ai dati dell'attivita' appena salvati
    if ([brandName, contactEmail, phone, address, descrizione, showcaseConfigStr].some((v) => v !== undefined)) {
      await riallineaVetrinaSalvata();
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Errore salvataggio impostazioni:", error);
    return NextResponse.json({ error: "Errore durante il salvataggio" }, { status: 500 });
  }
}
