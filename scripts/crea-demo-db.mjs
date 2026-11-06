// Crea il database della DEMO di Barberly (prisma/demo.db) con dati di fantasia: clienti (anche con telefono fisso),
// appuntamenti, punti fedelta', buoni di ogni tipo e buoni compleanno gia' pronti.
// Le date sono relative a OGGI (appuntamenti da -45 a +21 giorni): si rigenera quando la demo invecchia.
//
// Uso:  node scripts/crea-demo-db.mjs      (oppure: npm run demo:rigenera)
// REGOLE: prisma/template.db NON si tocca mai. I link di tessere e buoni sono derivati da nomi/codici (sempre uguali),
// cosi' una rigenerazione non rompe i link gia' inviati.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "prisma", "demo.db");
const schemaTmp = path.join(root, "prisma", ".schema-demo.prisma");

// 1) Database nuovo con le tabelle esatte dello schema (stesso schema, altro file)
for (const f of [out, `${out}-journal`]) if (fs.existsSync(f)) fs.rmSync(f);
const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8").replace(/url\s*=\s*"file:[^"]*"/, 'url      = "file:./demo.db"');
fs.writeFileSync(schemaTmp, schema);
try {
  execSync(`npx prisma db push --schema "${schemaTmp}" --skip-generate --accept-data-loss`, { cwd: root, stdio: "pipe" });
} finally {
  fs.rmSync(schemaTmp, { force: true });
}

const { PrismaClient } = await import("@prisma/client");
const sharp = (await import("sharp")).default;
const prisma = new PrismaClient({ datasources: { db: { url: `file:${out}` } } });

const tokenStabile = (seme) => createHash("sha256").update(`barberly-demo:${seme}`).digest("base64url").slice(0, 24);

// Generatore pseudo-casuale ripetibile
let seed = 20261106;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const oggi = new Date();
const giorno = (offset, ora = 0, min = 0) => new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + offset, ora, min, 0, 0);
// Data di nascita con compleanno tra `offsetGiorni` giorni da oggi (UTC mezzanotte, come la salva la scheda cliente)
const nascita = (anni, offsetGiorni) => {
  const t = giorno(offsetGiorni);
  return new Date(Date.UTC(t.getFullYear() - anni, t.getMonth(), t.getDate()));
};
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

async function main() {
  // ---- Logo di fantasia (cerchio con iniziali) ----
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><circle cx="200" cy="200" r="190" fill="#0f172a"/><circle cx="200" cy="200" r="165" fill="none" stroke="#d97706" stroke-width="8"/><text x="200" y="235" text-anchor="middle" font-family="Georgia, serif" font-size="120" fill="#d97706">BG</text></svg>`;
  const logoDemo = "data:image/png;base64," + (await sharp(Buffer.from(logoSvg)).png().toBuffer()).toString("base64");

  // ---- Impostazioni locali ----
  await prisma.tenantLocalCache.create({
    data: {
      id: "singleton",
      domain: "barberly-demo.taaaac.eu",
      licenseStatus: "ATTIVO",
      enabledModules: JSON.stringify(["WHATSAPP_REMINDERS", "LOYALTY_CARD", "GIFT_CARDS", "ONLINE_BOOKING", "VENDOLY_CHANNEL_MANAGER"]),
      brandName: "Barberly Grooming Club",
      logoUrl: logoDemo,
      primaryColor: "#0f172a",
      accentColor: "#d97706",
      contactEmail: "info@barberly.taaaac.eu",
      phone: "0575 000200",
      address: "Via Roma 42 — Arezzo (AR)",
      fidelityEnabled: true,
      fidelityRules: JSON.stringify({
        enabled: true,
        pointsPerEuro: 1,
        welcomeBonusPoints: 10,
        minPointsToRedeem: 40,
        rewardVoucherMonths: 6,
        compleanno: { enabled: true, tipoValore: "PERCENTUALE", percentuale: 20, giorniAnticipo: 7, validitaGiorni: 30, spesaMinima: 20, inviaEmail: true },
        rewards: [
          { id: "rew_b1", name: "Rifinitura barba express omaggio", pointsRequired: 40, rewardType: "FREE_ITEM", freeItemName: "Rifinitura barba express" },
          { id: "rew_b2", name: "Sconto 10 € su taglio o trattamento", pointsRequired: 80, rewardType: "DISCOUNT", discountAmount: 10 },
          { id: "rew_b3", name: "Taglio completo + scrub omaggio", pointsRequired: 150, rewardType: "FREE_ITEM", freeItemName: "Taglio completo con scrub cute" },
        ],
      }),
    },
  });

  // ---- Barbieri e servizi ----
  const barbieri = [];
  for (const [id, name, nickname, color] of [
    ["b1", "Marco Rossi", "The Blade", "#d97706"],
    ["b2", "Luca Fontana", "Razor Master", "#2563eb"],
    ["b3", "Matteo Conti", "Fade Specialist", "#059669"],
  ]) {
    barbieri.push(await prisma.barber.create({ data: { id, name, nickname, email: `${name.split(" ")[0].toLowerCase()}@barberly.it`, color, isActive: true } }));
  }
  const servizi = [];
  let ordine = 1;
  for (const [id, name, descr, min, price, category] of [
    ["s1", "Taglio Sartoriale Barberly", "Taglio personalizzato, lavaggio con massaggio cute e styling finale.", 35, 28, "HAIR"],
    ["s2", "Rituale Barba Tradizionale", "Rasatura con panno caldo, oli essenziali e balsamo.", 25, 20, "BEARD"],
    ["s3", "Combo VIP (Taglio + Rituale Barba)", "Esperienza completa di grooming e relax.", 60, 44, "COMBO"],
    ["s4", "Modellatura Barba Express", "Rifinitura contorni e sfumatura barba veloce.", 15, 14, "BEARD"],
    ["s5", "Trattamento Cute & Scrub", "Scrub purificante al sale marino e lozione rinfrescante.", 20, 18, "TREATMENT"],
    ["s6", "Taglio Bimbo", "Taglio rapido per i piu' piccoli.", 25, 16, "HAIR"],
  ]) {
    servizi.push(await prisma.service.create({ data: { id, name, description: descr, durationMinutes: min, price, category, color: "#d97706", order: ordine++, isActive: true } }));
  }

  // ---- Clienti (numeri finti; alcuni fissi, formati misti, compleanni vicini) ----
  const clienti = [
    ["Alessandro", "Bianchi", "3331122334", "alessandro.b@example.com", nascita(34, 2)],
    ["Davide", "Moretti", "3499988776", "d.moretti@example.com", nascita(29, 6)],
    ["Federico", "Galli", "3285544332", "fedegalli@example.com", nascita(41, 12)],
    ["Marco", "Brambilla", "3407766554", null, nascita(37, 25)],
    ["Lorenzo", "Ricci", "3471144778", "lorenzo.ricci@example.com", nascita(26, -3)],
    ["Gabriele", "Colombo", "3398822114", "gabry.colombo@example.com", nascita(23, 40)],
    ["Simone", "Fabbri", "3201000107", null, nascita(31, 90)],
    ["Andrea", "Costa", "3201000108", "andrea.costa@example.com", nascita(28, 150)],
    ["Riccardo", "Giuliani", "3201000109", null, nascita(45, 200)],
    ["Stefano", "Marchetti", "3201000110", "stefano.m@example.com", nascita(52, 300)],
    ["Luca", "Pellegrini", "3201000111", null, nascita(19, 1)],
    ["Matteo", "Serra", "3201000112", "matteo.serra@example.com", null],
    ["Paolo", "Valentini", "3201000113", null, null],
    ["Giacomo", "Neri", "3201000114", "giacomo.neri@example.com", nascita(33, 60)],
    ["Nicola", "Barbieri", "3201000115", null, null],
    ["Emanuele", "Sartori", "3201000116", "ema.sartori@example.com", nascita(24, 120)],
    ["Antonio", "Bartolini", "0575100201", null, nascita(71, 18)],
    ["Giovanni", "Cecchi", "0575100202", null, nascita(68, 60)],
    ["Franco", "Lucherini", "0575100203", null, nascita(75, 5)],
    ["Mario", "Pieri", "0575100204", "mario.pieri@example.com", nascita(66, 220)],
    ["Tommaso", "Rossetti", "+39 320 100 0121", "tommaso.r@example.com", nascita(27, 75)],
    ["Filippo", "Conti", "0039 3201000122", null, null],
    ["Daniele", "Mancini", "320-1000123", "daniele.m@example.com", null],
    ["Claudio", "Ferri", "3201000124", null, null],
    ["Alberto", "Rinaldi", "3201000125", "alberto.r@example.com", nascita(38, 33)],
    ["Michele", "Donati", "3201000126", null, null],
    ["Enrico", "Bellini", "3201000127", "enrico.bellini@example.com", nascita(35, 180)],
    ["Roberto", "Vitale", "3201000128", null, null],
    ["Sergio", "Gentili", "3201000129", null, null],
    ["Fabio", "Lombardi", "32010", null, null], // numero incompleto: "Da verificare"
  ];
  const note = ["Sfumatura bassa e forbice a lama piena.", "Pelle sensibile, usare panno tiepido.", "Barba lunga squadrata ben definita.", "Combo VIP ogni 3 settimane.", "Primo taglio, consulenza stile.", null, null, null];
  const creati = [];
  for (const [firstName, lastName, phone, email, birthDate] of clienti) {
    const c = await prisma.client.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        birthDate,
        notes: pick(note),
        privacyConsent: true,
        marketingConsent: rnd() > 0.4,
        loyaltyToken: tokenStabile(`tessera:${firstName}|${lastName}`),
      },
    });
    creati.push(c);
  }

  // ---- Appuntamenti ----
  const punti = new Map();
  const ultimaVisita = new Map();
  let contaAppt = 0;
  const creaAppuntamento = async (cliente, offset, stato) => {
    const barbiere = pick(barbieri);
    const servizio = pick(servizi);
    const inizio = 9 * 60 + Math.floor(rnd() * 18) * 30; // 09:00 .. 17:30
    const appt = await prisma.appointment.create({
      data: {
        id: `demo_appt_${++contaAppt}`,
        barberId: barbiere.id,
        clientId: cliente.id,
        serviceId: servizio.id,
        date: giorno(offset),
        startTime: hhmm(inizio),
        endTime: hhmm(inizio + servizio.durationMinutes),
        status: stato,
        channel: pick(["WEB", "PHONE", "WALK_IN", "WHATSAPP"]),
        pricePaid: stato === "COMPLETED" ? servizio.price : null,
      },
    });
    if (stato === "COMPLETED") {
      const p = Math.round(servizio.price);
      punti.set(cliente.id, (punti.get(cliente.id) || 0) + p);
      await prisma.movimentoPunti.create({
        data: {
          clienteId: cliente.id,
          punti: p,
          tipo: "ACCREDITO",
          origine: "APPUNTAMENTO",
          appuntamentoId: appt.id,
          importo: servizio.price,
          saldoDopo: punti.get(cliente.id),
          descrizione: `${servizio.name} (${servizio.price} €)`,
          createdAt: giorno(offset, 12),
        },
      });
      const prima = ultimaVisita.get(cliente.id);
      if (!prima || offset > prima) ultimaVisita.set(cliente.id, offset);
    }
  };
  const statiPassati = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "CANCELLED", "NO_SHOW"];
  for (const c of creati) {
    const n = 1 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) await creaAppuntamento(c, -(1 + Math.floor(rnd() * 45)), pick(statiPassati));
  }
  for (const c of creati) {
    if (rnd() < 0.7) await creaAppuntamento(c, Math.floor(rnd() * 21), pick(["CONFIRMED", "CONFIRMED", "PENDING"]));
  }
  for (let i = 0; i < 5; i++) await creaAppuntamento(creati[i], 0, "CONFIRMED"); // oggi

  // ---- Punti: un premio riscattato per chi ne ha abbastanza ----
  for (const c of creati) {
    let tot = punti.get(c.id) || 0;
    if (tot >= 100 && rnd() > 0.5) {
      await prisma.movimentoPunti.create({
        data: {
          clienteId: c.id,
          punti: 40,
          tipo: "RISCATTO",
          origine: "PREMIO",
          premioId: "rew_b1",
          saldoDopo: tot - 40,
          descrizione: "Premio: Rifinitura barba express omaggio",
          createdAt: giorno(-3),
        },
      });
      tot -= 40;
    }
    await prisma.client.update({ where: { id: c.id }, data: { loyaltyPoints: tot } });
  }

  // ---- Buoni di esempio: un po' di tutti i tipi ----
  // [codice, motivo, tipoValore, importo, residuo, percentuale, servizio, giorniScadenza (null = senza), indiceCliente, acquirente, beneficiario, messaggio, spesaMinima, usoParziale, note, stato]
  const buoni = [
    ["BUO-DEMO1-REGAL", "REGALO", "IMPORTO", 50, 50, null, null, 120, null, "Giulia Moretti", "Marco Rossi", "Buon compleanno!", null, true, null, "ATTIVA"],
    ["BUO-DEMO2-REGAL", "REGALO", "IMPORTO", 100, 60, null, null, 90, null, "Paola Rinaldi", "Andrea Ferrara", "Per te, con affetto", null, true, null, "ATTIVA"],
    ["BUO-DEMO3-COMPE", "COMPENSAZIONE", "IMPORTO", 15, 15, null, null, null, 2, "", "", null, null, false, "Attesa troppo lunga dello scorso appuntamento", "ATTIVA"],
    ["BUO-DEMO5-SERVI", "GESTO_COMMERCIALE", "SERVIZIO", 0, 0, null, "Rituale barba tradizionale", 60, 7, "", "", null, null, false, "Cliente fedele da 3 anni", "ATTIVA"],
    ["BUO-DEMO6-PUNTI", "PREMIO_PUNTI", "IMPORTO", 10, 10, null, null, 14, 9, "", "", null, null, false, "Premio punti: Sconto 10 € (80 punti)", "ATTIVA"],
    ["BUO-DEMO7-SCADU", "SCONTO", "IMPORTO", 15, 15, null, null, -10, null, "", "", null, null, true, "Promozione di ottobre", "ATTIVA"],
    ["BUO-DEMO8-USATO", "REGALO", "IMPORTO", 30, 0, null, null, 200, null, "Anna Neri", "Luca Verdi", null, null, true, null, "RISCATTATA"],
  ];
  for (const [codice, motivo, tipoValore, importo, residuo, percentuale, servizio, giorniScad, idx, acquirente, beneficiario, messaggio, spesaMinima, usoParziale, nota, stato] of buoni) {
    const cl = idx != null ? creati[idx] : null;
    const g = await prisma.giftCard.create({
      data: {
        codice,
        tokenPubblico: tokenStabile(`buono:${codice}`),
        motivo,
        tipoValore,
        importoIniziale: importo,
        saldoResiduo: residuo,
        percentuale,
        descrizioneServizio: servizio,
        clienteId: cl ? cl.id : null,
        spesaMinima,
        usoParziale,
        note: nota,
        acquirenteNome: acquirente,
        beneficiarioNome: beneficiario || (cl ? `${cl.firstName} ${cl.lastName}` : ""),
        beneficiarioMessaggio: messaggio,
        dataScadenza: giorniScad == null ? null : giorno(giorniScad),
        stato,
        creatoDa: "Staff",
      },
    });
    await prisma.movimentoGiftCard.create({
      data: { giftCardId: g.id, tipo: "EMISSIONE", importo, saldoDopo: importo, operatore: "Staff", note: "Emesso", createdAt: giorno(-20) },
    });
    if (tipoValore === "IMPORTO" && residuo < importo) {
      await prisma.movimentoGiftCard.create({
        data: { giftCardId: g.id, tipo: "USO", importo: importo - residuo, saldoDopo: residuo, operatore: "Staff", note: `Sconto di ${(importo - residuo).toFixed(2)} € in cassa`, createdAt: giorno(-8) },
      });
    }
  }

  // ---- Buoni compleanno "automatici" gia' creati per chi compie gli anni nei prossimi 7 giorni ----
  // (nella demo ogni copia del database e' separata: creandoli qui restano uguali ovunque e l'automatismo non crea doppioni)
  for (const c of creati) {
    if (!c.birthDate) continue;
    const inizioOggi = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());
    let comp = new Date(oggi.getFullYear(), c.birthDate.getUTCMonth(), c.birthDate.getUTCDate());
    if (comp < inizioOggi) comp = new Date(oggi.getFullYear() + 1, c.birthDate.getUTCMonth(), c.birthDate.getUTCDate());
    if (comp > new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + 7)) continue;
    const codice = `BUO-COMP-${c.firstName.slice(0, 3).toUpperCase()}${comp.getFullYear()}`;
    const g = await prisma.giftCard.create({
      data: {
        codice,
        tokenPubblico: tokenStabile(`buono:${codice}`),
        motivo: "COMPLEANNO",
        tipoValore: "PERCENTUALE",
        importoIniziale: 0,
        saldoResiduo: 0,
        percentuale: 20,
        clienteId: c.id,
        spesaMinima: 20,
        usoParziale: false,
        note: `Buono compleanno ${comp.getFullYear()} (automatico)`,
        acquirenteNome: "Attività",
        beneficiarioNome: `${c.firstName} ${c.lastName}`,
        dataScadenza: new Date(comp.getTime() + 30 * 86400000),
        stato: "ATTIVA",
        creatoDa: "Automatico",
      },
    });
    await prisma.movimentoGiftCard.create({
      data: { giftCardId: g.id, tipo: "EMISSIONE", importo: 0, saldoDopo: 0, operatore: "Automatico", note: "Emesso: Buono compleanno", createdAt: giorno(-1) },
    });
    if (c.email && c.marketingConsent) {
      await prisma.movimentoGiftCard.create({
        data: { giftCardId: g.id, tipo: "INVIO", importo: 0, saldoDopo: 0, operatore: "Automatico", note: `Email simulata (demo) a ${c.email}`, createdAt: giorno(-1) },
      });
    }
  }

  const [nc, na, nm] = await Promise.all([prisma.client.count(), prisma.appointment.count(), prisma.movimentoPunti.count()]);
  console.log(`Demo creata: ${out}`);
  console.log(`Barbieri ${barbieri.length} | Servizi ${servizi.length} | Clienti ${nc} | Appuntamenti ${na} | Movimenti punti ${nm}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
