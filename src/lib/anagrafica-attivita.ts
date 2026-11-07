/**
 * Fonte unica dei dati dell'attività (Barberly).
 *
 * - Nome, indirizzo, telefono, email e descrizione si modificano SOLO in Impostazioni > Bottega.
 * - Gli ORARI UFFICIALI sono quelli della pagina Orari (tabella WorkingHours): la vetrina, il piè di
 *   pagina e l'invio a Google / Facebook / Instagram li leggono da lì.
 * - Colori, logo e favicon si modificano SOLO nello Studio Aspetto.
 * Lo Studio mostra questi dati in sola lettura e decide soltanto cosa far vedere (interruttori).
 */
import { prisma, ensureDatabase } from "@/lib/db";
import { parseShowcaseConfig, ShowcaseConfig } from "@/lib/showcase-defaults";
import { formatDisponibilitaToOmnichannel } from "@/lib/omnichannel-client";

export interface GiornoOrario {
  giorno: number; // 0 = Domenica ... 6 = Sabato
  oraInizio: string;
  oraFine: string;
  pausaInizio: string | null;
  pausaFine: string | null;
  attivo: boolean;
}

export interface RigaOrario {
  label: string;
  orario: string;
  chiuso: boolean;
}

const GIORNI: Array<{ giorno: number; label: string }> = [
  { giorno: 1, label: "Lunedì" },
  { giorno: 2, label: "Martedì" },
  { giorno: 3, label: "Mercoledì" },
  { giorno: 4, label: "Giovedì" },
  { giorno: 5, label: "Venerdì" },
  { giorno: 6, label: "Sabato" },
  { giorno: 0, label: "Domenica" },
];

/** Orari dei 7 giorni, con gli stessi valori predefiniti della pagina Orari quando mancano i record. */
export async function leggiOrariGiorni(): Promise<GiornoOrario[]> {
  await ensureDatabase();
  const rows = await prisma.workingHours.findMany();
  return Array.from({ length: 7 }, (_, i) => {
    const r = rows.find((x) => x.dayOfWeek === i);
    if (r) {
      return {
        giorno: i,
        oraInizio: r.startTime,
        oraFine: r.endTime,
        pausaInizio: r.breakStart,
        pausaFine: r.breakEnd,
        attivo: r.isOpen,
      };
    }
    return { giorno: i, oraInizio: "09:00", oraFine: "19:30", pausaInizio: "13:00", pausaFine: "14:00", attivo: i >= 1 && i <= 6 };
  });
}

export function testoOrarioGiorno(g: GiornoOrario): string {
  if (!g.attivo) return "Chiuso";
  if (g.pausaInizio && g.pausaFine && g.pausaInizio < g.pausaFine) {
    return `${g.oraInizio} - ${g.pausaInizio} / ${g.pausaFine} - ${g.oraFine}`;
  }
  return `${g.oraInizio} - ${g.oraFine}`;
}

/** Orari raggruppati per giorni consecutivi uguali (es. "Martedì - Venerdì: 09:00 - 13:00 / 14:30 - 19:30"). */
export function raggruppaOrari(giorni: GiornoOrario[]): RigaOrario[] {
  const righe: Array<{ da: string; a: string; orario: string; chiuso: boolean }> = [];
  for (const { giorno, label } of GIORNI) {
    const g = giorni.find((x) => x.giorno === giorno)!;
    const orario = testoOrarioGiorno(g);
    const ultima = righe[righe.length - 1];
    if (ultima && ultima.orario === orario) {
      ultima.a = label;
    } else {
      righe.push({ da: label, a: label, orario, chiuso: !g.attivo });
    }
  }
  if (righe.length === 1) return [{ label: "Tutti i giorni", orario: righe[0].orario, chiuso: righe[0].chiuso }];
  return righe.map((r) => ({
    label: r.da === r.a ? r.da : `${r.da} - ${r.a}`,
    orario: r.orario,
    chiuso: r.chiuso,
  }));
}

/** Orari ufficiali nel formato di Google Maps / Facebook / Instagram (giorni di chiusura inclusi). */
export function orariUfficialiPerCanali(giorni: GiornoOrario[]) {
  return formatDisponibilitaToOmnichannel(giorni);
}

/** Porta nella vetrina i dati dell'attività, sovrascrivendo qualunque copia vecchia salvata nello Studio. */
export function applicaAnagrafica(showcase: ShowcaseConfig, cache: any | null, giorni: GiornoOrario[]): ShowcaseConfig {
  const righe = raggruppaOrari(giorni);
  const ci: any = { ...(showcase.contactInfo || {}) };
  if (cache) {
    if (cache.address !== undefined && cache.address !== null) ci.address = cache.address;
    if (cache.phone) ci.phone = cache.phone;
    if (cache.contactEmail) ci.email = cache.contactEmail;
    if (cache.brandName) showcase.brandName = cache.brandName;
  }
  ci.hoursRows = righe;
  ci.hoursWeekday = righe.map((r) => `${r.label}: ${r.orario}`).join(" • ");
  ci.hoursWeekend = "";
  showcase.contactInfo = ci;
  return showcase;
}

export async function leggiCache(): Promise<any | null> {
  await ensureDatabase();
  return prisma.tenantLocalCache.findUnique({ where: { id: "singleton" } });
}

/** Vetrina completa e coerente: Studio + dati dell'attività + orari ufficiali. */
export async function caricaVetrinaUnificata(): Promise<{ showcase: ShowcaseConfig; cache: any | null; giorni: GiornoOrario[] }> {
  const [cache, giorni] = await Promise.all([leggiCache(), leggiOrariGiorni()]);
  const showcase = applicaAnagrafica(parseShowcaseConfig(cache?.showcaseConfig), cache, giorni);
  return { showcase, cache, giorni };
}

/** Riscrive la vetrina salvata con i dati dell'attività allineati (per chi legge direttamente il JSON salvato). */
export async function riallineaVetrinaSalvata(): Promise<void> {
  const { showcase, cache } = await caricaVetrinaUnificata();
  if (!cache) return;
  await prisma.tenantLocalCache.update({
    where: { id: "singleton" },
    data: { showcaseConfig: JSON.stringify(showcase) },
  });
}
