import { prisma } from "./db";
import { TenantConfigResponse, TaaaacModuleKey } from "@/types/taaaac";

const FALLBACK_CONFIG: TenantConfigResponse = {
  domain:
    process.env.TAAAAC_TENANT_DOMAIN ||
    process.env.TAAAAC_DOMAIN ||
    "barberly-demo.taaaac.eu",
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
    faviconUrl: null,
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
  const domain =
    process.env.TAAAAC_TENANT_DOMAIN ||
    process.env.TAAAAC_DOMAIN ||
    "barberly-demo.taaaac.eu";
  const token =
    process.env.TAAAAC_TENANT_TOKEN ||
    process.env.TAAAAC_TOKEN ||
    "demo-token-barberly";

  let cached: any = null;
  try {
    cached = await prisma.tenantLocalCache.findUnique({
      where: { id: "singleton" },
    });
  } catch {}

  let localShowcasePhone: string | undefined;
  let localShowcaseEmail: string | undefined;
  if (cached?.showcaseConfig) {
    try {
      const sc = JSON.parse(cached.showcaseConfig);
      if (sc?.contactInfo?.phone?.trim()) localShowcasePhone = sc.contactInfo.phone.trim();
      if (sc?.contactInfo?.email?.trim()) localShowcaseEmail = sc.contactInfo.email.trim();
    } catch {}
  }

  try {
    const endpoint = `${coreUrl}/api/public/tenant-config?domain=${encodeURIComponent(
      domain
    )}&token=${encodeURIComponent(token)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const tenantNode = data?.tenant || {};
      const rawModules: string[] = Array.isArray(data?.enabledModules)
        ? data.enabledModules
        : Array.isArray(tenantNode?.moduliAttivi)
        ? tenantNode.moduliAttivi
        : FALLBACK_CONFIG.enabledModules;

      const mergedModules = Array.from(
        new Set([
          ...rawModules,
          ...(tenantNode?.whatsappEnabled ? ["WHATSAPP", "WHATSAPP_REMINDERS"] : []),
        ])
      ) as TaaaacModuleKey[];

      const resolvedPhone =
        cached?.phone ||
        localShowcasePhone ||
        data?.contact?.phone ||
        data?.phone ||
        tenantNode?.whatsappDisplayNumber ||
        FALLBACK_CONFIG.contact?.phone;

      const resolvedEmail =
        cached?.contactEmail ||
        localShowcaseEmail ||
        data?.contact?.email ||
        FALLBACK_CONFIG.contact?.email;

      const normalized: TenantConfigResponse = {
        domain:
          data?.domain ||
          (tenantNode?.sottodominio
            ? `${tenantNode.sottodominio}.taaaac.eu`
            : domain),
        licenseStatus: (data?.licenseStatus || tenantNode?.stato || "ATTIVO") as any,
        licenseExpiresAt:
          data?.licenseExpiresAt ||
          tenantNode?.dataScadenza ||
          FALLBACK_CONFIG.licenseExpiresAt,
        enabledModules: mergedModules,
        theme: {
          brandName:
            cached?.brandName ||
            data?.theme?.brandName ||
            tenantNode?.nomeAttivita ||
            FALLBACK_CONFIG.theme.brandName,
          primaryColor:
            cached?.primaryColor ||
            data?.theme?.primaryColor ||
            FALLBACK_CONFIG.theme.primaryColor,
          accentColor:
            cached?.accentColor ||
            data?.theme?.accentColor ||
            FALLBACK_CONFIG.theme.accentColor,
          logoUrl: cached?.logoUrl || data?.theme?.logoUrl || null,
          faviconUrl: cached?.faviconUrl || data?.theme?.faviconUrl || null,
        },
        contact: {
          email: resolvedEmail,
          phone: resolvedPhone,
        },
      };

      await cacheTenantLocally(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn(
      "⚠️ Taaaac Core non raggiungibile o offline, utilizzo cache locale:",
      (err as Error).message
    );
  }

  // Fallback su cache SQLite
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
        faviconUrl: cached.faviconUrl,
      },
      contact: {
        email: cached.contactEmail || localShowcaseEmail || FALLBACK_CONFIG.contact?.email,
        phone: cached.phone || localShowcasePhone || FALLBACK_CONFIG.contact?.phone,
      },
    };
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
        faviconUrl: config.theme.faviconUrl,
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
        faviconUrl: config.theme.faviconUrl,
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
