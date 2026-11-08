import QRCode from "qrcode";
import { prisma, ensureDatabase } from "@/lib/db";
import {
  leggiOrariGiorni,
  raggruppaOrari,
  testoOrarioGiorno,
  caricaVetrinaUnificata,
} from "@/lib/anagrafica-attivita";
import {
  CartaGraficaConfig,
  DatiAttivitaCarta,
  OrarioGiornoCarta,
  normalizzaCartaGraficaConfig,
  applicaPersonalizzati,
} from "@/lib/carta-grafica-types";

const GIORNI_ORDINE: Array<{ giorno: number; label: string }> = [
  { giorno: 1, label: "LUNEDÌ" },
  { giorno: 2, label: "MARTEDÌ" },
  { giorno: 3, label: "MERCOLEDÌ" },
  { giorno: 4, label: "GIOVEDÌ" },
  { giorno: 5, label: "VENERDÌ" },
  { giorno: 6, label: "SABATO" },
  { giorno: 0, label: "DOMENICA" },
];

export async function caricaCartaGrafica(origineUrl?: string): Promise<{
  config: CartaGraficaConfig;
  attivita: DatiAttivitaCarta;
  /** Dati di Impostazioni, senza le voci cambiate solo per biglietti e buoni (serve all'editor). */
  ereditata: DatiAttivitaCarta;
}> {
  await ensureDatabase();
  const { showcase, cache, giorni } = await caricaVetrinaUnificata();

  let rawJson: Record<string, any> = {};
  try {
    if (cache?.showcaseConfig) {
      rawJson = typeof cache.showcaseConfig === "string" ? JSON.parse(cache.showcaseConfig) : cache.showcaseConfig;
    }
  } catch {
    rawJson = {};
  }

  const nome = (cache?.brandName || showcase.brandName || "La Mia Barberia").trim();
  const colorePrimario = (cache?.primaryColor || (showcase as any)?.primaryColor || "#18181b").trim();
  const coloreAccento = (cache?.accentColor || "#d97706").trim();

  const config = normalizzaCartaGraficaConfig(rawJson?.cartaGrafica, {
    defaultPreset: "HERITAGE_VINTAGE",
    coloreScuro: colorePrimario.startsWith("#") ? colorePrimario : "#18181b",
    coloreChiaro: "#EAE0D0",
    coloreDettaglio: coloreAccento.startsWith("#") ? coloreAccento : "#C9A86A",
    sottotitoloBrand: "BARBER SHOP",
  });

  const orariGiornalieri: OrarioGiornoCarta[] = GIORNI_ORDINE.map(({ giorno, label }) => {
    const g = giorni.find((x) => x.giorno === giorno);
    if (!g || !g.attivo) {
      return { giorno: label, orario: "CHIUSO", chiuso: true };
    }
    return {
      giorno: label,
      orario: testoOrarioGiorno(g),
      chiuso: false,
    };
  });

  const orariRaggruppati: OrarioGiornoCarta[] = raggruppaOrari(giorni).map((r) => ({
    giorno: r.label.toUpperCase(),
    orario: r.chiuso ? "CHIUSO" : r.orario,
    chiuso: r.chiuso,
  }));

  const sitoUrl = (origineUrl || "https://barberly.taaaac.eu").trim();
  let qrVetrinaDataUrl = "";
  try {
    qrVetrinaDataUrl = await QRCode.toDataURL(sitoUrl, { margin: 1, width: 280, errorCorrectionLevel: "M" });
  } catch {}

  const ereditata: DatiAttivitaCarta = {
    nome,
    slogan: "",
    indirizzo: (cache?.address || (showcase as any)?.contactInfo?.address || "").trim(),
    citta: "",
    telefono: (cache?.phone || (showcase as any)?.contactInfo?.phone || "").trim(),
    email: (cache?.contactEmail || (showcase as any)?.contactInfo?.email || "").trim(),
    sitoUrl,
    qrVetrinaDataUrl,
    logoUrl: cache?.logoUrl || (showcase as any)?.logoUrl || null,
    logoHeroUrl: (showcase as any)?.hero?.logoUrl || null,
    colorePrimario,
    coloreSecondario: "#EAE0D0",
    orariGiornalieri,
    orariRaggruppati,
  };

  return { config, attivita: applicaPersonalizzati(ereditata, config.personalizzati), ereditata };
}

export async function salvaCartaGrafica(nuovaConfig: unknown): Promise<CartaGraficaConfig> {
  await ensureDatabase();
  const cache = await prisma.tenantLocalCache.findUnique({ where: { id: "singleton" } });
  let rawJson: Record<string, any> = {};
  try {
    if (cache?.showcaseConfig) {
      rawJson = typeof cache.showcaseConfig === "string" ? JSON.parse(cache.showcaseConfig) : cache.showcaseConfig;
    }
  } catch {
    rawJson = {};
  }

  const configNormalizzata = normalizzaCartaGraficaConfig(nuovaConfig, {
    defaultPreset: "HERITAGE_VINTAGE",
    coloreScuro: cache?.primaryColor || "#18181b",
    coloreChiaro: "#EAE0D0",
    coloreDettaglio: cache?.accentColor || "#C9A86A",
    sottotitoloBrand: "BARBER SHOP",
  });

  rawJson.cartaGrafica = configNormalizzata;

  if (cache) {
    await prisma.tenantLocalCache.update({
      where: { id: "singleton" },
      data: { showcaseConfig: JSON.stringify(rawJson) },
    });
  }

  return configNormalizzata;
}
