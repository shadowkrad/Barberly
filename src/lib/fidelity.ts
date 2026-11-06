import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { emettiBuono } from "@/lib/buoni";

/**
 * Fidelity di Schedly: i punti vivono nel database dell'attivita', insieme ai clienti.
 * Le regole (punti per euro, bonus di benvenuto, premi) le sceglie il titolare in Impostazioni (campo fidelityRules).
 */

export interface PremioFedelta {
  id: string;
  name: string;
  pointsRequired: number;
  rewardType: "DISCOUNT" | "FREE_ITEM";
  discountAmount?: number;
  freeItemName?: string;
}

export interface RegoleFedelta {
  enabled: boolean;
  pointsPerEuro: number;
  welcomeBonusPoints: number;
  minPointsToRedeem: number;
  /** Mesi di validita' del buono generato da un premio (0 = senza scadenza). */
  rewardVoucherMonths: number;
  rewards: PremioFedelta[];
}

export type OrigineMovimento = "SPESA" | "APPUNTAMENTO" | "BENVENUTO" | "MANUALE" | "PREMIO" | "STORNO";

// Premi mostrati in Impostazioni finche' l'esercente non li modifica: devono essere gli stessi anche in cassa
const PREMI_DI_PARTENZA: PremioFedelta[] = [
  { id: "rew_b1", name: "Rifinitura Barba Express & Panno Caldo", pointsRequired: 40, rewardType: "FREE_ITEM", freeItemName: "Modellatura barba e balsamo idratante" },
  { id: "rew_b2", name: "Sconto 10€ su Taglio o Trattamento", pointsRequired: 80, rewardType: "DISCOUNT", discountAmount: 10 },
  { id: "rew_b3", name: "Taglio Barbiere Completo + Shampoo Scrub", pointsRequired: 150, rewardType: "FREE_ITEM", freeItemName: "Taglio con sfumatura e scrub cute" },
];

export async function leggiRegole(): Promise<RegoleFedelta> {
  const imp = await prisma.tenantLocalCache.findUnique({
    where: { id: "singleton" },
    select: { fidelityEnabled: true, fidelityRules: true },
  });
  let parsed: any = {};
  try {
    parsed = imp?.fidelityRules ? JSON.parse(imp.fidelityRules) : {};
  } catch {
    parsed = {};
  }
  const ppe = Number(parsed.pointsPerEuro);
  const welcome = Number(parsed.welcomeBonusPoints);
  const min = Number(parsed.minPointsToRedeem);
  return {
    enabled: Boolean(imp?.fidelityEnabled),
    pointsPerEuro: Number.isFinite(ppe) && ppe > 0 ? ppe : 1,
    welcomeBonusPoints: parsed.welcomeBonusPoints !== undefined && Number.isFinite(welcome) && welcome >= 0 ? Math.floor(welcome) : 10,
    minPointsToRedeem: parsed.minPointsToRedeem !== undefined && Number.isFinite(min) && min >= 0 ? Math.floor(min) : 40,
    rewardVoucherMonths: Number.isFinite(Number(parsed.rewardVoucherMonths)) && Number(parsed.rewardVoucherMonths) >= 0 ? Math.floor(Number(parsed.rewardVoucherMonths)) : 6,
    rewards: Array.isArray(parsed.rewards) ? parsed.rewards : PREMI_DI_PARTENZA,
  };
}

/** Punti guadagnati per un importo speso (arrotondati per difetto). */
export function puntiPerImporto(importo: number, regole: RegoleFedelta): number {
  if (!Number.isFinite(importo) || importo <= 0) return 0;
  return Math.floor(importo * regole.pointsPerEuro);
}

/** Link privato della tessera: codice lungo, non indovinabile. Si crea la prima volta che serve. */
export async function assicuraTokenTessera(clienteId: string): Promise<string> {
  const c = await prisma.client.findUnique({ where: { id: clienteId }, select: { loyaltyToken: true } });
  if (c?.loyaltyToken) return c.loyaltyToken;
  const token = randomBytes(18).toString("base64url");
  await prisma.client.update({ where: { id: clienteId }, data: { loyaltyToken: token } });
  return token;
}

interface AccreditoInput {
  clienteId: string;
  punti: number;
  origine: OrigineMovimento;
  descrizione?: string | null;
  importo?: number | null;
  appuntamentoId?: string | null;
  operatore?: string | null;
}

/**
 * Accredita punti in modo atomico. La prima volta che un cliente riceve punti aggiunge il bonus di benvenuto
 * (una sola volta, se il titolare l'ha impostato). Restituisce il nuovo saldo.
 */
export async function accreditaPunti(input: AccreditoInput, regole?: RegoleFedelta): Promise<{ saldo: number; bonusBenvenuto: number }> {
  const r = regole ?? (await leggiRegole());
  return prisma.$transaction(async (tx) => {
    const cliente = await tx.client.findUnique({ where: { id: input.clienteId }, select: { loyaltyPoints: true } });
    if (!cliente) throw new Error("Cliente non trovato");
    let saldo = cliente.loyaltyPoints;
    let bonus = 0;

    if (r.welcomeBonusPoints > 0 && input.origine !== "BENVENUTO") {
      // Bonus solo ai clienti nuovi alla fidelity: se hanno gia' movimenti di punti non si aggiunge
      const gia = await tx.movimentoPunti.count({ where: { clienteId: input.clienteId } });
      if (gia === 0 && saldo === 0) {
        bonus = r.welcomeBonusPoints;
        saldo += bonus;
        await tx.movimentoPunti.create({
          data: {
            clienteId: input.clienteId,
            punti: bonus,
            tipo: "ACCREDITO",
            origine: "BENVENUTO",
            descrizione: "Bonus di benvenuto",
            saldoDopo: saldo,
            operatore: input.operatore ?? null,
          },
        });
      }
    }

    saldo += input.punti;
    await tx.movimentoPunti.create({
      data: {
        clienteId: input.clienteId,
        punti: input.punti,
        tipo: "ACCREDITO",
        origine: input.origine,
        descrizione: input.descrizione ?? `Accredito (+${input.punti} pt)`,
        importo: input.importo ?? null,
        appuntamentoId: input.appuntamentoId ?? null,
        saldoDopo: saldo,
        operatore: input.operatore ?? null,
      },
    });
    await tx.client.update({ where: { id: input.clienteId }, data: { loyaltyPoints: saldo } });
    return { saldo, bonusBenvenuto: bonus };
  });
}

/** Riscatta un premio del titolare scalando i punti. Lancia un Error con messaggio leggibile se non si puo'. */
export async function riscattaPremio(
  clienteId: string,
  premioId: string,
  operatore?: string | null
): Promise<{ saldo: number; premio: PremioFedelta; buono: { id: string; codice: string; tokenPubblico: string | null } }> {
  const regole = await leggiRegole();
  const premio = regole.rewards.find((p) => p.id === premioId);
  if (!premio) throw new Error("Premio non trovato");
  return prisma.$transaction(async (tx) => {
    const cliente = await tx.client.findUnique({ where: { id: clienteId }, select: { loyaltyPoints: true } });
    if (!cliente) throw new Error("Cliente non trovato");
    if (cliente.loyaltyPoints < premio.pointsRequired) {
      throw new Error(`Punti insufficienti: servono ${premio.pointsRequired}, il cliente ne ha ${cliente.loyaltyPoints}`);
    }
    if (regole.minPointsToRedeem > 0 && cliente.loyaltyPoints < regole.minPointsToRedeem) {
      throw new Error(`Si può riscattare da ${regole.minPointsToRedeem} punti`);
    }
    const saldo = cliente.loyaltyPoints - premio.pointsRequired;

    // Il premio diventa un buono intestato al cliente (sconto in euro oppure servizio in omaggio),
    // nella stessa operazione che scala i punti: o succede tutto o niente.
    const buono = await emettiBuono(
      {
        motivo: "PREMIO_PUNTI",
        tipoValore: premio.rewardType === "DISCOUNT" ? "IMPORTO" : "SERVIZIO",
        importo: premio.rewardType === "DISCOUNT" ? premio.discountAmount || 0 : null,
        descrizioneServizio: premio.rewardType === "FREE_ITEM" ? premio.freeItemName || premio.name : null,
        mesiValidita: regole.rewardVoucherMonths > 0 ? regole.rewardVoucherMonths : null,
        usoParziale: false,
        clienteId,
        note: `Premio punti: ${premio.name} (${premio.pointsRequired} punti)`,
        operatore: operatore ?? null,
      },
      tx
    );

    await tx.movimentoPunti.create({
      data: {
        clienteId,
        punti: premio.pointsRequired,
        tipo: "RISCATTO",
        origine: "PREMIO",
        premioId: premio.id,
        descrizione: `Premio: ${premio.name} (buono ${buono.codice})`,
        saldoDopo: saldo,
        operatore: operatore ?? null,
      },
    });
    await tx.client.update({ where: { id: clienteId }, data: { loyaltyPoints: saldo } });
    return { saldo, premio, buono: { id: buono.id, codice: buono.codice, tokenPubblico: buono.tokenPubblico } };
  });
}

/**
 * Appuntamento portato a COMPLETATO: accredita i punti della spesa (una volta sola per appuntamento).
 * Se l'appuntamento esce da COMPLETATO, storna i punti che aveva dato. Non lancia mai errori verso il chiamante.
 */
export async function gestisciPuntiAppuntamento(opts: {
  appuntamentoId: string;
  clienteId: string;
  statoPrecedente: string;
  statoNuovo: string;
  prezzo: number | null | undefined;
}): Promise<void> {
  try {
    const regole = await leggiRegole();
    if (!regole.enabled) return;

    if (opts.statoNuovo === "COMPLETATO" && opts.statoPrecedente !== "COMPLETATO") {
      const gia = await prisma.movimentoPunti.count({
        where: { appuntamentoId: opts.appuntamentoId, origine: "APPUNTAMENTO" },
      });
      if (gia > 0) return;
      const punti = puntiPerImporto(opts.prezzo ?? 0, regole);
      if (punti <= 0) return;
      await accreditaPunti(
        {
          clienteId: opts.clienteId,
          punti,
          origine: "APPUNTAMENTO",
          importo: opts.prezzo ?? null,
          appuntamentoId: opts.appuntamentoId,
          descrizione: `Appuntamento completato (+${punti} pt)`,
        },
        regole
      );
    } else if (opts.statoPrecedente === "COMPLETATO" && opts.statoNuovo !== "COMPLETATO") {
      const dati = await prisma.movimentoPunti.findMany({
        where: { appuntamentoId: opts.appuntamentoId, origine: { in: ["APPUNTAMENTO", "STORNO"] } },
      });
      const dati_acc = dati.filter((m) => m.origine === "APPUNTAMENTO").reduce((s, m) => s + m.punti, 0);
      const stornati = dati.filter((m) => m.origine === "STORNO").reduce((s, m) => s + m.punti, 0);
      const daStornare = dati_acc - stornati;
      if (daStornare <= 0) return;
      await prisma.$transaction(async (tx) => {
        const c = await tx.client.findUnique({ where: { id: opts.clienteId }, select: { loyaltyPoints: true } });
        if (!c) return;
        const punti = Math.min(daStornare, c.loyaltyPoints);
        if (punti <= 0) return;
        const saldo = c.loyaltyPoints - punti;
        await tx.movimentoPunti.create({
          data: {
            clienteId: opts.clienteId,
            punti,
            tipo: "RISCATTO",
            origine: "STORNO",
            appuntamentoId: opts.appuntamentoId,
            descrizione: "Storno: appuntamento non più completato",
            saldoDopo: saldo,
          },
        });
        await tx.client.update({ where: { id: opts.clienteId }, data: { loyaltyPoints: saldo } });
      });
    }
  } catch (err) {
    console.error("[Fidelity] errore gestione punti appuntamento:", err);
  }
}
