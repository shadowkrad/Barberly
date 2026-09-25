import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💈 Seeding Barberly database...");

  // Pulisci i dati esistenti
  await prisma.appointment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.tenantLocalCache.deleteMany();

  // Tenant Config Iniziale (cache)
  await prisma.tenantLocalCache.create({
    data: {
      id: "singleton",
      domain: "barberly-demo.taaaac.eu",
      licenseStatus: "ATTIVO",
      enabledModules: JSON.stringify([
        "WHATSAPP_REMINDERS",
        "LOYALTY_CARD",
        "ONLINE_BOOKING",
        "VENDOLY_CHANNEL_MANAGER",
      ]),
      brandName: "Barberly Grooming Club",
      logoUrl: null,
      primaryColor: "#0f172a",
      accentColor: "#d97706",
      contactEmail: "info@barberly.taaaac.eu",
      phone: "+39 02 8901 2345",
    },
  });

  // Verifica modalità Produzione vs Demo (Issue #17)
  const isDemo = process.env.IS_DEMO === "true" || (process.env.NODE_ENV !== "production" && process.env.IS_DEMO !== "false");

  if (!isDemo) {
    console.log("🔒 Modalità PRODUZIONE rilevata (IS_DEMO=false): database vergine inizializzato senza barbieri, clienti o appuntamenti demo.");
    console.log("✅ Seed completato con successo (Zero Mock Data per produzione GDPR compliant)!");
    return;
  }

  console.log("✨ Modalità DEMO attiva: inserimento barbieri, servizi, clienti ed appuntamenti di prova...");

  // Barbieri
  const marco = await prisma.barber.create({
    data: {
      name: "Marco Rossi",
      nickname: "The Blade",
      email: "marco@barberly.it",
      phone: "+39 340 1234567",
      isActive: true,
    },
  });

  const luca = await prisma.barber.create({
    data: {
      name: "Luca Fontana",
      nickname: "Razor Master",
      email: "luca@barberly.it",
      phone: "+39 348 7654321",
      isActive: true,
    },
  });

  // Servizi
  const serviceHair = await prisma.service.create({
    data: {
      name: "Taglio Sartoriale Barberly",
      description: "Taglio personalizzato, lavaggio con massaggio cute e styling finale.",
      durationMinutes: 35,
      price: 28.0,
      category: "HAIR",
    },
  });

  const serviceBeard = await prisma.service.create({
    data: {
      name: "Rituale Barba Tradizionale",
      description: "Rasatura con panno caldo/freddo, oli essenziali e balsamo ammorbidente.",
      durationMinutes: 25,
      price: 20.0,
      category: "BEARD",
    },
  });

  const serviceCombo = await prisma.service.create({
    data: {
      name: "Combo Vip (Taglio + Rituale Barba)",
      description: "L'esperienza completa Barberly di grooming e relax a 360°.",
      durationMinutes: 60,
      price: 44.0,
      category: "COMBO",
    },
  });

  // Clienti
  const client1 = await prisma.client.create({
    data: {
      firstName: "Alessandro",
      lastName: "Bianchi",
      phone: "+39 333 1122334",
      email: "alessandro.b@email.it",
      loyaltyPoints: 120,
      notes: "Preferisce sfumatura bassa e forbice a lama piena.",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: "Davide",
      lastName: "Moretti",
      phone: "+39 349 9988776",
      email: "d.moretti@email.com",
      loyaltyPoints: 45,
      notes: "Pelle sensibile, usare panno tiepido.",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: "Federico",
      lastName: "Galli",
      phone: "+39 328 5544332",
      email: "fedegalli@gmail.com",
      loyaltyPoints: 80,
      notes: "Barba lunga squadrata con linea guancia definita.",
    },
  });

  // Appuntamenti Odierni
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        barberId: marco.id,
        clientId: client1.id,
        serviceId: serviceHair.id,
        date: today,
        startTime: "09:30",
        endTime: "10:05",
        status: "COMPLETED",
        pricePaid: 28.0,
        notes: "Completato e saldato.",
      },
      {
        barberId: luca.id,
        clientId: client2.id,
        serviceId: serviceCombo.id,
        date: today,
        startTime: "10:30",
        endTime: "11:30",
        status: "CONFIRMED",
        pricePaid: 44.0,
        notes: "In arrivo a breve, promemoria WhatsApp inviato.",
      },
      {
        barberId: marco.id,
        clientId: client3.id,
        serviceId: serviceBeard.id,
        date: today,
        startTime: "11:45",
        endTime: "12:10",
        status: "CONFIRMED",
        pricePaid: 20.0,
        notes: "Cliente storico con tessera fedeltà attiva.",
      },
      {
        barberId: luca.id,
        clientId: client1.id,
        serviceId: serviceHair.id,
        date: today,
        startTime: "15:00",
        endTime: "15:35",
        status: "CONFIRMED",
        pricePaid: 28.0,
      },
    ],
  });

  console.log("✅ Seed completato con successo!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
