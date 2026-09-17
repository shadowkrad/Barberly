import { prisma } from "./db";
import { TenantConfigResponse, TaaaacModuleKey } from "@/types/taaaac";

const FALLBACK_CONFIG: TenantConfigResponse = {
  domain: process.env.TAAAAC_TENANT_DOMAIN || "barberly-demo.taaaac.eu",
  licenseStatus: "ATTIVO",
  licenseExpiresAt: "2027-12-31T23:59:59Z",
  enabledModules: [
    "WHATSAPP_REMINDERS",
    "LOYALTY_CARD",
    "ONLINE_BOOKING",
    "VENDOLY_CHANNEL_MANAGER",
  ],
  theme: {
    brandName: "Barberly Grooming Club",
    primaryColor: "#0f172a",
    accentColor: "#d97706",
    logoUrl: null,
  },
  contact: {
    email: "info@barberly.taaaac.eu",
    phone: "+39 02 8901 2345",
  },
};

/**
 * Recupera la configurazione del tenant interrogando Taaaac Core (https://taaaac.eu)
 * con fallback sulla cache SQLite locale e modalità demo/resilienza offline.
 */
export async function getTenantConfig(): Promise<TenantConfigResponse> {
  const coreUrl = process.env.TAAAAC_CORE_URL || "https://taaaac.eu";
  const domain = process.env.TAAAAC_TENANT_DOMAIN || "barberly-demo.taaaac.eu";
  const token = process.env.TAAAAC_TENANT_TOKEN || "demo-token-barberly";

  try {
    const endpoint = `${coreUrl}/api/public/tenant-config?domain=${encodeURIComponent(
      domain
    )}&token=${encodeURIComponent(token)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // cache 5 min in Next.js
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: TenantConfigResponse = await res.json();
      // Aggiorna cache locale asincronamente
      await cacheTenantLocally(data);
      return data;
    }
  } catch (err) {
    console.warn("⚠️ Taaaac Core non raggiungibile o offline, utilizzo cache locale:", (err as Error).message);
  }

  // Prova a leggere dalla cache SQLite
  try {
    const cached = await prisma.tenantLocalCache.findUnique({
      where: { id: "singleton" },
    });

    if (cached) {
      let modules: TaaaacModuleKey[] = [];
      try {
        modules = JSON.parse(cached.enabledModules);
      } catch {
        modules = FALLBACK_CONFIG.enabledModules;
      }

      return {
        domain: cached.domain,
        licenseStatus: cached.licenseStatus as any,
        enabledModules: modules,
        theme: {
          brandName: cached.brandName,
          primaryColor: cached.primaryColor,
          accentColor: cached.accentColor,
          logoUrl: cached.logoUrl,
        },
        contact: {
          email: cached.contactEmail || undefined,
          phone: cached.phone || undefined,
        },
      };
    }
  } catch (dbErr) {
    console.error("Errore lettura cache SQLite:", dbErr);
  }

  return FALLBACK_CONFIG;
}

async function cacheTenantLocally(config: TenantConfigResponse) {
  try {
    await prisma.tenantLocalCache.upsert({
      where: { id: "singleton" },
      update: {
        domain: config.domain,
        licenseStatus: config.licenseStatus,
        enabledModules: JSON.stringify(config.enabledModules),
        brandName: config.theme.brandName,
        logoUrl: config.theme.logoUrl,
        primaryColor: config.theme.primaryColor,
        accentColor: config.theme.accentColor,
        contactEmail: config.contact?.email,
        phone: config.contact?.phone,
        lastSyncedAt: new Date(),
      },
      create: {
        id: "singleton",
        domain: config.domain,
        licenseStatus: config.licenseStatus,
        enabledModules: JSON.stringify(config.enabledModules),
        brandName: config.theme.brandName,
        logoUrl: config.theme.logoUrl,
        primaryColor: config.theme.primaryColor,
        accentColor: config.theme.accentColor,
        contactEmail: config.contact?.email,
        phone: config.contact?.phone,
        lastSyncedAt: new Date(),
      },
    });
  } catch (e) {
    console.error("Impossibile salvare cache tenant su SQLite:", e);
  }
}
